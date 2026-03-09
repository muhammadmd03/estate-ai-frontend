'use client';

import { useState, useEffect } from 'react';
import { Bed, Bath, Maximize2, MapPin, Calculator, GitCompare, TrendingUp, Star, ExternalLink } from 'lucide-react';
import { Property, AnalysisResult } from '@/types';
import { cn } from '@/lib/utils';
import { mockProperties } from '@/lib/mockData';

interface PropertyCardProps {
    property: Property;
    onCalculateEMI: (data: AnalysisResult) => void;
    onAnalyzeROI: (data: AnalysisResult) => void;
    onCompare: (id: string) => void;
    isCompared?: boolean;
}

function buildAnalysis(property: Property): AnalysisResult {
    const price = property.priceValue;
    const downPayment = price * 0.20;           // 20% down (US standard)
    const loan = price * 0.80;
    const rate = 0.0725 / 12;                   // 7.25% p.a. US mortgage rate
    const n = 360;                              // 30-year term
    const emi = Math.round((loan * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1));
    const rental = Math.round(price * 0.06);    // ~6% annual gross yield
    const value5Yr = Math.round(price * Math.pow(1.05, 5)); // 5% annual appreciation
    const roi = parseFloat((((rental + (value5Yr - price) / 5) / price) * 100).toFixed(1));

    return {
        propertyTitle: property.title,
        price,
        monthlyEMI: emi,
        totalRental: rental,
        valueAfter5Yr: value5Yr,
        roi,
        downPayment,
        loanAmount: loan,
    };
}

export default function PropertyCard({
    property,
    onCalculateEMI,
    onAnalyzeROI,
    onCompare,
    isCompared,
}: PropertyCardProps) {
    const analysis = buildAnalysis(property);
    const [imgError, setImgError] = useState(false);

    // Reset error flag when the image source changes
    useEffect(() => {
        setImgError(false);
    }, [property.image]);

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 hover:scale-[1.01] transition-all duration-200 overflow-hidden group">
            {/* Image */}
            <div
                className={cn("relative aspect-video bg-gradient-to-br from-blue-100 to-slate-100 overflow-hidden", property.url && "cursor-pointer group/image")}
                onClick={() => {
                    if (property.url) {
                        window.open(property.url, '_blank', 'noopener,noreferrer');
                    }
                }}
            >
                {!imgError && property.image && (
                    <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-500"
                        onError={() => setImgError(true)}
                    />
                )}
                {property.url && (
                    <div className="absolute inset-0 bg-slate-900/0 group-hover/image:bg-slate-900/10 transition-colors duration-300 flex items-center justify-center">
                        <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 drop-shadow-md" />
                    </div>
                )}
                {/* Overlay badges */}
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    {property.tags?.slice(0, 2).map((tag) => (
                        <span
                            key={tag}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                {/* Type badge */}
                <div className="absolute top-2.5 right-2.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-900/90 backdrop-blur-sm text-white">
                        {property.type}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title & Price */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 flex-1">
                        {property.url ? (
                            <a
                                href={property.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-700 hover:underline transition-colors"
                            >
                                {property.title}
                            </a>
                        ) : (
                            property.title
                        )}
                    </h3>
                    <span className="text-sm font-bold text-emerald-600 whitespace-nowrap">
                        {property.price}
                    </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 mb-3 text-slate-400">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs truncate">{property.location}</span>
                </div>

                {/* Stats badges */}
                <div className="flex items-center gap-2 mb-3">
                    {property.beds > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                            <Bed className="w-3 h-3 text-slate-500" />
                            <span className="text-xs font-medium text-slate-600">{property.beds} Bed</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                        <Bath className="w-3 h-3 text-slate-500" />
                        <span className="text-xs font-medium text-slate-600">{property.baths} Bath</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                        <Maximize2 className="w-3 h-3 text-slate-500" />
                        <span className="text-xs font-medium text-slate-600">
                            {property.sqft.toLocaleString()} sqft
                        </span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                    {property.description}
                </p>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-1.5">
                    <button
                        onClick={() => onCalculateEMI(analysis)}
                        className="flex flex-col items-center gap-1 py-2 px-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-[10px] font-semibold transition-all hover:scale-[1.03] active:scale-[0.97]"
                    >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>EMI Calc</span>
                    </button>
                    <button
                        onClick={() => onCompare(property.id)}
                        className={cn(
                            'flex flex-col items-center gap-1 py-2 px-1.5 rounded-xl text-[10px] font-semibold transition-all hover:scale-[1.03] active:scale-[0.97]',
                            isCompared
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                        )}
                    >
                        <GitCompare className="w-3.5 h-3.5" />
                        <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                    </button>
                    <button
                        onClick={() => onAnalyzeROI(analysis)}
                        className="flex flex-col items-center gap-1 py-2 px-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-semibold transition-all hover:scale-[1.03] active:scale-[0.97]"
                    >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>ROI</span>
                    </button>
                </div>

                {/* View Listing Link */}
                {property.url && (
                    <a
                        href={property.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                        <span>View Original Listing</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                )}
            </div>
        </div>
    );
}
