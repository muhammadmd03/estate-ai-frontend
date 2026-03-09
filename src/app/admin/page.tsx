'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LeadDashboard from '@/components/Admin/LeadDashboard';
import { Building2, LogOut } from 'lucide-react';

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.replace('/login');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.replace('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Brand + Title */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-[15px] font-bold text-slate-900 leading-none tracking-tight">
                                Lead Dashboard
                            </h1>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-none">EstateAI Admin</p>
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </header>

            {/* Dashboard Body */}
            <main className="max-w-screen-2xl mx-auto px-6 py-8">
                <LeadDashboard />
            </main>
        </div>
    );
}
