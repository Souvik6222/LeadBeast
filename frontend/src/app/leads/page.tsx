'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { supabase, apiRequest } from '@/lib/supabase';
import { formatScore, getTierEmoji, timeAgo } from '@/lib/utils';
import {
    Search, Plus, Upload, X, Loader2,
    Flame, Sun, Snowflake, Users, Filter, Download
} from 'lucide-react';

export default function LeadDatabasePage() {
    const router = useRouter();
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [tierFilter, setTierFilter] = useState('all');
    const [showAdd, setShowAdd] = useState(false);
    const [showImport, setShowImport] = useState(false);

    const [newLead, setNewLead] = useState({
        first_name: '', last_name: '', email: '', company: '', title: '', industry: '', location: '',
    });

    useEffect(() => {
        async function load() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push('/auth/login'); return; }
            try {
                const data = await apiRequest('/leads?limit=200');
                setLeads(data.leads || data.data || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        }
        load();
    }, [router]);

    const filtered = useMemo(() => {
        let result = leads;
        if (tierFilter !== 'all') result = result.filter(l => l.tier === tierFilter);
        if (search) {
            const s = search.toLowerCase();
            result = result.filter(l =>
                [l.first_name, l.last_name, l.email, l.company].some(v => v?.toLowerCase?.().includes(s))
            );
        }
        return result;
    }, [leads, search, tierFilter]);

    async function handleAddLead(e: React.FormEvent) {
        e.preventDefault();
        try {
            await apiRequest('/leads', { method: 'POST', body: JSON.stringify({ leads: [newLead], auto_enrich: true }) });
            setShowAdd(false);
            window.location.reload();
        } catch (err) { console.error(err); }
    }

    const tierFilters = [
        { value: 'all', label: 'All', icon: Users, color: '#a1a1aa' },
        { value: 'Hot', label: 'Hot', icon: Flame, color: '#fb7185' },
        { value: 'Warm', label: 'Warm', icon: Sun, color: '#fbbf24' },
        { value: 'Cold', label: 'Cold', icon: Snowflake, color: '#60a5fa' },
    ];

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ padding: '32px 40px', background: '#09090b', minHeight: '100vh', width: '100%' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 8 }}>
                            Lead Manager
                        </h1>
                        <p style={{ color: '#a1a1aa', fontSize: 15 }}>
                            {leads.length} total leads across your pipeline database.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => setShowImport(true)} style={{ background: '#18181b', color: 'white', border: '1px solid #27272a', borderRadius: 8, padding: '10px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Upload size={16} /> Import CSV
                        </button>
                        <button onClick={() => setShowAdd(true)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Plus size={16} /> Add Lead
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {tierFilters.map((f) => {
                            const active = tierFilter === f.value;
                            const Icon = f.icon;
                            return (
                                <button
                                    key={f.value}
                                    onClick={() => setTierFilter(f.value)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                                        background: active ? (f.value === 'all' ? '#27272a' : `${f.color}15`) : '#18181b',
                                        border: `1px solid ${active ? (f.value === 'all' ? '#3f3f46' : `${f.color}40`) : '#27272a'}`,
                                        color: active ? (f.value === 'all' ? 'white' : f.color) : '#a1a1aa',
                                    }}
                                >
                                    <Icon size={14} />
                                    {f.label}
                                </button>
                            );
                        })}
                        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: '#18181b', border: '1px solid #27272a', color: '#a1a1aa' }}>
                            <Filter size={14} /> More Filters
                        </button>
                    </div>

                    <div style={{ position: 'relative', width: 320 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#71717a' }} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or company..."
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px 10px 36px', background: '#18181b', border: '1px solid #27272a', borderRadius: 8, color: 'white', fontSize: 13, outline: 'none' }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Loader2 size={24} className="animate-spin" style={{ color: '#10b981' }} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: 80, textAlign: 'center', color: '#71717a' }}>
                            <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                            <p style={{ fontSize: 16, fontWeight: 500, color: 'white', marginBottom: 8 }}>No leads found</p>
                            <p style={{ fontSize: 14 }}>Add a lead or import a CSV list to start building your database.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #27272a' }}>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Info</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status / Score</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Added</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((lead) => (
                                    <tr key={lead.id} onClick={() => router.push(`/leads/${lead.id}`)} style={{ borderBottom: '1px solid #27272a', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#27272a'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: 10,
                                                    background: lead.tier === 'Hot' ? 'linear-gradient(135deg, #f43f5e, #fb7185)' :
                                                        lead.tier === 'Warm' ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' :
                                                            'linear-gradient(135deg, #6366f1, #818cf8)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 12, fontWeight: 700, color: 'white',
                                                }}>
                                                    {lead.first_name?.[0] || '?'}{lead.last_name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>
                                                        {lead.first_name} {lead.last_name}
                                                    </p>
                                                    <p style={{ fontSize: 12, color: '#a1a1aa' }}>{lead.title || 'Unknown Title'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <p style={{ fontSize: 13, color: 'white', marginBottom: 4 }}>{lead.email}</p>
                                            <p style={{ fontSize: 12, color: '#a1a1aa' }}>{lead.phone || 'No phone'}</p>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: 14, color: 'white' }}>{lead.company}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{
                                                        width: 32, height: 32, borderRadius: '50%',
                                                        background: !lead.current_score ? '#27272a' : lead.current_score >= 80 ? 'rgba(16,185,129,0.1)' : lead.current_score >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                                        border: `2px solid ${!lead.current_score ? '#3f3f46' : lead.current_score >= 80 ? '#10b981' : lead.current_score >= 50 ? '#f59e0b' : '#ef4444'}`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 12, fontWeight: 700, color: 'white'
                                                    }}>
                                                        {lead.current_score ? Math.round(lead.current_score) : '-'}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                        {lead.tier ? (
                                                            <span style={{ fontSize: 11, background: lead.tier === 'Hot' ? 'rgba(239,68,68,0.1)' : lead.tier === 'Warm' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)', color: lead.tier === 'Hot' ? '#ef4444' : lead.tier === 'Warm' ? '#f59e0b' : '#3b82f6', padding: '2px 8px', borderRadius: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                {getTierEmoji(lead.tier)} {lead.tier}
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: 11, background: '#27272a', color: '#a1a1aa', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>Unscored</span>
                                                        )}
                                                        {lead.bant_score > 0 && (
                                                            <span style={{ fontSize: 11, background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                                                                BANT: {lead.bant_score}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ fontSize: 11, color: '#a1a1aa' }}>Status:</span>
                                                    <span style={{ fontSize: 11, background: '#27272a', color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 500, textTransform: 'capitalize' }}>
                                                        {lead.lead_status || 'new'}
                                                    </span>
                                                    {lead.lead_source && (
                                                        <span style={{ fontSize: 11, color: '#71717a' }}>• {lead.lead_source}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontSize: 13, color: '#a1a1aa' }}>
                                            {timeAgo(lead.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Add Lead Modal */}
                {showAdd && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowAdd(false)}>
                        <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 16, width: 500, padding: 32 }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>Add New Lead</h2>
                                <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleAddLead}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    {['first_name', 'last_name', 'email', 'company', 'title', 'industry', 'location'].map((key) => (
                                        <div key={key} style={key === 'email' || key === 'company' ? { gridColumn: 'span 2' } : undefined}>
                                            <label style={{ fontSize: 12, color: '#a1a1aa', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                                {key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                            </label>
                                            <input
                                                required={['first_name', 'last_name', 'email'].includes(key)}
                                                value={(newLead as any)[key]}
                                                onChange={(e) => setNewLead({ ...newLead, [key]: e.target.value })}
                                                style={{ width: '100%', padding: '10px 12px', background: '#09090b', border: '1px solid #27272a', borderRadius: 8, color: 'white', fontSize: 14, outline: 'none' }}
                                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                                onBlur={(e) => e.target.style.borderColor = '#27272a'}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 32 }}>
                                    <button type="button" onClick={() => setShowAdd(false)} style={{ background: 'transparent', color: 'white', border: '1px solid #27272a', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Save Lead</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Import Modal */}
                {showImport && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowImport(false)}>
                        <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 16, width: 440, padding: 32 }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>Import CSV</h2>
                                <button onClick={() => setShowImport(false)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div style={{
                                border: '2px dashed #27272a', borderRadius: 12, padding: 48, textAlign: 'center', background: '#09090b',
                            }}>
                                <Upload size={32} style={{ margin: '0 auto 12px', color: '#10b981', opacity: 0.8 }} />
                                <p style={{ fontWeight: 600, color: 'white', marginBottom: 8 }}>
                                    Drop your CSV file here
                                </p>
                                <p style={{ fontSize: 13, color: '#71717a' }}>
                                    Required columns: first_name, last_name, email, company
                                </p>
                                <input type="file" accept=".csv" style={{ display: 'none' }} id="csv-input" />
                                <label htmlFor="csv-input" style={{ display: 'inline-block', marginTop: 24, background: '#27272a', color: 'white', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                                    Browse files
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
