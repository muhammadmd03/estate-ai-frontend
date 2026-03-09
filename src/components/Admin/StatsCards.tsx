'use client';

import { Lead, LeadType } from '@/types';
import { Users, Flame, Thermometer, Snowflake, CalendarCheck, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
    leads: Lead[];
}

function getTodayCount(leads: Lead[]): number {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    return leads.filter((l) => {
        const d = new Date(l.timestamp);
        return !isNaN(d.getTime()) && d.toISOString().split('T')[0] === todayStr;
    }).length;
}

const cards = (leads: Lead[], count: (type?: LeadType) => number, todayCount: number) => [
    {
        label: 'Total Leads',
        value: count(),
        icon: Users,
        gradient: 'from-blue-600 to-blue-700',
        bg: 'bg-blue-50',
        iconBg: 'bg-blue-600',
        text: 'text-blue-700',
        border: 'border-blue-100',
        trend: '+12%',
        trendPositive: true,
    },
    {
        label: 'Hot Leads',
        value: count('Hot'),
        icon: Flame,
        gradient: 'from-red-500 to-rose-600',
        bg: 'bg-red-50',
        iconBg: 'bg-red-500',
        text: 'text-red-700',
        border: 'border-red-100',
        trend: '+5%',
        trendPositive: true,
    },
    {
        label: 'Warm Leads',
        value: count('Warm'),
        icon: Thermometer,
        gradient: 'from-amber-500 to-orange-500',
        bg: 'bg-amber-50',
        iconBg: 'bg-amber-500',
        text: 'text-amber-700',
        border: 'border-amber-100',
        trend: '+8%',
        trendPositive: true,
    },
    {
        label: 'Cold Leads',
        value: count('Cold'),
        icon: Snowflake,
        gradient: 'from-sky-500 to-cyan-600',
        bg: 'bg-sky-50',
        iconBg: 'bg-sky-500',
        text: 'text-sky-700',
        border: 'border-sky-100',
        trend: '-3%',
        trendPositive: false,
    },
    {
        label: 'Leads Today',
        value: todayCount,
        icon: CalendarCheck,
        gradient: 'from-violet-600 to-purple-700',
        bg: 'bg-violet-50',
        iconBg: 'bg-violet-600',
        text: 'text-violet-700',
        border: 'border-violet-100',
        trend: 'New',
        trendPositive: true,
    },
];

export default function StatsCards({ leads }: StatsCardsProps) {
    const count = (type?: LeadType) =>
        type ? leads.filter((l) => l.lead_type === type).length : leads.length;
    const todayCount = getTodayCount(leads);

    return (
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
            {cards(leads, count, todayCount).map((card) => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.label}
                        className={`${card.bg} border ${card.border} rounded-2xl p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow duration-200`}
                    >
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shadow-sm`}>
                            <Icon className="w-5 h-5 text-white" />
                        </div>

                        {/* Value */}
                        <div>
                            <p className={`text-3xl font-bold tracking-tight ${card.text}`}>
                                {card.value}
                            </p>
                            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-widest">
                                {card.label}
                            </p>
                        </div>

                        {/* Trend */}
                        <div className="flex items-center gap-1">
                            <TrendingUp className={`w-3 h-3 ${card.trendPositive ? 'text-emerald-500' : 'text-red-400'}`} />
                            <span className={`text-xs font-semibold ${card.trendPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                                {card.trend}
                            </span>
                            <span className="text-xs text-slate-400 ml-0.5">vs last week</span>
                        </div>

                        {/* Decorative dot */}
                        <div className={`absolute -right-3 -top-3 w-16 h-16 rounded-full ${card.iconBg} opacity-10`} />
                    </div>
                );
            })}
        </div>
    );
}
