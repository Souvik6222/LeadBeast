'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { supabase, apiRequest } from '@/lib/supabase';
import {
    Users, ShieldCheck, Clock, AlertTriangle, Target, Zap, LayoutDashboard, Database, Activity, ArrowRight, ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("John");

    useEffect(() => {
        async function load() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push('/auth/login'); return; }
            try {
                // Try to get user's first name
                if (session.user?.user_metadata?.full_name) {
                    setUserName(session.user.user_metadata.full_name.split(' ')[0] || "John");
                }

                const s = await apiRequest('/analytics/summary');
                setSummary(s);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        }
        load();
    }, [router]);

    if (loading) {
        return (
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner" style={{ margin: '0 auto', marginBottom: '16px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--emerald)', borderRadius: '50%', width: 24, height: 24, animation: 'spin 1s linear infinite' }}></div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading workspace...</p>
                    </div>
                </div>
            </div>
        );
    }

    const metrics = [
        { label: 'Total Leads', value: summary?.total_leads || '12,450', sub: '+340 this week', icon: Users, accent: 'blue' },
        { label: 'Verified Emails', value: '8,230', sub: '66% health rate', icon: ShieldCheck, accent: 'emerald' },
        { label: 'Pending Verification', value: '1,420', sub: 'In progress', icon: Clock, accent: 'amber' },
        { label: 'Invalid / Risky', value: '2,800', sub: 'Removed from lists', icon: AlertTriangle, accent: 'rose' },
    ];

    const quickActions = [
        { title: 'Scrape Websites', desc: 'Extract leads from URLs', icon: Target, href: '/scraper', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
        { title: 'Generate Leads', desc: 'Find prospects by criteria', icon: Zap, href: '/generator', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
        { title: 'Verify Emails', desc: 'Clean your contact lists', icon: ShieldCheck, href: '/email-verifier', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
        { title: 'Manage Leads', desc: 'View and export database', icon: Database, href: '/leads', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    ];

    const recentActivity = [
        { action: 'Scraped 450 new leads from Yelp', time: '10 mins ago', type: 'scrape' },
        { action: 'Verified 1,200 emails securely', time: '2 hours ago', type: 'verify' },
        { action: 'Exported Hot Leads to CSV', time: '5 hours ago', type: 'export' },
        { action: 'Generated 200 leads for "Plumbers"', time: 'Yesterday', type: 'generate' },
    ];

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ padding: '32px 40px', background: '#09090b', minHeight: '100vh', width: '100%' }}>
                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 8 }}>
                        Welcome back, {userName}! 👋
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                        Here is what's happening with your lead generation today.
                    </p>
                </div>

                {/* Metric cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                    {metrics.map((m, i) => {
                        const Icon = m.icon;
                        return (
                            <div key={i} style={{
                                background: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: '20px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                                            {m.label}
                                        </p>
                                        <p style={{ fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
                                            {m.value}
                                        </p>
                                        <p style={{ fontSize: 12, color: '#71717a', marginTop: 8 }}>{m.sub}</p>
                                    </div>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10,
                                        background: `var(--${m.accent}-light)`, opacity: 0.1, position: 'absolute'
                                    }}></div>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `rgba(255,255,255,0.03)`, border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <Icon size={20} style={{ color: `var(--${m.accent})` }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
                    {/* Quick Actions */}
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 16 }}>Quick Actions</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            {quickActions.map((action, i) => {
                                const Icon = action.icon;
                                return (
                                    <div
                                        key={i}
                                        onClick={() => router.push(action.href)}
                                        style={{
                                            background: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: '24px',
                                            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 16
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = action.color;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#27272a';
                                            e.currentTarget.style.transform = 'none';
                                        }}
                                    >
                                        <div style={{
                                            width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: action.bg, color: action.color
                                        }}>
                                            <Icon size={24} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 4 }}>{action.title}</h3>
                                            <p style={{ fontSize: 13, color: '#a1a1aa' }}>{action.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'white' }}>Recent Activity</h2>
                            <button style={{ background: 'none', border: 'none', color: '#10b981', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                View all <ArrowRight size={14} />
                            </button>
                        </div>
                        <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {recentActivity.map((act, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%', background: '#10b981', marginTop: 6,
                                            boxShadow: '0 0 8px rgba(16,185,129,0.5)'
                                        }}></div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 14, color: '#e4e4e7', marginBottom: 4 }}>{act.action}</p>
                                            <p style={{ fontSize: 12, color: '#71717a' }}>{act.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
