'use client';

import { useState, useMemo } from 'react';
import { Property, FilterState, AnalysisResult } from '@/types';
import { mockProperties } from '@/lib/mockData';

const defaultFilters: FilterState = {
    budgetMin: '',
    budgetMax: '',
    location: '',
    propertyType: '',
    bedrooms: '',
};

export function useProperties(shownIds?: string[]) {
    const [filters, setFilters] = useState<FilterState>(defaultFilters);
    const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(null);
    const [comparedIds, setComparedIds] = useState<string[]>([]);

    const displayedProperties = useMemo<Property[]>(() => {
        if (shownIds && shownIds.length > 0) {
            return mockProperties.filter((p) => shownIds.includes(p.id));
        }
        return mockProperties;
    }, [shownIds]);

    const filteredProperties = useMemo<Property[]>(() => {
        return displayedProperties.filter((p) => {
            if (filters.budgetMin && p.priceValue < Number(filters.budgetMin) * 100000) return false;
            if (filters.budgetMax && p.priceValue > Number(filters.budgetMax) * 100000) return false;
            if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
            if (filters.propertyType && p.type !== filters.propertyType) return false;
            if (filters.bedrooms && p.beds !== Number(filters.bedrooms)) return false;
            return true;
        });
    }, [displayedProperties, filters]);

    const toggleCompare = (id: string) => {
        setComparedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev.slice(-1), id]
        );
    };

    const updateFilter = (key: keyof FilterState, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => setFilters(defaultFilters);

    return {
        properties: filteredProperties,
        allProperties: mockProperties,
        filters,
        updateFilter,
        resetFilters,
        activeAnalysis,
        setActiveAnalysis,
        comparedIds,
        toggleCompare,
    };
}
