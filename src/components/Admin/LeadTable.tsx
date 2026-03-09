'use client';

import { useState, useMemo } from 'react';
import { Lead, LeadStatus } from '@/types';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';


interface LeadTableProps {
    leads: Lead[];
    onStatusChange: (id: string, status: LeadStatus) => void;
}

const STATUS_OPTIONS: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost'];

const statusStyle: Record<LeadStatus, string> = {
    New: 'bg-blue-50 text-blue-700 border-blue-200',
    Contacted: 'bg-purple-50 text-purple-700 border-purple-200',
    Qualified: 'bg-teal-50 text-teal-700 border-teal-200',
    Closed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Lost: 'bg-red-50 text-red-700 border-red-200',
};

const leadTypeBadge: Record<string, string> = {
    Hot: 'bg-red-100 text-red-700 border border-red-200',
    Warm: 'bg-orange-100 text-orange-700 border border-orange-200',
    Cold: 'bg-slate-100 text-slate-600 border border-slate-200',
};

type SortKey = 'timestamp' | 'lead_type' | 'status';
type SortDir = 'asc' | 'desc';

const LEAD_TYPE_ORDER: Record<string, number> = { Cold: 0, Warm: 1, Hot: 2 };
const STATUS_ORDER: Record<string, number> = { New: 0, Contacted: 1, Qualified: 2, Closed: 3, Lost: 4 };

const PAGE_SIZE = 10;

function formatDate(ts: string) {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Sortable header cell ───────────────────────────────────────── */
function SortHeader({
    label,
    sortKey,
    currentSort,
    currentDir,
    onSort,
}: {
    label: string;
    sortKey: SortKey;
    currentSort: SortKey | null;
    currentDir: SortDir;
    onSort: (key: SortKey) => void;
}) {
    const active = currentSort === sortKey;
    return (
        <th
            onClick={() => onSort(sortKey)}
            className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap cursor-pointer select-none hover:text-slate-700 transition-colors group"
        >
            <span className="inline-flex items-center gap-1">
                {label}
                <span className="inline-flex flex-col -space-y-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <ChevronUp
                        className={`w-3 h-3 ${active && currentDir === 'asc' ? 'text-blue-600 opacity-100' : 'text-slate-400'}`}
                    />
                    <ChevronDown
                        className={`w-3 h-3 ${active && currentDir === 'desc' ? 'text-blue-600 opacity-100' : 'text-slate-400'}`}
                    />
                </span>
            </span>
        </th>
    );
}

/* ── Main component ─────────────────────────────────────────────── */
export default function LeadTable({ leads, onStatusChange }: LeadTableProps) {
    const [updating, setUpdating] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
        setPage(0);
    };

    /* Sort */
    const sorted = useMemo(() => {
        if (!sortKey) return leads;
        const arr = [...leads];
        arr.sort((a, b) => {
            let cmp = 0;
            if (sortKey === 'timestamp') {
                cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            } else if (sortKey === 'lead_type') {
                cmp = (LEAD_TYPE_ORDER[a.lead_type] ?? 0) - (LEAD_TYPE_ORDER[b.lead_type] ?? 0);
            } else if (sortKey === 'status') {
                cmp = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0);
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return arr;
    }, [leads, sortKey, sortDir]);

    /* Paginate */
    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages - 1);
    const paged = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

    const handleStatusChange = async (lead: Lead, newStatus: LeadStatus) => {
        onStatusChange(lead.id, newStatus);
        setUpdating(lead.id);
        try {
            const token = localStorage.getItem('admin_token') ?? '';
            await fetch(`/api/leads/${lead.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch {
            // Stay with optimistic value
        } finally {
            setUpdating(null);
        }
    };

    /* ── Empty state ────────────────────────────────────────────── */
    if (leads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 rounded-2xl border border-dashed border-slate-200 bg-white">
                <Inbox className="w-10 h-10 mb-3 text-slate-300" />
                <p className="text-sm font-medium">No leads found for the selected filters.</p>
            </div>
        );
    }

    /* ── Table ──────────────────────────────────────────────────── */
    return (
        <div>
            <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                Name
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                Email
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                Phone
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                Property
                            </th>
                            <SortHeader
                                label="Lead Type"
                                sortKey="lead_type"
                                currentSort={sortKey}
                                currentDir={sortDir}
                                onSort={handleSort}
                            />
                            <SortHeader
                                label="Status"
                                sortKey="status"
                                currentSort={sortKey}
                                currentDir={sortDir}
                                onSort={handleSort}
                            />
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                Preferred Time
                            </th>
                            <SortHeader
                                label="Created"
                                sortKey="timestamp"
                                currentSort={sortKey}
                                currentDir={sortDir}
                                onSort={handleSort}
                            />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {paged.map((lead) => (
                            <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                                {/* Name */}
                                <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                                    {lead.name}
                                </td>

                                {/* Email */}
                                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                    {lead.email}
                                </td>

                                {/* Phone */}
                                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                    {lead.whatsapp}
                                </td>

                                {/* Property — clickable tag */}
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {lead.preferred_properties ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
                                            {lead.preferred_properties}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 text-xs">—</span>
                                    )}
                                </td>

                                {/* Lead Type badge */}
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${leadTypeBadge[lead.lead_type] ?? 'bg-slate-100 text-slate-600 border border-slate-200'}`}
                                    >
                                        {lead.lead_type}
                                    </span>
                                </td>

                                {/* Status dropdown */}
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <select
                                        value={lead.status}
                                        disabled={updating === lead.id}
                                        onChange={(e) =>
                                            handleStatusChange(lead, e.target.value as LeadStatus)
                                        }
                                        className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200 transition disabled:opacity-60 ${statusStyle[lead.status] ?? 'bg-white text-slate-600 border-slate-200'}`}
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                {/* Preferred Time */}
                                <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                                    {lead.preferred_time}
                                </td>

                                {/* Created */}
                                <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                                    {formatDate(lead.timestamp)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ────────────────────────────────────────── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                    <p className="text-xs text-slate-400">
                        Showing {safePage * PAGE_SIZE + 1}–
                        {Math.min((safePage + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}{' '}
                        leads
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={safePage === 0}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i)}
                                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                                    i === safePage
                                        ? 'bg-blue-900 text-white shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={safePage >= totalPages - 1}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
