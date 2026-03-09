'use client';

import { Building2, SlidersHorizontal, X } from 'lucide-react';
import { Property, AnalysisResult } from '@/types';
import PropertyCard from './PropertyCard';

interface ResultsPanelProps {
    properties: Property[];
    onCalculateEMI: (data: AnalysisResult) => void;
    onAnalyzeROI: (data: AnalysisResult) => void;
    onCompare: (id: string) => void;
    comparedIds: string[];
    isVisible: boolean;
    onClose?: () => void;
}

function EmptyState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Building2 className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-sm font-semibold text-slate-600 mb-1">No Properties Found</h3>
            <p className="text-xs text-slate-400 max-w-[180px] leading-relaxed">
                Search properties using the chat to see results here
            </p>
            <div className="mt-6 space-y-2 w-full max-w-[200px]">
                {['3 bed in New York', 'Beverly Hills villa', 'Chicago office'].map((q) => (
                    <div
                        key={q}
                        className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-400 text-left"
                    >
                        {q}
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-slate-300 mt-3">Try one of these searches in the chat</p>
        </div>
    );
}

export default function ResultsPanel({
    properties,
    onCalculateEMI,
    onAnalyzeROI,
    onCompare,
    comparedIds,
    isVisible,
    onClose,
}: ResultsPanelProps) {
    if (!isVisible) return null;

    return (
        <aside className="flex flex-col h-full bg-[#f8fafc] border-l border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 bg-white flex-shrink-0">
                <div>
                    <h2 className="text-sm font-semibold text-slate-800">Property Results</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {properties.length > 0
                            ? `${properties.length} propert${properties.length === 1 ? 'y' : 'ies'} found`
                            : 'Ask AI to find properties'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors xl:hidden"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Compare bar */}
            {comparedIds.length === 2 && (
                <div className="px-4 py-2.5 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between flex-shrink-0">
                    <span className="text-xs font-medium text-indigo-700">2 properties selected for comparison</span>
                    <button className="text-xs font-semibold text-indigo-900 px-2 py-1 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors">
                        Compare Now
                    </button>
                </div>
            )}

            {/* Cards list */}
            {properties.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {properties.map((property, index) => (
                        <div
                            key={property.id}
                            className="animate-in fade-in slide-in-from-right-4 duration-300"
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            <PropertyCard
                                property={property}
                                onCalculateEMI={onCalculateEMI}
                                onAnalyzeROI={onAnalyzeROI}
                                onCompare={onCompare}
                                isCompared={comparedIds.includes(property.id)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </aside>
    );
}
