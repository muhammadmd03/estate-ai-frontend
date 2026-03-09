'use client';

import { TrendingUp, DollarSign, Home, Calendar, Percent, CreditCard, ArrowUpRight } from 'lucide-react';
import { AnalysisResult } from '@/types';
import { cn } from '@/lib/utils';

interface AnalysisCardProps {
    data: AnalysisResult;
}

function formatUSD(value: number): string {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
}

export default function AnalysisCard({ data }: AnalysisCardProps) {
    // Guard: if critical fields are missing (e.g. incomplete API response), render nothing
    if (
        data == null ||
        typeof data.monthlyEMI !== 'number' ||
        typeof data.totalRental !== 'number' ||
        typeof data.valueAfter5Yr !== 'number' ||
        typeof data.roi !== 'number'
    ) {
        return null;
    }

    const metrics = [
        {
            label: 'Monthly Mortgage',
            value: `$${data.monthlyEMI.toLocaleString()}`,

            icon: CreditCard,
            color: 'blue',
            sub: '20-year tenure',
        },
        {
            label: 'Annual Rental Income',
            value: formatUSD(data.totalRental),
            icon: Home,
            color: 'indigo',
            sub: 'Estimated yield',
        },
        {
            label: 'Value After 5 Years',
            value: formatUSD(data.valueAfter5Yr),
            icon: Calendar,
            color: 'violet',
            sub: `+${(((data.valueAfter5Yr - data.price) / data.price) * 100).toFixed(0)}% appreciation`,
        },
        {
            label: 'ROI',
            value: `${data.roi}%`,
            icon: Percent,
            color: 'emerald',
            sub: 'Annual return',
            highlight: true,
        },
    ];

    const colorMap = {
        blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-700', label: 'text-blue-600' },
        indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-700', label: 'text-indigo-600' },
        violet: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-700', label: 'text-violet-600' },
        emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-700', label: 'text-emerald-600' },
    };

    return (
        <div className="w-full max-w-lg bg-white border border-slate-100 rounded-2xl shadow-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-blue-900 to-blue-800 border-b border-blue-800">
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Investment Analysis</h3>
                    <p className="text-[10px] text-blue-200 truncate max-w-[260px]">{data.propertyTitle}</p>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-[10px] text-blue-300">Total Price</p>
                    <p className="text-xs font-bold text-white">{formatUSD(data.price)}</p>
                </div>
            </div>

            {/* Loan Summary */}
            <div className="flex items-center gap-4 px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
                <div>
                    Down Payment: <span className="font-semibold text-slate-700">{formatUSD(data.downPayment)}</span>
                </div>
                <div className="w-px h-3 bg-slate-200" />
                <div>
                    Loan Amount: <span className="font-semibold text-slate-700">{formatUSD(data.loanAmount)}</span>
                </div>
                <div className="w-px h-3 bg-slate-200" />
                <div>
                    Rate: <span className="font-semibold text-slate-700">7.25% p.a.</span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 p-4">
                {metrics.map((m) => {
                    const Icon = m.icon;
                    const colors = colorMap[m.color as keyof typeof colorMap];
                    return (
                        <div
                            key={m.label}
                            className={cn(
                                'rounded-xl p-3 border transition-transform hover:scale-[1.02]',
                                m.highlight
                                    ? 'bg-emerald-50 border-emerald-100'
                                    : `${colors.bg} border-slate-100`
                            )}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className={cn('w-6 h-6 rounded-md flex items-center justify-center', colors.icon)}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                {m.highlight && (
                                    <div className="flex items-center gap-0.5 text-emerald-600">
                                        <ArrowUpRight className="w-3 h-3" />
                                    </div>
                                )}
                            </div>
                            <p
                                className={cn(
                                    'text-lg font-bold tracking-tight leading-none mb-0.5',
                                    m.highlight ? 'text-emerald-700' : 'text-slate-800'
                                )}
                            >
                                {m.value}
                            </p>
                            <p className="text-[10px] font-medium text-slate-500">{m.label}</p>
                            <p className={cn('text-[10px] mt-0.5', m.highlight ? 'text-emerald-500' : 'text-slate-400')}>
                                {m.sub}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Footer CTA */}
            <div className="px-4 pb-4">
                <button className="w-full py-2.5 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-blue-900/20 hover:shadow-md hover:shadow-blue-900/30 active:scale-[0.98]">
                    Generate Full Investment Report
                </button>
            </div>
        </div>
    );
}
