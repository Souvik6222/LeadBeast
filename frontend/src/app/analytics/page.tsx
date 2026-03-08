'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { supabase, apiRequest } from '@/lib/supabase';
import { Loader, TrendingUp, Target, Activity, Award } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
    PieChart, Pie,
} from 'recharts';

export default function AnalyticsPage() {
    const router = useRouter();
    const [summary, setSummary] = useState<any>(null);
    const [tierPerf, setTierPerf] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push('/auth/login'); return; }
            try {
                const [s, t] = await Promise.all([
                    apiRequest('/analytics/summary'),
                    apiRequest('/analytics/tier-performance'),
                ]);
                setSummary(s);
                setTierPerf(t.tiers || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        }
        load();
    }, [router]);

    const COLORS: Record<string, string> = { Hot: '#f43f5e', Warm: '#f59e0b', Cold: '#3b82f6' };

    if (loading) {
        return (
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                    <Loader size={24} className="spin" style={{ color: 'var(--indigo-light)' }} />
                </div>
            </div>
        );
    }

    const pieData = tierPerf.map(t => ({
        name: t.tier, value: t.total,
        color: COLORS[t.tier] || '#3b4155',
    }));

    const metrics = [
        { label: 'Total Leads', value: summary?.total_leads || 0, icon: Activity, accent: 'indigo' },
        { label: 'Scored Leads', value: summary?.scored_leads || 0, icon: Target, accent: 'emerald' },
        { label: 'Avg Score', value: summary?.avg_score?.toFixed(1) || '0', icon: TrendingUp, accent: 'blue' },
        { label: 'Hot Leads', value: summary?.hot_leads || 0, icon: Award, accent: 'rose' },
    ];

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content page-glow">
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Analytics</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        Lead scoring performance and pipeline health metrics
                    </p>
                </div>

                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                    {metrics.map((m, i) => {
                        const Icon = m.icon;
                        return (
                            <div key={i} className={`metric-card ${m.accent} fade-up`}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {m.label}
                                        </p>
                                        <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                                            {m.value}
                                        </p>
                                    </div>
                                    <div className={`icon-box ${m.accent}`}>
                                        <Icon size={20} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Charts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                    <div className="card-padded">
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24 }}>
                            Tier Distribution
                        </h2>
                        {pieData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                                            {pieData.map((entry, idx) => (
                                                <Cell key={idx} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}>
                                    {pieData.map((d) => (
                                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{d.name}: {d.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13, background: 'var(--bg-surface)', borderRadius: 10 }}>
                                No data yet — generate leads first
                            </div>
                        )}
                    </div>

                    <div className="card-padded">
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24 }}>
                            Conversion Rate by Tier
                        </h2>
                        {tierPerf.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={tierPerf}>
                                    <XAxis dataKey="tier" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
                                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 12, color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)' }} />
                                    <Bar dataKey="conversion_rate" radius={[6, 6, 0, 0]}>
                                        {tierPerf.map((entry, idx) => (
                                            <Cell key={idx} fill={COLORS[entry.tier] || '#3b4155'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13, background: 'var(--bg-surface)', borderRadius: 10 }}>
                                Data will show once leads have conversion activity
                            </div>
                        )}
                    </div>
                </div>

                {/* Scoring model info */}
                <div className="card-padded">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div className="icon-box violet">
                            <Award size={20} />
                        </div>
                        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Scoring Model</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        {[
                            { label: 'Current Model', value: 'Rule-based v1', desc: 'Weighted scoring across firmographics, seniority, and data completeness', color: 'var(--indigo-light)' },
                            { label: 'Scoring Factors', value: '5 Categories', desc: 'Seniority, industry fit, contact data, signals, and source quality', color: 'var(--emerald)' },
                            { label: 'Auto-Score', value: 'Enabled', desc: 'New leads are scored immediately upon generation or import', color: 'var(--amber)' },
                        ].map((item, i) => (
                            <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
                                <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</p>
                                <p style={{ fontSize: 18, fontWeight: 700, marginTop: 8, color: item.color }}>{item.value}</p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
