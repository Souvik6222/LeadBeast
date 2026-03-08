'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { supabase, apiRequest } from '@/lib/supabase';
import { formatScore, getTierColor, getTierEmoji, getScoreColor, timeAgo } from '@/lib/utils';
import {
    ArrowLeft, Mail, Phone, Linkedin, Building2, MapPin,
    Sparkles, RefreshCw, Copy, Brain, Send, TrendingUp,
    Zap, Globe, DollarSign, Users, Calendar, Shield,
    BarChart3, MessageSquare, CheckCircle2, XCircle,
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';

export default function LeadDetailPage() {
    const router = useRouter();
    const params = useParams();
    const leadId = params?.id as string;
    const [lead, setLead] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [enriching, setEnriching] = useState(false);

    useEffect(() => {
        async function load() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push('/auth/login'); return; }
            try {
                const data = await apiRequest(`/leads/${leadId}`);
                setLead(data);
            } catch (err) {
                console.error('Failed to load lead:', err);
            } finally {
                setLoading(false);
            }
        }
        if (leadId) load();
    }, [leadId, router]);

    async function handleEnrich() {
        setEnriching(true);
        try {
            await apiRequest(`/pipeline/enrich/${leadId}`, { method: 'POST' });
            // Reload after delay
            setTimeout(async () => {
                const data = await apiRequest(`/leads/${leadId}`);
                setLead(data);
                setEnriching(false);
            }, 5000);
        } catch (err) {
            setEnriching(false);
            alert('Enrichment failed: ' + (err as Error).message);
        }
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
    }

    if (loading) {
        return (
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                    <RefreshCw size={28} style={{ color: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />
                </div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div style={{ display: 'flex' }}>
                <Sidebar />
                <div className="main-content" style={{ textAlign: 'center', paddingTop: 100 }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Lead not found</p>
                    <button onClick={() => router.back()} className="btn-secondary" style={{ marginTop: 16 }}>
                        <ArrowLeft size={16} /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    const enrichment = lead.enrichment || {};
    const signals = lead.signals || [];
    const aiContent = lead.ai_content || {};
    const scoreHistory = (lead.score_history || []).reverse();
    const latestScore = lead.latest_score || {};
    const shapValues = latestScore.shap_values || [];

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content">
                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                    <button onClick={() => router.back()} style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: '0.8rem', marginBottom: 16,
                    }}>
                        <ArrowLeft size={14} /> Back to Leads
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: 16,
                                background: lead.tier === 'Hot' ? 'linear-gradient(135deg, #ef4444, #f59e0b)' :
                                    lead.tier === 'Warm' ? 'linear-gradient(135deg, #f59e0b, #10b981)' :
                                        'var(--gradient-1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem', fontWeight: 800, color: 'white',
                            }}>
                                {lead.first_name?.[0]}{lead.last_name?.[0]}
                            </div>
                            <div>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                                    {lead.first_name} {lead.last_name}
                                </h1>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {lead.title || 'No title'} at {lead.company}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ textAlign: 'right' }}>
                                <div className={getScoreColor(lead.current_score)} style={{ fontSize: '2rem', fontWeight: 900 }}>
                                    {formatScore(lead.current_score)}
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ 100</span>
                            </div>
                            {lead.tier && (
                                <span className={`score-badge ${getTierColor(lead.tier)}`} style={{ fontSize: '1rem', padding: '8px 16px' }}>
                                    {getTierEmoji(lead.tier)} {lead.tier}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <button onClick={handleEnrich} disabled={enriching} className="btn-primary" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                            {enriching ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={14} />}
                            {enriching ? 'Enriching...' : 'Re-Enrich'}
                        </button>
                        <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                            <MessageSquare size={14} /> Log Activity
                        </button>
                    </div>
                </div>

                {/* Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* AI Insight Card */}
                        {(aiContent.insight_text || aiContent.insight_reason) && (
                            <div className="glass-card glow-purple" style={{ padding: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                    <Brain size={20} style={{ color: '#8b5cf6' }} />
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#8b5cf6' }}>AI Intelligence</h3>
                                </div>
                                {aiContent.insight_reason && (
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 12 }}>
                                        {aiContent.insight_reason}
                                    </p>
                                )}
                                {aiContent.insight_signal && (
                                    <div style={{
                                        padding: '10px 14px', borderRadius: 8,
                                        background: 'rgba(139, 92, 246, 0.08)',
                                        border: '1px solid rgba(139, 92, 246, 0.2)',
                                        fontSize: '0.85rem', color: 'var(--text-secondary)',
                                        marginBottom: 12,
                                    }}>
                                        <strong>Signal:</strong> {aiContent.insight_signal}
                                    </div>
                                )}
                                {aiContent.insight_opener && (
                                    <div style={{
                                        padding: '10px 14px', borderRadius: 8,
                                        background: 'rgba(16, 185, 129, 0.08)',
                                        border: '1px solid rgba(16, 185, 129, 0.2)',
                                        fontSize: '0.85rem', color: 'var(--text-secondary)',
                                    }}>
                                        <strong>💡 Opener:</strong> {aiContent.insight_opener}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* AI Email Draft */}
                        {(aiContent.email_subject_a || aiContent.email_body) && (
                            <div className="glass-card" style={{ padding: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                    <Send size={18} style={{ color: 'var(--accent-blue)' }} />
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>AI Email Draft</h3>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>SUBJECT (A)</label>
                                    <div style={{
                                        padding: '8px 12px', borderRadius: 8, marginTop: 4,
                                        background: 'var(--bg-primary)', fontSize: '0.85rem',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }}>
                                        {aiContent.email_subject_a}
                                        <button onClick={() => copyToClipboard(aiContent.email_subject_a)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>
                                {aiContent.email_subject_b && (
                                    <div style={{ marginBottom: 12 }}>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>SUBJECT (B)</label>
                                        <div style={{
                                            padding: '8px 12px', borderRadius: 8, marginTop: 4,
                                            background: 'var(--bg-primary)', fontSize: '0.85rem',
                                        }}>
                                            {aiContent.email_subject_b}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>BODY</label>
                                    <div style={{
                                        padding: '12px 14px', borderRadius: 8, marginTop: 4,
                                        background: 'var(--bg-primary)', fontSize: '0.85rem',
                                        lineHeight: 1.6, whiteSpace: 'pre-wrap',
                                    }}>
                                        {aiContent.email_body}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(`Subject: ${aiContent.email_subject_a}\n\n${aiContent.email_body}`)}
                                        className="btn-secondary" style={{ marginTop: 12, fontSize: '0.8rem' }}
                                    >
                                        <Copy size={14} /> Copy Email
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Buying Signals */}
                        <div className="glass-card" style={{ padding: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <Zap size={18} style={{ color: 'var(--accent-amber)' }} />
                                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Buying Signals</h3>
                                <span style={{
                                    fontSize: '0.7rem', padding: '2px 8px', borderRadius: 12,
                                    background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 600,
                                }}>
                                    {signals.length}
                                </span>
                            </div>
                            {signals.length === 0 ? (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    No buying signals detected yet. Try enriching this lead.
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {signals.map((signal: any, i: number) => (
                                        <div key={i} style={{
                                            padding: '12px 16px', borderRadius: 10,
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-primary)',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        }}>
                                            <div>
                                                <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                                    {signal.signal_type?.replace('SIGNAL_', '').replace('_', ' ')}
                                                </p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                    {signal.signal_description}
                                                </p>
                                            </div>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 8,
                                                background: signal.signal_strength >= 7 ? 'rgba(239, 68, 68, 0.15)' :
                                                    signal.signal_strength >= 4 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 800, fontSize: '0.9rem',
                                                color: signal.signal_strength >= 7 ? '#ef4444' :
                                                    signal.signal_strength >= 4 ? '#f59e0b' : '#3b82f6',
                                            }}>
                                                {signal.signal_strength}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Score History Chart */}
                        {scoreHistory.length > 1 && (
                            <div className="glass-card" style={{ padding: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                    <TrendingUp size={18} style={{ color: 'var(--accent-green)' }} />
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Score History</h3>
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={scoreHistory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                                        <XAxis dataKey="scored_at" tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                                            tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                                        <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 8, color: 'white', fontSize: '0.8rem' }} />
                                        <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Right Column — Data Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Score Breakdown */}
                        {shapValues.length > 0 && (
                            <div className="glass-card" style={{ padding: 20 }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12 }}>Score Breakdown</h4>
                                {shapValues.map((f: any, i: number) => (
                                    <div key={i} style={{ marginBottom: 10 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>{f.feature}</span>
                                            <span style={{ fontWeight: 600, color: f.contribution > 20 ? '#10b981' : 'var(--text-primary)' }}>
                                                {f.contribution}%
                                            </span>
                                        </div>
                                        <div style={{ height: 4, background: 'var(--bg-primary)', borderRadius: 2 }}>
                                            <div style={{
                                                height: '100%', borderRadius: 2,
                                                width: `${Math.min(f.contribution, 100)}%`,
                                                background: f.contribution > 20 ? '#10b981' : '#3b82f6',
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Contact Info */}
                        <div className="glass-card" style={{ padding: 20 }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12 }}>Contact</h4>
                            {[
                                { icon: Mail, value: lead.email, copyable: true },
                                { icon: Phone, value: lead.phone, copyable: true },
                                { icon: Linkedin, value: lead.linkedin_url, link: true },
                            ].filter(f => f.value).map((f, i) => {
                                const Icon = f.icon;
                                return (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                                        borderBottom: '1px solid rgba(42, 48, 80, 0.3)',
                                    }}>
                                        <Icon size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {f.value}
                                        </span>
                                        {f.copyable && (
                                            <button onClick={() => copyToClipboard(f.value)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                                <Copy size={12} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            {enrichment.is_decision_maker !== undefined && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.75rem' }}>
                                    {enrichment.is_decision_maker ? (
                                        <><CheckCircle2 size={14} style={{ color: '#10b981' }} /> Decision Maker</>
                                    ) : (
                                        <><XCircle size={14} style={{ color: 'var(--text-muted)' }} /> Not Decision Maker</>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Company Info */}
                        <div className="glass-card" style={{ padding: 20 }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12 }}>Company</h4>
                            {[
                                { icon: Building2, label: 'Name', value: enrichment.company_name_verified || lead.company },
                                { icon: Globe, label: 'Website', value: enrichment.company_domain || lead.company_website },
                                { icon: Users, label: 'Size', value: enrichment.company_size ? `${enrichment.company_size} employees` : lead.industry },
                                { icon: MapPin, label: 'HQ', value: enrichment.company_hq_city ? `${enrichment.company_hq_city}, ${enrichment.company_hq_country}` : lead.location },
                                { icon: Calendar, label: 'Founded', value: enrichment.company_founded_year },
                            ].filter(f => f.value).map((f, i) => {
                                const Icon = f.icon;
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                                        <Icon size={14} style={{ color: 'var(--text-muted)' }} />
                                        <div>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{f.label}</span>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{f.value}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Funding */}
                        {enrichment.total_funding_usd && (
                            <div className="glass-card" style={{ padding: 20 }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12 }}>Funding</h4>
                                <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                                    <DollarSign size={16} style={{ display: 'inline' }} />
                                    {(enrichment.total_funding_usd / 1_000_000).toFixed(1)}M
                                </p>
                                {enrichment.last_funding_type && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                        Last: {enrichment.last_funding_type} • ${(enrichment.last_funding_amount / 1_000_000).toFixed(1)}M
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Tech Stack */}
                        {enrichment.tech_stack && enrichment.tech_stack.length > 0 && (
                            <div className="glass-card" style={{ padding: 20 }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12 }}>Tech Stack</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {enrichment.tech_stack.map((tech: string, i: number) => (
                                        <span key={i} style={{
                                            padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            color: '#3b82f6', fontWeight: 500,
                                        }}>
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
