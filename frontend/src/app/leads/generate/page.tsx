'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { apiRequest } from '@/lib/supabase';
import { formatScore, getTierEmoji } from '@/lib/utils';
import {
    Building2, Briefcase, MapPin, Users,
    ArrowRight, Loader, Sparkles, Target, Zap,
} from 'lucide-react';

interface GeneratedLead {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    company: string;
    title?: string;
    industry?: string;
    location?: string;
    current_score?: number;
    tier?: string;
}

export default function GenerateLeadsPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        industry: '', role: '', company_size: '',
        location: '', count: 5, additional_criteria: '',
    });
    const [generating, setGenerating] = useState(false);
    const [results, setResults] = useState<GeneratedLead[]>([]);
    const [error, setError] = useState('');
    const [generated, setGenerated] = useState(false);

    async function handleGenerate(e: React.FormEvent) {
        e.preventDefault();
        setGenerating(true);
        setError('');
        setResults([]);
        setGenerated(false);
        try {
            const data = await apiRequest('/leads/generate', {
                method: 'POST', body: JSON.stringify(form),
            });
            if (data.error) { setError(data.error); }
            else { setResults(data.leads || []); setGenerated(true); }
        } catch (err) { setError((err as Error).message || 'Generation failed'); }
        finally { setGenerating(false); }
    }

    const presets = [
        { label: '🏢 SaaS Sales Leaders', industry: 'SaaS', role: 'VP of Sales', company_size: '100-500' },
        { label: '💳 FinTech CTOs', industry: 'FinTech', role: 'CTO', company_size: '50-200' },
        { label: '🏥 Healthcare Directors', industry: 'Healthcare', role: 'Director of Operations', company_size: '200+' },
        { label: '🛒 E-commerce CMOs', industry: 'E-commerce', role: 'CMO', company_size: '50-500' },
        { label: '🤖 AI Startup Founders', industry: 'Artificial Intelligence', role: 'CEO / Founder', company_size: '10-50' },
        { label: '🔐 Cybersecurity VPs', industry: 'Cybersecurity', role: 'VP of Engineering', company_size: '100-500' },
    ];

    const fields = [
        { key: 'industry', label: 'Target Industry', icon: Building2, placeholder: 'e.g. SaaS, FinTech, Healthcare', required: true },
        { key: 'role', label: 'Target Role', icon: Briefcase, placeholder: 'e.g. VP of Sales, CTO, Director', required: true },
        { key: 'company_size', label: 'Company Size', icon: Users, placeholder: 'e.g. 50-200, 500+' },
        { key: 'location', label: 'Location', icon: MapPin, placeholder: 'e.g. San Francisco, New York' },
    ];

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content page-glow">
                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Prospect Builder</h1>
                        <span style={{
                            fontSize: 10, fontWeight: 600, padding: '3px 10px',
                            borderRadius: 6, background: 'rgba(139,92,246,0.1)',
                            color: 'var(--violet)', textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>
                            AI Powered
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        Define your ideal customer profile and generate scored, qualified prospects instantly
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: generated ? '420px 1fr' : '1fr', gap: 24 }}>
                    {/* Form side */}
                    <div>
                        {/* Presets */}
                        <div className="card-padded" style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <Sparkles size={14} style={{ color: 'var(--amber)' }} />
                                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Quick Presets
                                </p>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {presets.map((preset, i) => {
                                    const active = form.industry === preset.industry && form.role === preset.role;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setForm(f => ({ ...f, industry: preset.industry, role: preset.role, company_size: preset.company_size }))}
                                            className={`pill ${active ? 'pill-active' : ''}`}
                                        >
                                            {preset.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Main form */}
                        <form onSubmit={handleGenerate}>
                            <div className="card-padded">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                                    <Target size={14} style={{ color: 'var(--indigo-light)' }} />
                                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Build Your ICP</p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                    {fields.map((field) => {
                                        const Icon = field.icon;
                                        return (
                                            <div key={field.key}>
                                                <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {field.label}{field.required ? ' *' : ''}
                                                </label>
                                                <div style={{ position: 'relative' }}>
                                                    <Icon size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                    <input
                                                        className="input"
                                                        required={field.required}
                                                        value={(form as any)[field.key]}
                                                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                                        placeholder={field.placeholder}
                                                        style={{ paddingLeft: 40 }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <div>
                                        <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Additional Criteria
                                        </label>
                                        <textarea
                                            className="input"
                                            value={form.additional_criteria}
                                            onChange={(e) => setForm({ ...form, additional_criteria: e.target.value })}
                                            placeholder="e.g. Companies that recently raised funding, using Salesforce..."
                                        />
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Number of leads
                                            </label>
                                            <span style={{
                                                fontSize: 14, fontWeight: 800, color: 'var(--indigo-light)',
                                                background: 'rgba(99,102,241,0.1)', padding: '2px 10px', borderRadius: 6,
                                            }}>
                                                {form.count}
                                            </span>
                                        </div>
                                        <input
                                            type="range" min={1} max={20} value={form.count}
                                            onChange={(e) => setForm({ ...form, count: parseInt(e.target.value) })}
                                            style={{ width: '100%', accentColor: 'var(--indigo)', height: 6 }}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div style={{
                                        padding: '12px 16px', borderRadius: 10, marginTop: 18,
                                        background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)',
                                        color: '#fb7185', fontSize: 13,
                                    }}>
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={generating}
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%', justifyContent: 'center', marginTop: 24,
                                        padding: '13px 24px', fontSize: 14,
                                        opacity: generating ? 0.7 : 1,
                                    }}
                                >
                                    {generating ? (
                                        <>
                                            <Loader size={16} className="spin" />
                                            Generating prospects...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={16} />
                                            Generate {form.count} prospects
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Results */}
                    {generated && (
                        <div className="fade-up">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {results.length} Prospects Generated
                                </h2>
                                <button onClick={() => router.push('/leads')} className="btn btn-ghost">
                                    View all in pipeline <ArrowRight size={14} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {results.map((lead, i) => (
                                    <div
                                        key={lead.id || i}
                                        className="card-padded fade-up"
                                        style={{ cursor: 'pointer', animationDelay: `${i * 0.05}s`, padding: 18 }}
                                        onClick={() => lead.id && router.push(`/leads/${lead.id}`)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 38, height: 38, borderRadius: 10,
                                                    background: lead.tier === 'Hot' ? 'linear-gradient(135deg, #f43f5e, #fb7185)' :
                                                        lead.tier === 'Warm' ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' :
                                                            'linear-gradient(135deg, #6366f1, #818cf8)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 12, fontWeight: 700, color: 'white',
                                                }}>
                                                    {lead.first_name?.[0]}{lead.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                                                        {lead.first_name} {lead.last_name}
                                                    </p>
                                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                                        {lead.title} at {lead.company}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                {lead.tier && (
                                                    <span className={`badge ${lead.tier === 'Hot' ? 'badge-hot' : lead.tier === 'Warm' ? 'badge-warm' : 'badge-cold'}`}>
                                                        {getTierEmoji(lead.tier)} {lead.tier}
                                                    </span>
                                                )}
                                                {lead.current_score != null && (
                                                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                                                        {Number(lead.current_score).toFixed(0)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                                            <span>{lead.email}</span>
                                            {lead.industry && <span>• {lead.industry}</span>}
                                            {lead.location && <span>• {lead.location}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
