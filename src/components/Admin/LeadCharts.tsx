'use client';

import { useMemo } from 'react';
import { Lead } from '@/types';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    BarChart,
    Bar,
} from 'recharts';

interface LeadChartsProps {
    leads: Lead[];
}

/* ── Colour palette ─────────────────────────────────────────────── */
const PIE_COLORS = ['#ef4444', '#f59e0b', '#94a3b8']; // Hot, Warm, Cold
const FUNNEL_COLORS: Record<string, string> = {
    Cold: '#94a3b8',
    Warm: '#f59e0b',
    Hot: '#ef4444',
    Closed: '#10b981',
};

/* ── Component ──────────────────────────────────────────────────── */
export default function LeadCharts({ leads }: LeadChartsProps) {
    /* Pie: by type */
    const pieData = useMemo(() => {
        const hot = leads.filter((l) => l.lead_type === 'Hot').length;
        const warm = leads.filter((l) => l.lead_type === 'Warm').length;
        const cold = leads.filter((l) => l.lead_type === 'Cold').length;
        return [
            { name: 'Hot', value: hot },
            { name: 'Warm', value: warm },
            { name: 'Cold', value: cold },
        ];
    }, [leads]);

    /* Line: leads over last 30 days */
    const lineData = useMemo(() => {
        const now = new Date();
        const days: Record<string, number> = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            days[key] = 0;
        }
        leads.forEach((l) => {
            const d = new Date(l.timestamp);
            if (!isNaN(d.getTime())) {
                const key = d.toISOString().split('T')[0];
                if (key in days) days[key]++;
            }
        });
        return Object.entries(days).map(([date, count]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            leads: count,
        }));
    }, [leads]);

    /* Bar: conversion funnel */
    const funnelData = useMemo(() => {
        const cold = leads.filter((l) => l.lead_type === 'Cold').length;
        const warm = leads.filter((l) => l.lead_type === 'Warm').length;
        const hot = leads.filter((l) => l.lead_type === 'Hot').length;
        const closed = leads.filter((l) => l.status === 'Closed').length;
        return [
            { stage: 'Cold', count: cold },
            { stage: 'Warm', count: warm },
            { stage: 'Hot', count: hot },
            { stage: 'Closed', count: closed },
        ];
    }, [leads]);

    if (leads.length === 0) return null;

    return (
        <div className="mb-8 space-y-4">
            {/* Two-column row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pie Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Leads by Type</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={90}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 12px rgba(0,0,0,.06)',
                                    fontSize: '13px',
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Line Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">
                        Leads Created (Last 30 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                tickLine={false}
                                axisLine={{ stroke: '#e2e8f0' }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 12px rgba(0,0,0,.06)',
                                    fontSize: '13px',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="leads"
                                stroke="#1e3a8a"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 4, fill: '#1e3a8a', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bar Chart — full width */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">
                    Lead Conversion Funnel
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={funnelData} barSize={48}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                            dataKey="stage"
                            tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                            tickLine={false}
                            axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 12px rgba(0,0,0,.06)',
                                fontSize: '13px',
                            }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {funnelData.map((entry) => (
                                <Cell key={entry.stage} fill={FUNNEL_COLORS[entry.stage] ?? '#94a3b8'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
