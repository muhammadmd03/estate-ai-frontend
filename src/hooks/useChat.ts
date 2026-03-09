'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, AnalysisResult, ApiProperty } from '@/types';
import { initialMessages, aiResponses, fallbackResponse } from '@/lib/mockData';



function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

function findMatchingResponse(input: string) {
    const lowerInput = input.toLowerCase();
    for (const response of aiResponses) {
        const matches = response.trigger.some((keyword) => lowerInput.includes(keyword));
        if (matches) return response;
    }
    return null;
}

export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [isTyping, setIsTyping] = useState(false);
    const [shownPropertyIds, setShownPropertyIds] = useState<string[]>([]);
    const [apiProperties, setApiProperties] = useState<ApiProperty[]>([]);
    const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(null);
    const [threadId, setThreadId] = useState<string>("");
    const [userId, setUserId] = useState<string>("");

    useEffect(() => {
        // Persist a unique user_id per browser (never regenerated)
        let uid = localStorage.getItem("user_id");
        if (!uid) {
            uid = crypto.randomUUID();
            localStorage.setItem("user_id", uid);
        }
        setUserId(uid);

        // One thread_id per chat session (reset on clearChat)
        let th = localStorage.getItem("thread_id");
        if (!th) {
            th = crypto.randomUUID();
            localStorage.setItem("thread_id", th);
        }
        setThreadId(th);
    }, []);

    const sendMessage = useCallback(async (content: string) => {
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
                    message: content.trim(),
                    user_id: userId,
                    thread_id: threadId,
                }),
            });

            const data = await res.json();

            // Surface FastAPI errors as a visible chat message
            if (!res.ok || data.error) {
                const errorMsg: ChatMessage = {
                    id: generateId(),
                    role: 'ai',
                    content: data.reply ?? "⚠️ I'm having trouble connecting to the AI service right now. Please make sure the backend is running and try again.",
                    timestamp: new Date(),
                    isError: true,
                };
                setMessages((prev) => [...prev, errorMsg]);
                return;
            }

            // Only show comparison layout when the user explicitly asks to compare
            const comparisonKeywords = ['compare', 'comparison', 'vs', 'versus', 'difference between', 'side by side', 'side-by-side', 'which is better', 'which one is better'];
            const isComparisonIntent = comparisonKeywords.some((kw) => content.toLowerCase().includes(kw));
            const isComparison = isComparisonIntent && Array.isArray(data.properties) && data.properties.length >= 2;

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
                    ? data.properties.map((p: any) => p.property_id)
                    : undefined,
                apiProperties: data.properties ?? undefined,
            };

            if (data.properties) {
                setShownPropertyIds(data.properties.map((p: any) => p.property_id));
                setApiProperties((prev) => {
                    const map = new Map(prev.map((p) => [p.property_id, p]));
                    (data.properties as ApiProperty[]).forEach((p) => {
                        const existing = map.get(p.property_id);
                        map.set(p.property_id, {
                            ...existing,
                            ...p,
                            // Preserve image_url from prior fetch if new response omits it
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
            console.error("Chat error:", error);
            const errorMsg: ChatMessage = {
                id: generateId(),
                role: 'ai',
                content: "⚠️ Unable to reach the AI service. Please check that the backend server is running and try again.",
                timestamp: new Date(),
                isError: true,
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }

    }, [messages, threadId]);

    const clearChat = useCallback(() => {
        const newThreadId = crypto.randomUUID();
        localStorage.setItem("thread_id", newThreadId);
        setThreadId(newThreadId);

        setMessages(initialMessages);
        setShownPropertyIds([]);
        setApiProperties([]);
        setActiveAnalysis(null);
    }, []);

    return {
        messages,
        isTyping,
        shownPropertyIds,
        apiProperties,
        activeAnalysis,
        sendMessage,
        clearChat,
        setActiveAnalysis,
        setShownPropertyIds,
    };
}
