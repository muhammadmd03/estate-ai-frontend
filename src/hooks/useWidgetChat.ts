'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatMessage, AnalysisResult, ApiProperty, WidgetConfig } from '@/types';
import { initialMessages } from '@/lib/mockData';

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

// ── Param types ──────────────────────────────────────────────────────────────

interface WidgetChatParams {
    clientId: string;
    apiKey: string;
}

// Default branding used while the config is loading or if the request fails
const DEFAULT_AGENCY_NAME = 'AI Assistant';
const DEFAULT_BRAND_COLOR  = '#2563eb';
const DEFAULT_WELCOME_MSG  = 'Hi 👋 How can I help you find your dream property?';

/**
 * A configurable variant of useChat that accepts client_id and api_key as
 * parameters. The original useChat hook is NOT modified; this hook is used
 * exclusively by the embeddable widget.
 */
export function useWidgetChat({ clientId, apiKey }: WidgetChatParams) {
    // ── Chat state ───────────────────────────────────────────────────────────
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [isTyping, setIsTyping] = useState(false);
    const [shownPropertyIds, setShownPropertyIds] = useState<string[]>([]);
    const [apiProperties, setApiProperties] = useState<ApiProperty[]>([]);
    const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(null);
    const [threadId, setThreadId] = useState<string>('');
    const [userId, setUserId] = useState<string>('');

    // ── Branding / config state ──────────────────────────────────────────────
    const [agencyName, setAgencyName] = useState(DEFAULT_AGENCY_NAME);
    const [brandColor, setBrandColor] = useState(DEFAULT_BRAND_COLOR);
    const [welcomeMessage, setWelcomeMessage] = useState(DEFAULT_WELCOME_MSG);
    const [widgetPosition, setWidgetPosition] = useState<'left' | 'right'>('right');
    const [configLoading, setConfigLoading] = useState(true);

    // Prevent multiple simultaneous config fetches
    const configFetchedRef = useRef(false);

    // ── Session IDs (persisted per browser) ─────────────────────────────────
    useEffect(() => {
        let uid = localStorage.getItem('widget_user_id');
        if (!uid) {
            uid = crypto.randomUUID();
            localStorage.setItem('widget_user_id', uid);
        }
        setUserId(uid);

        let th = localStorage.getItem('widget_thread_id');
        if (!th) {
            th = crypto.randomUUID();
            localStorage.setItem('widget_thread_id', th);
        }
        setThreadId(th);
    }, []);

    // ── Load widget branding from backend ────────────────────────────────────
    useEffect(() => {
        if (!clientId || configFetchedRef.current) return;
        configFetchedRef.current = true;

        (async () => {
            try {
                const res = await fetch(`/api/widget-config/${encodeURIComponent(clientId)}`);
                if (!res.ok) throw new Error(`widget-config returned ${res.status}`);

                const config: WidgetConfig = await res.json();

                if (config.agency_name)    setAgencyName(config.agency_name);
                if (config.brand_color)    setBrandColor(config.brand_color);
                if (config.widget_position) {
                    setWidgetPosition(
                        config.widget_position.toLowerCase() === 'left' ? 'left' : 'right'
                    );
                }

                // Replace the initial chat bubble with the agency's custom welcome message
                const msg = config.welcome_message ?? DEFAULT_WELCOME_MSG;
                if (config.welcome_message) setWelcomeMessage(msg);
                setMessages((prev) => [
                    {
                        ...prev[0],
                        content: msg,
                    },
                    ...prev.slice(1),
                ]);
            } catch (err) {
                // Silently fall back to defaults; widget is still functional
                console.warn('[useWidgetChat] Failed to load widget config:', err);
            } finally {
                setConfigLoading(false);
            }
        })();
    }, [clientId]);

    // ── Send message ─────────────────────────────────────────────────────────
    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim()) return;

            const userMsg: ChatMessage = {
                id: generateId(),
                role: 'user',
                content: content.trim(),
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setIsTyping(true);

            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        client_id: clientId,
                        api_key:   apiKey,
                        user_id:   userId,
                        thread_id: threadId,
                        message:   content.trim(),
                    }),
                });

                const data = await res.json();

                if (!res.ok || data.error) {
                    const errorMsg: ChatMessage = {
                        id: generateId(),
                        role: 'ai',
                        content:
                            data.reply ??
                            "⚠️ I'm having trouble connecting to the AI service right now. Please make sure the backend is running and try again.",
                        timestamp: new Date(),
                        isError: true,
                    };
                    setMessages((prev) => [...prev, errorMsg]);
                    return;
                }

                const comparisonKeywords = [
                    'compare', 'comparison', 'vs', 'versus', 'difference between',
                    'side by side', 'side-by-side', 'which is better', 'which one is better',
                ];
                const isComparisonIntent = comparisonKeywords.some((kw) =>
                    content.toLowerCase().includes(kw)
                );
                const isComparison =
                    isComparisonIntent &&
                    Array.isArray(data.properties) &&
                    data.properties.length >= 2;

                const aiMsg: ChatMessage = {
                    id: generateId(),
                    role: 'ai',
                    content: data.reply,
                    timestamp: new Date(),
                    showProperties: data.properties && !isComparison ? true : false,
                    showComparison: isComparison,
                    showAnalysis: data.analysis ? true : false,
                    analysisData: data.analysis ?? undefined,
                    propertyIds: data.properties
                        ? data.properties.map((p: ApiProperty) => p.property_id)
                        : undefined,
                    apiProperties: data.properties ?? undefined,
                };

                if (data.properties) {
                    setShownPropertyIds(data.properties.map((p: ApiProperty) => p.property_id));
                    setApiProperties((prev) => {
                        const map = new Map(prev.map((p) => [p.property_id, p]));
                        (data.properties as ApiProperty[]).forEach((p) => {
                            const existing = map.get(p.property_id);
                            map.set(p.property_id, {
                                ...existing,
                                ...p,
                                image_url: p.image_url ?? existing?.image_url,
                            });
                        });
                        return Array.from(map.values());
                    });
                }

                if (data.analysis) {
                    setActiveAnalysis(data.analysis);
                }

                setMessages((prev) => [...prev, aiMsg]);
            } catch (error) {
                console.error('Widget chat error:', error);
                const errorMsg: ChatMessage = {
                    id: generateId(),
                    role: 'ai',
                    content:
                        '⚠️ Unable to reach the AI service. Please check that the backend server is running and try again.',
                    timestamp: new Date(),
                    isError: true,
                };
                setMessages((prev) => [...prev, errorMsg]);
            } finally {
                setIsTyping(false);
            }
        },
        [clientId, apiKey, userId, threadId]
    );

    // ── Clear chat ───────────────────────────────────────────────────────────
    const clearChat = useCallback(() => {
        const newThreadId = crypto.randomUUID();
        localStorage.setItem('widget_thread_id', newThreadId);
        setThreadId(newThreadId);
        setMessages(initialMessages);
        setShownPropertyIds([]);
        setApiProperties([]);
        setActiveAnalysis(null);
    }, []);

    return {
        // Chat
        messages,
        isTyping,
        shownPropertyIds,
        apiProperties,
        activeAnalysis,
        sendMessage,
        clearChat,
        setActiveAnalysis,
        setShownPropertyIds,
        // Branding (from widget-config)
        agencyName,
        brandColor,
        welcomeMessage,
        widgetPosition,
        configLoading,
    };
}
