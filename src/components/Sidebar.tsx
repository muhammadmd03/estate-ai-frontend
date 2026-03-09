'use client';

import {
    GitCompare,
    TrendingUp,
    Plus,
    Building2,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    activeNav: string;
    onNavChange: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    { id: 'new-search', label: 'New Search', icon: Plus },
    { id: 'compare', label: 'Compare Properties', icon: GitCompare },
    { id: 'investment', label: 'Investment Analysis', icon: TrendingUp },
];



export default function Sidebar({
    activeNav,
    onNavChange,
    isOpen,
    onClose,
}: SidebarProps) {

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
                    'fixed top-0 left-0 h-full w-[260px] bg-white border-r border-slate-100 flex flex-col z-50 transition-transform duration-300 shadow-xl',
                    'lg:relative lg:translate-x-0 lg:shadow-none lg:z-auto',
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
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

                {/* Navigation */}
                <nav className="px-3 py-4 space-y-0.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeNav === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavChange(item.id)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                                    isActive
                                        ? 'bg-blue-50 text-blue-900 shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                )}
                            >
                                <div
                                    className={cn(
                                        'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                                        isActive
                                            ? 'bg-blue-900 text-white'
                                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                {item.label}
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Spacer */}
                <div className="flex-1" />

                {/* User Profile */}
                <div className="px-4 py-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                            MA
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">Muhammad Ahmed</p>
                            <p className="text-xs text-slate-400 truncate">Pro Agent</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-200" />
                    </div>
                </div>
            </aside>
        </>
    );
}
