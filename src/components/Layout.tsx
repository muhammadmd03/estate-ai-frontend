'use client';

import { useState } from 'react';
import { LayoutGrid, Menu, X, Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import ResultsPanel from './ResultsPanel';
import { useChat } from '@/hooks/useChat';
import { useProperties } from '@/hooks/useProperties';
import { AnalysisResult, Property } from '@/types';
import { mockProperties } from '@/lib/mockData';

export default function DashboardLayout() {
    const [activeNav, setActiveNav] = useState('new-search');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [resultsVisible, setResultsVisible] = useState(true);

    const { messages, isTyping, shownPropertyIds, apiProperties, sendMessage, clearChat } = useChat();

    const { properties, comparedIds, toggleCompare } =
        useProperties(shownPropertyIds.length > 0 ? shownPropertyIds : undefined);

    const handleNavChange = (id: string) => {
        setActiveNav(id);
        if (id === 'new-search') clearChat();
        setSidebarOpen(false);
    };

    const handleEMI = (data: AnalysisResult) => {
        sendMessage(`Calculate EMI for ${data.propertyTitle}`);
    };

    const handleROI = (data: AnalysisResult) => {
        sendMessage(`Analyze ROI for ${data.propertyTitle}`);
    };

    // Build display properties: prefer full data from API (has image_url), fall back to mock data
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

    return (
        <div className="h-screen flex overflow-hidden bg-[#f8fafc]">
            {/* Sidebar */}
            <Sidebar
                activeNav={activeNav}
                onNavChange={handleNavChange}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-sm font-semibold text-slate-800">AI Real Estate Assistant</h2>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] text-slate-400 font-medium">Online · 0ms latency</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* New Chat Button */}
                        <button
                            onClick={clearChat}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            New Chat
                        </button>

                        {/* Results toggle (tablet) */}
                        <button
                            onClick={() => setResultsVisible(!resultsVisible)}
                            className={`hidden md:flex xl:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${resultsVisible
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            {resultsVisible ? 'Hide Results' : 'Show Results'}
                        </button>

                        {/* Property count badge */}
                        {displayProperties.length > 0 && (
                            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {displayProperties.length} Results
                            </div>
                        )}
                    </div>
                </header>

                {/* Content area */}
                <div className="flex-1 flex min-h-0">
                    {/* Chat area */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white">
                        <ChatWindow
                            messages={messages}
                            isTyping={isTyping}
                            onTriggerAnalysis={() => { }}
                        />
                        <ChatInput onSend={sendMessage} disabled={isTyping} />
                    </div>

                    {/* Results panel - hidden on mobile, collapsible on tablet */}
                    <div
                        className={`
              hidden md:flex flex-col
              ${resultsVisible ? 'w-[380px] xl:w-[400px]' : 'w-0 overflow-hidden'}
              transition-all duration-300 flex-shrink-0
            `}
                    >
                        <ResultsPanel
                            properties={displayProperties}
                            onCalculateEMI={handleEMI}
                            onAnalyzeROI={handleROI}
                            onCompare={toggleCompare}
                            comparedIds={comparedIds}
                            isVisible={resultsVisible}
                            onClose={() => setResultsVisible(false)}
                        />
                    </div>
                </div>

                {/* Mobile Results bottom sheet trigger */}
                {displayProperties.length > 0 && (
                    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-t border-slate-100 flex-shrink-0">
                        <span className="text-xs text-slate-500">
                            {displayProperties.length} properties found
                        </span>
                        <button className="text-xs font-semibold text-blue-900 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                            View Properties
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
