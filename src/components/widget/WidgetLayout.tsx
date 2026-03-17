'use client';

import { useState } from 'react';
import { Building2, RotateCcw, LayoutGrid, ChevronLeft, Loader2 } from 'lucide-react';
import ChatWindow from '@/components/ChatWindow';
import ChatInput from '@/components/ChatInput';
import ResultsPanel from '@/components/ResultsPanel';
import { useWidgetChat } from '@/hooks/useWidgetChat';
import { useProperties } from '@/hooks/useProperties';
import { AnalysisResult, Property } from '@/types';
import { mockProperties } from '@/lib/mockData';

interface WidgetLayoutProps {
    clientId: string;
    apiKey: string;
}

export default function WidgetLayout({ clientId, apiKey }: WidgetLayoutProps) {
    const {
        messages,
        isTyping,
        shownPropertyIds,
        apiProperties,
        sendMessage,
        clearChat,
        setActiveAnalysis,
        // Branding from widget-config
        agencyName,
        brandColor,
        welcomeMessage,
        widgetPosition,
        configLoading,
    } = useWidgetChat({ clientId, apiKey });

    const { properties: compared, comparedIds, toggleCompare } = useProperties(
        shownPropertyIds.length > 0 ? shownPropertyIds : undefined
    );

    const [showPropertyPanel, setShowPropertyPanel] = useState(false);

    // Build display properties (same logic as DashboardLayout)
    const uniquePropertyIds = Array.from(new Set(shownPropertyIds));
    const displayProperties: Property[] = uniquePropertyIds.length > 0
        ? uniquePropertyIds.map((id) => {
            const apiProp = apiProperties.find((p) => p.property_id === id);
            const mockProp = mockProperties.find((p) => p.id === id);
            if (apiProp) {
                return {
                    id: apiProp.property_id,
                    title: apiProp.title,
                    location: apiProp.location,
                    price: apiProp.price_usd != null ? `$${apiProp.price_usd.toLocaleString()}` : (mockProp?.price ?? ''),
                    priceValue: apiProp.price_usd ?? mockProp?.priceValue ?? 0,
                    image: apiProp.image_url ?? mockProp?.image ?? '',
                    beds: apiProp.bedrooms ?? mockProp?.beds ?? 0,
                    baths: apiProp.bathrooms ?? mockProp?.baths ?? 0,
                    sqft: apiProp.area_sqft ?? mockProp?.sqft ?? 0,
                    description: apiProp.description ?? mockProp?.description ?? '',
                    type: apiProp.type ?? mockProp?.type ?? '',
                    tags: apiProp.tags ?? mockProp?.tags ?? [],
                    url: apiProp.image_url ?? mockProp?.url ?? '',
                } as Property;
            }
            return mockProp ?? null;
        }).filter(Boolean) as Property[]
        : [];

    const handleEMI = (data: AnalysisResult) => {
        sendMessage(`Calculate EMI for ${data.propertyTitle}`);
        setShowPropertyPanel(false);
    };

    const handleROI = (data: AnalysisResult) => {
        sendMessage(`Analyze ROI for ${data.propertyTitle}`);
        setShowPropertyPanel(false);
    };

    return (
        <div
            style={{ width: '100%', height: '100vh' }}
            data-widget-position={widgetPosition}
            className="flex flex-col bg-white overflow-hidden"
        >
            {/* ── Header ── */}
            <header
                className="flex-shrink-0 flex items-center justify-between px-4 py-3 shadow-md"
                style={{ background: brandColor }}
            >
                <div className="flex items-center gap-2.5">
                    {showPropertyPanel ? (
                        <button
                            onClick={() => setShowPropertyPanel(false)}
                            title="Back to chat"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all mr-0.5"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    ) : (
                        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                    )}
                    <div>
                        {configLoading ? (
                            <div className="flex items-center gap-1.5">
                                <Loader2 className="w-3.5 h-3.5 text-white/70 animate-spin" />
                                <p className="text-sm font-semibold text-white/70 leading-tight">
                                    Loading...
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm font-semibold text-white leading-tight">
                                {showPropertyPanel ? 'Property Results' : `${agencyName}`}
                            </p>
                        )}
                        <p className="text-[10px] text-white/70 leading-tight">
                            {showPropertyPanel
                                ? `${displayProperties.length} propert${displayProperties.length === 1 ? 'y' : 'ies'} found`
                                : welcomeMessage}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {displayProperties.length > 0 && !showPropertyPanel && (
                        <button
                            onClick={() => setShowPropertyPanel(true)}
                            title="View Properties"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all"
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">View Properties</span>
                            <span className="sm:hidden">{displayProperties.length}</span>
                        </button>
                    )}

                    {!showPropertyPanel && (
                        <button
                            onClick={clearChat}
                            title="Clear chat"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-200 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </header>

            {/* ── Main content (chat or property panel) ── */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
                {/* Chat view */}
                <div
                    className={`absolute inset-0 flex flex-col transition-transform duration-300 ${showPropertyPanel ? '-translate-x-full' : 'translate-x-0'}`}
                >
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                        <ChatWindow
                            messages={messages}
                            isTyping={isTyping}
                            onTriggerAnalysis={(data) => setActiveAnalysis(data)}
                        />
                    </div>

                    {/* Input pinned to bottom */}
                    <div className="flex-shrink-0">
                        <ChatInput onSend={sendMessage} disabled={isTyping} brandColor={brandColor} />
                    </div>

                    {/* Mobile "View Properties" tap bar */}
                    {displayProperties.length > 0 && (
                        <div className="sm:hidden flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex-shrink-0">
                            <span className="text-xs text-slate-600 font-medium">
                                {displayProperties.length} propert{displayProperties.length === 1 ? 'y' : 'ies'} found
                            </span>
                            <button
                                onClick={() => setShowPropertyPanel(true)}
                                style={{ backgroundColor: brandColor }}
                                className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                            >
                                View Properties
                            </button>
                        </div>
                    )}
                </div>

                {/* Property panel */}
                <div
                    className={`absolute inset-0 flex flex-col bg-[#f8fafc] transition-transform duration-300 ${showPropertyPanel ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <ResultsPanel
                        properties={displayProperties}
                        onCalculateEMI={handleEMI}
                        onAnalyzeROI={handleROI}
                        onCompare={toggleCompare}
                        comparedIds={comparedIds}
                        isVisible={true}
                        onClose={() => setShowPropertyPanel(false)}
                    />
                </div>
            </div>
        </div>
    );
}
