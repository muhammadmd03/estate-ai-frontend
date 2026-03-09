'use client';

import { useState, useEffect, useCallback } from 'react';
import { Lead, LeadStatus } from '@/types';
import StatsCards from './StatsCards';
import LeadCharts from './LeadCharts';
import LeadFilterBar, { FilterValues } from './LeadFilterBar';
import LeadTable from './LeadTable';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';


export default function LeadDashboard() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilters, setActiveFilters] = useState<FilterValues | null>(null);

    /* ── Fetch leads (with optional filters) ─────────────────────── */
    const fetchLeads = useCallback(async (filters?: FilterValues | null) => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('admin_token') ?? '';

            // Build query string
            const params = new URLSearchParams();
            if (filters?.leadType) params.set('lead_type', filters.leadType);
            if (filters?.status) params.set('status', filters.status);
            if (filters?.propertyId) params.set('property_id', filters.propertyId);
            if (filters?.search) params.set('search', filters.search);

            const qs = params.toString();
            const url = `/api/leads${qs ? `?${qs}` : ''}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Failed to fetch leads (${res.status})`);
            const data: Lead[] = await res.json();
            setLeads(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load leads.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    /* ── Handlers ────────────────────────────────────────────────── */
    const handleStatusChange = (id: string, status: LeadStatus) => {
        setLeads((prev) =>
            prev.map((l) => (l.id === id ? { ...l, status } : l))
        );
    };

    const handleApplyFilters = (filters: FilterValues) => {
        setActiveFilters(filters);
        fetchLeads(filters);
    };

    const handleClearFilters = () => {
        setActiveFilters(null);
        fetchLeads(null);
    };

    const handleRefresh = () => {
        fetchLeads(activeFilters);
    };

    /* ── Render ──────────────────────────────────────────────────── */
    return (
        <div>
            {/* Section title + Refresh */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Leads Overview</h2>
                    <p className="text-sm text-slate-400 mt-0.5">
                        Manage and track your real estate leads
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50 shadow-sm"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Error state */}
            {error && (
                <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 mb-6">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-sm">Failed to load leads</p>
                        <p className="text-xs mt-0.5 text-red-500">{error}</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="ml-auto text-xs font-semibold underline hover:no-underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Stats */}
            <StatsCards leads={leads} />

            {/* Analytics Charts */}
            <LeadCharts leads={leads} />

            {/* Filter Bar */}
            <LeadFilterBar
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                loading={loading}
            />

            {/* Table section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-700">
                        All Leads{' '}
                        {!loading && (
                            <span className="ml-1.5 text-xs font-medium text-slate-400">
                                ({leads.length})
                            </span>
                        )}
                    </h3>
                </div>

                {loading ? (
                    /* Loading spinner */
                    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-slate-100 shadow-sm bg-white">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                        <p className="text-sm text-slate-400 font-medium">Loading leads...</p>
                    </div>
                ) : (
                    <LeadTable leads={leads} onStatusChange={handleStatusChange} />
                )}
            </div>
        </div>
    );
}
