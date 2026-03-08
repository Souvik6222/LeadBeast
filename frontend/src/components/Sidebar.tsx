'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    LayoutDashboard, Users, BarChart3, Settings,
    LogOut, Target, Zap, Flame,
} from 'lucide-react';

const nav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/leads', label: 'Lead Database', icon: Users },
    { href: '/leads/generate', label: 'Prospect Builder', icon: Target },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push('/auth/login');
    }

    return (
        <aside className="sidebar">
            {/* Brand header */}
            <div style={{
                padding: '24px 24px 20px',
                borderBottom: '1px solid var(--border)',
            }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'var(--gradient-brand)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                    }}>
                        <Zap size={18} color="white" />
                    </div>
                    <div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                            LeadIntel
                        </span>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            AI Platform
                        </p>
                    </div>
                </Link>
            </div>

            {/* Hot leads quick access */}
            <div style={{ padding: '16px 16px 8px' }}>
                <Link href="/leads?tier=Hot" style={{ textDecoration: 'none' }}>
                    <div style={{
                        padding: '12px 16px',
                        background: 'rgba(244,63,94,0.06)',
                        border: '1px solid rgba(244,63,94,0.15)',
                        borderRadius: 12,
                        display: 'flex', alignItems: 'center', gap: 10,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}>
                        <Flame size={16} style={{ color: '#fb7185' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#fb7185' }}>
                            Hot Leads
                        </span>
                        <span style={{
                            marginLeft: 'auto', fontSize: 10, padding: '2px 8px',
                            borderRadius: 6, background: 'rgba(244,63,94,0.12)',
                            color: '#fb7185', fontWeight: 600,
                        }}>
                            Priority
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '8px 12px' }}>
                <p style={{
                    fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    padding: '12px 14px 8px',
                }}>
                    Navigation
                </p>
                {nav.map((item) => {
                    const active = pathname === item.href || pathname?.startsWith(item.href + '/');
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 16px', marginBottom: 3,
                                borderRadius: 10,
                                fontSize: 13.5,
                                fontWeight: active ? 600 : 400,
                                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                                background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                                border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            <Icon size={17} style={{
                                color: active ? 'var(--indigo-light)' : 'var(--text-muted)',
                                transition: 'color 0.2s',
                            }} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border)',
            }}>
                <button
                    onClick={handleSignOut}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: 13,
                        padding: '6px 0', fontFamily: 'inherit',
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rose)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                    <LogOut size={15} />
                    Sign out
                </button>
            </div>
        </aside>
    );
}
