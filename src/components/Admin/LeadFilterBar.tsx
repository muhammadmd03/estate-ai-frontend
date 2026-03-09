'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { LeadType, LeadStatus } from '@/types';

interface LeadFilterBarProps {
    onApply: (filters: FilterValues) => void;
    onClear: () => void;
    loading?: boolean;
}

export interface FilterValues {
    leadType: string;
    status: string;
    propertyId: string;
    search: string;
}

const LEAD_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
    { value: '', label: 'All' },
    { value: 'Hot', label: 'Hot' },
    { value: 'Warm', label: 'Warm' },
    { value: 'Cold', label: 'Cold' },
];

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
    { value: '', label: 'All' },
    { value: 'New', label: 'New' },
    { value: 'Contacted', label: 'Contacted' },
    { value: 'Qualified', label: 'Qualified' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Lost', label: 'Lost' },
];

export default function LeadFilterBar({ onApply, onClear, loading }: LeadFilterBarProps) {
    const [leadType, setLeadType] = useState('');
    const [status, setStatus] = useState('');
    const [propertyId, setPropertyId] = useState('');
    const [search, setSearch] = useState('');

    const hasFilters = leadType || status || propertyId || search;

    const handleApply = () => {
        onApply({ leadType, status, propertyId, search });
    };

    const handleClear = () => {
        setLeadType('');
        setStatus('');
        setPropertyId('');
        setSearch('');
        onClear();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleApply();
    };

    const selectClass =
        'px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 cursor-pointer transition-all hover:border-slate-300';
    const inputClass =
        'px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all hover:border-slate-300';

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-700">Filter Leads</h3>
                {hasFilters && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                )}
            </div>

            <div className="flex flex-wrap items-end gap-3">
                {/* Lead Type */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-500">Lead Type</label>
                    <select
                        value={leadType}
                        onChange={(e) => setLeadType(e.target.value)}
                        className={selectClass}
                    >
                        {LEAD_TYPE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-500">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={selectClass}
                    >
                        {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Property ID */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-500">Property ID</label>
                    <input
                        type="text"
                        value={propertyId}
                        onChange={(e) => setPropertyId(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search property ID (USA0615)"
                        className={`${inputClass} w-56`}
                    />
                </div>

                {/* Search */}
                <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                    <label className="text-xs font-medium text-slate-500">Search</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search name, email, or phone"
                            className={`${inputClass} w-full pl-9`}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleApply}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium rounded-xl bg-blue-900 text-white hover:bg-blue-800 transition-all shadow-sm disabled:opacity-50 active:scale-95"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50 active:scale-95"
                    >
                        <span className="flex items-center gap-1.5">
                            <X className="w-3.5 h-3.5" />
                            Clear
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
