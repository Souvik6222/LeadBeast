'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { supabase, apiRequest } from '@/lib/supabase';
import { formatScore, getTierEmoji } from '@/lib/utils';
import {
    Users, TrendingUp, Flame, ArrowRight, Loader, Zap, Target, BarChart3,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
} from 'recharts';

export default function DashboardPage() {
    const router = useRouter();
    const [summary, setSummary] = useState<any>(null);
    const [topLeads, setTopLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push('/auth/login'); return; }
            try {
                const [s, t] = await Promise.all([
                    apiRequest('/analytics/summary'),
                    apiRequest('/leads/top?limit=8'),
                ]);
                setSummary(s);
                setTopLeads(t.leads || []);
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
                        <Loader size={24} className="spin" style={{ color: 'var(--indigo-light)' }} />
                        <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 13 }}>Loading your pipeline...</p>
                    </div>
                </div>
            </div>
        );
    }

    const scoreDistribution = summary?.score_distribution || [];

    const metrics = [
        { label: 'Total Leads', value: summary?.total_leads || 0, sub: `+${summary?.new_this_week || 0} this week`, icon: Users, accent: 'indigo' },
        { label: 'Hot Leads', value: summary?.hot_leads || 0, sub: 'Ready to close', icon: Flame, accent: 'rose' },
        { label: 'Avg Score', value: summary?.avg_score?.toFixed(1) || '0', sub: 'Pipeline quality', icon: TrendingUp, accent: 'blue' },
        { label: 'Warm Leads', value: summary?.warm_leads || 0, sub: 'Nurture pipeline', icon: Target, accent: 'amber' },
    ];

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content page-glow">
                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
                            Dashboard
                        </h1>
                        <span style={{
                            fontSize: 10, fontWeight: 600, padding: '3px 10px',
                            borderRadius: 6, background: 'rgba(99,102,241,0.1)',
                            color: 'var(--indigo-light)', textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>
                            Live
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        Your lead intelligence overview
                    </p>
                </div>

                {/* Metric cards */}
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
                                        <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                                            {m.value}
                                        </p>
                                        {m.sub && (
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>{m.sub}</p>
                                        )}
                                    </div>
                                    <div className={`icon-box ${m.accent}`}>
                                        <Icon size={20} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Two-col layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
                    {/* Top leads */}
                    <div className="card">
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div className="icon-box indigo" style={{ width: 32, height: 32, borderRadius: 8 }}>
                                    <BarChart3 size={15} />
                                </div>
                                <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Top Leads</h2>
                            </div>
                            <button
                                onClick={() => router.push('/leads')}
                                className="btn btn-ghost"
                                style={{ padding: '6px 12px', fontSize: 12 }}
                            >
                                View all <ArrowRight size={12} />
                            </button>
                        </div>

                        <table className="tbl">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Company</th>
                                    <th>Score</th>
                                    <th>Tier</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                                            <Zap size={24} style={{ margin: '0 auto 8px', color: 'var(--indigo)', opacity: 0.5 }} />
                                            <p>No leads yet</p>
                                            <p style={{ fontSize: 12, marginTop: 4 }}>Generate prospects from the Prospect Builder</p>
                                        </td>
                                    </tr>
                                ) : (
                                    topLeads.map((lead: any) => (
                                        <tr key={lead.id} onClick={() => router.push(`/leads/${lead.id}`)}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{
                                                        width: 32, height: 32, borderRadius: 8,
                                                        background: lead.tier === 'Hot' ? 'linear-gradient(135deg, #f43f5e, #fb7185)' :
                                                            lead.tier === 'Warm' ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' :
                                                                'linear-gradient(135deg, #6366f1, #818cf8)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 11, fontWeight: 700, color: 'white',
                                                    }}>
                                                        {lead.first_name?.[0]}{lead.last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                                            {lead.first_name} {lead.last_name}
                                                        </p>
                                                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.title || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{lead.company}</td>
                                            <td style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                                                {formatScore(lead.current_score)}
                                            </td>
                                            <td>
                                                {lead.tier && (
                                                    <span className={`badge ${lead.tier === 'Hot' ? 'badge-hot' : lead.tier === 'Warm' ? 'badge-warm' : 'badge-cold'}`}>
                                                        {getTierEmoji(lead.tier)} {lead.tier}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Score distribution */}
                    <div className="card-padded">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                            <div className="icon-box violet" style={{ width: 32, height: 32, borderRadius: 8 }}>
                                <BarChart3 size={15} />
                            </div>
                            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                                Score Distribution
                            </h2>
                        </div>
                        {scoreDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={scoreDistribution}>
                                    <XAxis dataKey="range" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'var(--bg-elevated)',
                                            border: '1px solid var(--border-light)',
                                            borderRadius: 10, fontSize: 12,
                                            color: 'var(--text-primary)',
                                            boxShadow: 'var(--shadow-md)',
                                        }}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                        {scoreDistribution.map((_: any, i: number) => (
                                            <Cell key={i} fill={['#3b4155', '#6366f1', '#818cf8', '#34d399', '#10b981'][i] || '#3b4155'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{
                                height: 240, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                color: 'var(--text-muted)', fontSize: 13,
                                background: 'var(--bg-surface)', borderRadius: 10,
                            }}>
                                <BarChart3 size={24} style={{ marginBottom: 8, opacity: 0.3 }} />
                                Chart will appear once leads are scored
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
