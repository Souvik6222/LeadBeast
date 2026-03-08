'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { supabase, apiRequest } from '@/lib/supabase';
import { formatScore, getTierEmoji, timeAgo } from '@/lib/utils';
import {
    Search, Plus, Upload, X, Loader, ChevronDown,
    Flame, Sun, Snowflake, Users, Filter,
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
                setLeads(data.leads || []);
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
            await apiRequest('/leads', { method: 'POST', body: JSON.stringify(newLead) });
            setShowAdd(false);
            window.location.reload();
        } catch (err) { console.error(err); }
    }

    const tierFilters = [
        { value: 'all', label: 'All', icon: Users, color: 'var(--text-secondary)' },
        { value: 'Hot', label: 'Hot', icon: Flame, color: '#fb7185' },
        { value: 'Warm', label: 'Warm', icon: Sun, color: '#fbbf24' },
        { value: 'Cold', label: 'Cold', icon: Snowflake, color: '#60a5fa' },
    ];

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content page-glow">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Lead Database</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                            {leads.length} total leads across your pipeline
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-outline" onClick={() => setShowImport(true)}>
                            <Upload size={15} /> Import CSV
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                            <Plus size={15} /> Add lead
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
                        <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="input" placeholder="Search by name, email, or company..."
                            style={{ paddingLeft: 40 }}
                            value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {tierFilters.map((f) => {
                            const active = tierFilter === f.value;
                            const Icon = f.icon;
                            return (
                                <button
                                    key={f.value}
                                    onClick={() => setTierFilter(f.value)}
                                    className={`pill ${active ? 'pill-active' : ''}`}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        color: active ? f.color : undefined,
                                        borderColor: active ? (f.value === 'all' ? 'var(--border-accent)' : `${f.color}33`) : undefined,
                                        background: active && f.value !== 'all' ? `${f.color}0d` : undefined,
                                    }}
                                >
                                    <Icon size={13} />
                                    {f.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Table */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: 60, textAlign: 'center' }}>
                            <Loader size={20} className="spin" style={{ color: 'var(--indigo-light)' }} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.3, color: 'var(--indigo)' }} />
                            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>No leads found</p>
                            <p style={{ fontSize: 13 }}>Add or import leads to get started</p>
                        </div>
                    ) : (
                        <table className="tbl">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Company</th>
                                    <th>Score</th>
                                    <th>Tier</th>
                                    <th>Added</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((lead) => (
                                    <tr key={lead.id} onClick={() => router.push(`/leads/${lead.id}`)}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 34, height: 34, borderRadius: 9,
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
                                        <td style={{ fontSize: 13 }}>{lead.email}</td>
                                        <td style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{lead.company}</td>
                                        <td style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                                            {formatScore(lead.current_score)}
                                        </td>
                                        <td>
                                            {lead.tier ? (
                                                <span className={`badge ${lead.tier === 'Hot' ? 'badge-hot' : lead.tier === 'Warm' ? 'badge-warm' : 'badge-cold'}`}>
                                                    {getTierEmoji(lead.tier)} {lead.tier}
                                                </span>
                                            ) : (
                                                <span className="badge badge-muted">Unscored</span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
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
                    <div className="modal-overlay" onClick={() => setShowAdd(false)}>
                        <div className="modal-box" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Add New Lead</h2>
                                <button onClick={() => setShowAdd(false)} className="btn btn-ghost" style={{ padding: 6 }}>
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleAddLead}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    {['first_name', 'last_name', 'email', 'company', 'title', 'industry', 'location'].map((key) => (
                                        <div key={key} style={key === 'email' || key === 'company' ? { gridColumn: 'span 2' } : undefined}>
                                            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {key.replace('_', ' ')}
                                            </label>
                                            <input className="input"
                                                required={['first_name', 'last_name', 'email'].includes(key)}
                                                value={(newLead as any)[key]}
                                                onChange={(e) => setNewLead({ ...newLead, [key]: e.target.value })}
                                                placeholder={key.replace('_', ' ')} />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
                                    <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Add lead</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Import Modal */}
                {showImport && (
                    <div className="modal-overlay" onClick={() => setShowImport(false)}>
                        <div className="modal-box" style={{ width: 440 }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Import Leads</h2>
                                <button onClick={() => setShowImport(false)} className="btn btn-ghost" style={{ padding: 6 }}>
                                    <X size={18} />
                                </button>
                            </div>
                            <div style={{
                                border: '2px dashed var(--border-light)',
                                borderRadius: 14,
                                padding: 48,
                                textAlign: 'center',
                                background: 'var(--bg-surface)',
                            }}>
                                <Upload size={32} style={{ margin: '0 auto 12px', color: 'var(--indigo)', opacity: 0.6 }} />
                                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                                    Drop your CSV here
                                </p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    Required columns: first_name, last_name, email, company
                                </p>
                                <input type="file" accept=".csv" style={{ display: 'none' }} id="csv-input" />
                                <label htmlFor="csv-input" className="btn btn-outline" style={{ marginTop: 16, cursor: 'pointer' }}>
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
