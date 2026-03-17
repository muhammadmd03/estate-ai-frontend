'use client';

import { useState } from 'react';
import {
    Plus,
    Building2,
    X,
    Search,
    SlidersHorizontal,
    GitCompare,
    ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    activeNav: string;
    onNavChange: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
    onSend: (message: string) => void;
}

const LOCATIONS = ['New York', 'Miami', 'Chicago', 'Seattle'];
const BEDROOMS = ['1', '2', '3', '4+'];
const PRICE_RANGES = [
    'Under $500k',
    '$500k – $1M',
    '$1M – $1.5M',
    '$1.5M – $2M',
    'Custom',
];
const PROPERTY_TYPES = ['Apartment', 'House', 'Condo', 'Villa', 'Office'];

function buildSearchQuery(
    location: string,
    bedrooms: string,
    priceRange: string,
    customPrice: string,
    propertyType: string
): string {
    const parts: string[] = [];

    if (bedrooms) parts.push(`${bedrooms} bedroom`);
    if (propertyType) parts.push(propertyType.toLowerCase());

    let query = parts.length > 0 ? `Find me a ${parts.join(' ')}` : 'Find me a property';

    if (location) query += ` in ${location}`;

    const resolvedPrice = priceRange === 'Custom' ? customPrice : priceRange;
    if (resolvedPrice && resolvedPrice !== 'Custom') {
        query += ` under ${resolvedPrice}`;
    }

    return query;
}

export default function Sidebar({
    activeNav,
    onNavChange,
    isOpen,
    onClose,
    onSend,
}: SidebarProps) {
    // Filter state
    const [location, setLocation] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [customPrice, setCustomPrice] = useState('');
    const [propertyType, setPropertyType] = useState('');

    // Compare state
    const [compareId1, setCompareId1] = useState('');
    const [compareId2, setCompareId2] = useState('');

    const handleSearch = () => {
        const query = buildSearchQuery(location, bedrooms, priceRange, customPrice, propertyType);
        onSend(query);
        onNavChange('new-search');
        onClose();
    };

    const handleCompare = () => {
        if (!compareId1.trim() || !compareId2.trim()) return;
        onSend(`Compare property ${compareId1.trim()} and ${compareId2.trim()}`);
        onNavChange('new-search');
        onClose();
    };

    const selectClass =
        'w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all appearance-none cursor-pointer';

    const labelClass = 'text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1 block';

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    'fixed top-0 left-0 h-full w-[270px] bg-white border-r border-slate-100 flex flex-col z-50 transition-transform duration-300 shadow-xl',
                    'lg:relative lg:translate-x-0 lg:shadow-none lg:z-auto',
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-[15px] font-bold text-slate-900 tracking-tight leading-none">EstateAI</h1>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-none">AI Property Assistant</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto">
                    {/* New Search button */}
                    <div className="px-3 pt-4 pb-2">
                        <button
                            onClick={() => { onNavChange('new-search'); onClose(); }}
                            className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                                activeNav === 'new-search'
                                    ? 'bg-blue-50 text-blue-900 shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            )}
                        >
                            <div
                                className={cn(
                                    'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                                    activeNav === 'new-search'
                                        ? 'bg-blue-900 text-white'
                                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                                )}
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </div>
                            New Search
                            {activeNav === 'new-search' && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 border-t border-slate-100 my-1" />

                    {/* Property Filters */}
                    <div className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-3">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-700" />
                            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Property Filters</span>
                        </div>

                        <div className="space-y-3">
                            {/* Location */}
                            <div>
                                <label className={labelClass}>Location</label>
                                <div className="relative">
                                    <select
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="">Any location</option>
                                        {LOCATIONS.map((l) => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Bedrooms */}
                            <div>
                                <label className={labelClass}>Bedrooms</label>
                                <div className="relative">
                                    <select
                                        value={bedrooms}
                                        onChange={(e) => setBedrooms(e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="">Any</option>
                                        {BEDROOMS.map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className={labelClass}>Price Range</label>
                                <div className="relative">
                                    <select
                                        value={priceRange}
                                        onChange={(e) => { setPriceRange(e.target.value); setCustomPrice(''); }}
                                        className={selectClass}
                                    >
                                        <option value="">Any price</option>
                                        {PRICE_RANGES.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                </div>
                                {priceRange === 'Custom' && (
                                    <input
                                        type="text"
                                        value={customPrice}
                                        onChange={(e) => setCustomPrice(e.target.value)}
                                        placeholder="e.g. $2.5M"
                                        className="mt-1.5 w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                                    />
                                )}
                            </div>

                            {/* Property Type */}
                            <div>
                                <label className={labelClass}>Property Type</label>
                                <div className="relative">
                                    <select
                                        value={propertyType}
                                        onChange={(e) => setPropertyType(e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="">Any type</option>
                                        {PROPERTY_TYPES.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Search button */}
                        <button
                            onClick={handleSearch}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 active:scale-95 transition-all shadow-sm shadow-blue-200"
                        >
                            <Search className="w-3.5 h-3.5" />
                            Search
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 border-t border-slate-100 my-1" />

                    {/* Compare Properties */}
                    <div className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-3">
                            <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Compare Properties</span>
                        </div>

                        <div className="space-y-2">
                            <div>
                                <label className={labelClass}>Property ID 1</label>
                                <input
                                    type="text"
                                    value={compareId1}
                                    onChange={(e) => setCompareId1(e.target.value)}
                                    placeholder="e.g. USA0108"
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Property ID 2</label>
                                <input
                                    type="text"
                                    value={compareId2}
                                    onChange={(e) => setCompareId2(e.target.value)}
                                    placeholder="e.g. USA0115"
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleCompare}
                            disabled={!compareId1.trim() || !compareId2.trim()}
                            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 transition-all shadow-sm shadow-indigo-200"
                        >
                            <GitCompare className="w-3.5 h-3.5" />
                            Compare
                        </button>
                    </div>

                    {/* Bottom padding */}
                    <div className="h-4" />
                </div>
            </aside>
        </>
    );
}
