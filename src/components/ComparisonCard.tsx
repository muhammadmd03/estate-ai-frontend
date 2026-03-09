'use client';

import { Bed, Bath, Maximize2, MapPin, DollarSign, GitCompare, ExternalLink, Home } from 'lucide-react';
import { ApiProperty } from '@/types';
import { cn } from '@/lib/utils';

interface ComparisonCardProps {
    properties: ApiProperty[];
}

const HIGHLIGHT_COLORS = [
    {
        header: 'from-blue-900 to-blue-800',
        badge: 'bg-blue-100 text-blue-800',
        border: 'border-blue-200',
        accent: 'text-blue-700',
        row: 'bg-blue-50/50',
        pill: 'bg-blue-900 text-white',
    },
    {
        header: 'from-indigo-800 to-violet-800',
        badge: 'bg-violet-100 text-violet-800',
        border: 'border-violet-200',
        accent: 'text-violet-700',
        row: 'bg-violet-50/50',
        pill: 'bg-violet-800 text-white',
    },
    {
        header: 'from-emerald-700 to-teal-700',
        badge: 'bg-emerald-100 text-emerald-800',
        border: 'border-emerald-200',
        accent: 'text-emerald-700',
        row: 'bg-emerald-50/50',
        pill: 'bg-emerald-700 text-white',
    },
];

function StatRow({
    icon,
    label,
    values,
    colors,
}: {
    icon: React.ReactNode;
    label: string;
    values: (string | number | undefined)[];
    colors: typeof HIGHLIGHT_COLORS;
}) {
    return (
        <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}>
            {values.map((val, i) => (
                <div
                    key={i}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-2 text-xs border-b border-slate-100',
                        i === 0 ? colors[0].row : i === 1 ? colors[1].row : colors[2].row
                    )}
                >
                    <span className="text-slate-400 flex-shrink-0">{icon}</span>
                    <span className="font-medium text-slate-700 truncate">{val ?? '—'}</span>
                </div>
            ))}
        </div>
    );
}

export default function ComparisonCard({ properties }: ComparisonCardProps) {
    if (!properties || properties.length < 2) return null;

    const cols = properties.slice(0, 3); // cap at 3
    const colors = HIGHLIGHT_COLORS.slice(0, cols.length);

    return (
        <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-2xl shadow-md overflow-hidden mt-3">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600">
                <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GitCompare className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Property Comparison</h3>
                    <p className="text-[10px] text-slate-300">{cols.length} properties side-by-side</p>
                </div>
            </div>

            {/* Property name headers */}
            <div
                className="grid gap-px border-b border-slate-100"
                style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}
            >
                {cols.map((p, i) => (
                    <div
                        key={p.property_id}
                        className={`bg-gradient-to-br ${colors[i].header} px-3 py-3`}
                    >
                        <span className={cn('inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1', colors[i].pill)}>
                            #{i + 1}
                        </span>
                        <p className="text-xs font-semibold text-white leading-snug line-clamp-2">{p.title}</p>
                        <p className="text-[10px] text-white/70 mt-0.5 font-mono">{p.property_id}</p>
                    </div>
                ))}
            </div>

            {/* Stat rows */}
            {/* Price */}
            <StatRow
                icon={<DollarSign className="w-3 h-3" />}
                label="Price"
                values={cols.map((p) =>
                    p.price_usd != null ? `$${p.price_usd.toLocaleString()}` : '—'
                )}
                colors={colors}
            />
            {/* Location */}
            <StatRow
                icon={<MapPin className="w-3 h-3" />}
                label="Location"
                values={cols.map((p) => p.location)}
                colors={colors}
            />
            {/* Beds */}
            <StatRow
                icon={<Bed className="w-3 h-3" />}
                label="Bedrooms"
                values={cols.map((p) => (p.bedrooms != null ? `${p.bedrooms} bed` : '—'))}
                colors={colors}
            />
            {/* Baths */}
            <StatRow
                icon={<Bath className="w-3 h-3" />}
                label="Bathrooms"
                values={cols.map((p) => (p.bathrooms != null ? `${p.bathrooms} bath` : '—'))}
                colors={colors}
            />
            {/* SqFt */}
            <StatRow
                icon={<Maximize2 className="w-3 h-3" />}
                label="Size"
                values={cols.map((p) => (p.area_sqft != null ? `${p.area_sqft.toLocaleString()} sqft` : '—'))}
                colors={colors}
            />
            {/* Type */}
            <StatRow
                icon={<Home className="w-3 h-3" />}
                label="Type"
                values={cols.map((p) => p.type || '—')}
                colors={colors}
            />

            {/* Footer links */}
            <div
                className="grid gap-px border-t border-slate-100"
                style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}
            >
                {cols.map((p, i) =>
                    p.url ? (
                        <a
                            key={p.property_id}
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                'flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-semibold transition-colors',
                                i === 0
                                    ? 'bg-blue-50 hover:bg-blue-100 text-blue-800'
                                    : i === 1
                                        ? 'bg-violet-50 hover:bg-violet-100 text-violet-800'
                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                            )}
                        >
                            <ExternalLink className="w-3 h-3" />
                            View Listing
                        </a>
                    ) : (
                        <div
                            key={p.property_id}
                            className="flex items-center justify-center py-2.5 text-[10px] text-slate-400 bg-slate-50"
                        >
                            No link
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
