'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    LayoutDashboard, Users, BarChart3, Settings,
    LogOut, Target, Zap, ShieldCheck,
} from 'lucide-react';

const nav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/scraper', label: 'Beast Scraper', icon: Target },
    { href: '/leads/generate', label: 'Lead Generator', icon: Zap },
    { href: '/email-verifier', label: 'Email Verifier', icon: ShieldCheck },
    { href: '/leads', label: 'Lead Manager', icon: Users },
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
                        width: 40, height: 40, borderRadius: 10,
                        background: '#0a0c14',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(16,185,129,0.2)',
                        boxShadow: '0 4px 14px rgba(16,185,129,0.15)',
                    }}>
                        <img src="/logo.png" alt="Lead Beast" style={{ width: 24, height: 24 }} />
                    </div>
                    <div>
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                            Lead Beast
                        </span>
                        <p style={{ fontSize: 10, color: 'var(--emerald)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Ultimate Lead Tool
                        </p>
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
                    let active = false;
                    if (item.href === '/leads') {
                        active = pathname === '/leads' || (pathname?.startsWith('/leads/') && !pathname?.startsWith('/leads/generate'));
                    } else {
                        active = pathname === item.href || pathname?.startsWith(item.href + '/');
                    }
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
                                background: active ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                border: active ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            <Icon size={17} style={{
                                color: active ? 'var(--emerald)' : 'var(--text-muted)',
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
