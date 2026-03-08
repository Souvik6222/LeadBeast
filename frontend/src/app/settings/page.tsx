'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { Save, User, Building2, Bell, Shield, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState({ full_name: '', email: '', organization: '' });
    const [scoring, setScoring] = useState({ hot_threshold: 70, warm_threshold: 40 });
    const [notifications, setNotifications] = useState({
        email_new_leads: true, email_hot_leads: true, email_weekly_digest: false,
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        async function load() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.push('/auth/login'); return; }
            setProfile(p => ({ ...p, email: session.user.email || '' }));
        }
        load();
    }, [router]);

    function handleSave() {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User, desc: 'Manage your account details' },
        { id: 'scoring', label: 'Lead Scoring', icon: Shield, desc: 'Configure scoring thresholds' },
        { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email & alert preferences' },
    ];

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content page-glow">
                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Settings</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        Manage your account and workspace preferences
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 32 }}>
                    {/* Settings nav */}
                    <div style={{ width: 240, flexShrink: 0 }}>
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '14px 16px', width: '100%',
                                        borderRadius: 12, border: 'none',
                                        background: active ? 'rgba(99,102,241,0.08)' : 'transparent',
                                        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        fontSize: 14, fontWeight: active ? 600 : 400,
                                        cursor: 'pointer', textAlign: 'left',
                                        marginBottom: 4, fontFamily: 'inherit',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div className={`icon-box ${active ? 'indigo' : ''}`} style={{
                                        width: 34, height: 34, borderRadius: 9,
                                        background: active ? 'rgba(99,102,241,0.12)' : 'var(--bg-elevated)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Icon size={16} style={{ color: active ? 'var(--indigo-light)' : 'var(--text-muted)' }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: active ? 600 : 500 }}>{tab.label}</p>
                                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{tab.desc}</p>
                                    </div>
                                    <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)', opacity: active ? 1 : 0 }} />
                                </button>
                            );
                        })}
                    </div>

                    {/* Settings content */}
                    <div style={{ flex: 1, maxWidth: 620 }}>
                        {activeTab === 'profile' && (
                            <div className="card-padded fade-up">
                                <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                    Profile Details
                                </h2>
                                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
                                    Your personal information and organization settings
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div>
                                        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Full name
                                        </label>
                                        <input className="input" value={profile.full_name}
                                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                            placeholder="Your full name" />
                                    </div>

                                    <div>
                                        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Email
                                        </label>
                                        <input className="input" value={profile.email} disabled
                                            style={{ opacity: 0.5 }} />
                                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                                            Managed through your authentication provider
                                        </p>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Organization
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Building2 size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input className="input" style={{ paddingLeft: 38 }}
                                                value={profile.organization}
                                                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                                                placeholder="Your company name" />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: 28 }}>
                                    <button className="btn btn-primary" onClick={handleSave}>
                                        <Save size={15} />
                                        {saved ? '✓ Saved!' : 'Save changes'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'scoring' && (
                            <div className="card-padded fade-up">
                                <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                    Lead Scoring Thresholds
                                </h2>
                                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
                                    Configure how leads are classified into priority tiers
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                                    {/* Hot threshold */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(244,63,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: 14 }}>🔥</span>
                                                </div>
                                                <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>Hot Lead Threshold</span>
                                            </div>
                                            <span style={{
                                                fontSize: 15, fontWeight: 800, color: '#fb7185',
                                                background: 'rgba(244,63,94,0.1)', padding: '4px 12px', borderRadius: 8,
                                            }}>
                                                ≥ {scoring.hot_threshold}
                                            </span>
                                        </div>
                                        <input type="range" min={50} max={90} value={scoring.hot_threshold}
                                            onChange={(e) => setScoring({ ...scoring, hot_threshold: parseInt(e.target.value) })}
                                            style={{ width: '100%', accentColor: '#f43f5e', height: 6 }} />
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                                            Leads scoring at or above this threshold are marked as Hot and flagged for immediate action
                                        </p>
                                    </div>

                                    {/* Warm threshold */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: 14 }}>☀️</span>
                                                </div>
                                                <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>Warm Lead Threshold</span>
                                            </div>
                                            <span style={{
                                                fontSize: 15, fontWeight: 800, color: '#fbbf24',
                                                background: 'rgba(245,158,11,0.1)', padding: '4px 12px', borderRadius: 8,
                                            }}>
                                                ≥ {scoring.warm_threshold}
                                            </span>
                                        </div>
                                        <input type="range" min={20} max={scoring.hot_threshold - 1} value={scoring.warm_threshold}
                                            onChange={(e) => setScoring({ ...scoring, warm_threshold: parseInt(e.target.value) })}
                                            style={{ width: '100%', accentColor: '#f59e0b', height: 6 }} />
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                                            Leads between warm and hot thresholds are nurture candidates. Below warm = Cold tier.
                                        </p>
                                    </div>

                                    {/* Preview */}
                                    <div style={{
                                        background: 'var(--bg-surface)', borderRadius: 12, padding: 20,
                                        border: '1px solid var(--border)',
                                    }}>
                                        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                            Tier Preview
                                        </p>
                                        <div style={{ display: 'flex', gap: 16 }}>
                                            <div style={{ flex: 1, padding: '12px 16px', borderRadius: 10, background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', textAlign: 'center' }}>
                                                <span className="badge badge-hot" style={{ fontSize: 12 }}>🔥 Hot</span>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: '#fb7185', marginTop: 6 }}>≥ {scoring.hot_threshold}</p>
                                            </div>
                                            <div style={{ flex: 1, padding: '12px 16px', borderRadius: 10, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', textAlign: 'center' }}>
                                                <span className="badge badge-warm" style={{ fontSize: 12 }}>☀️ Warm</span>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', marginTop: 6 }}>{scoring.warm_threshold}–{scoring.hot_threshold - 1}</p>
                                            </div>
                                            <div style={{ flex: 1, padding: '12px 16px', borderRadius: 10, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', textAlign: 'center' }}>
                                                <span className="badge badge-cold" style={{ fontSize: 12 }}>❄️ Cold</span>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa', marginTop: 6 }}>&lt; {scoring.warm_threshold}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: 28 }}>
                                    <button className="btn btn-primary" onClick={handleSave}>
                                        <Save size={15} />
                                        {saved ? '✓ Saved!' : 'Save changes'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="card-padded fade-up">
                                <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                    Notification Preferences
                                </h2>
                                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
                                    Choose which email notifications you want to receive
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                    {[
                                        { key: 'email_new_leads', label: 'New leads imported', desc: 'Get notified when leads are imported or auto-generated', icon: '📥' },
                                        { key: 'email_hot_leads', label: 'Hot lead alerts', desc: 'Immediate notification when a lead is classified as Hot', icon: '🔥' },
                                        { key: 'email_weekly_digest', label: 'Weekly pipeline digest', desc: 'Summary of your lead pipeline delivered every Monday', icon: '📊' },
                                    ].map((opt, i) => {
                                        const isOn = (notifications as any)[opt.key];
                                        return (
                                            <div
                                                key={opt.key}
                                                style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '20px 0',
                                                    borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                    <div style={{
                                                        width: 36, height: 36, borderRadius: 10,
                                                        background: 'var(--bg-elevated)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 16,
                                                    }}>
                                                        {opt.icon}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{opt.label}</p>
                                                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{opt.desc}</p>
                                                    </div>
                                                </div>
                                                <div
                                                    className={`toggle-track ${isOn ? 'on' : 'off'}`}
                                                    onClick={() => setNotifications({ ...notifications, [opt.key]: !isOn })}
                                                >
                                                    <div className="toggle-knob" style={{ left: isOn ? 23 : 3 }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
