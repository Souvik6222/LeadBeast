'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, apiRequest } from '@/lib/supabase';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Check } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            if (data.session) {
                await supabase.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                });
                router.push('/dashboard');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError((err as Error).message || 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) setError(error.message);
    }

    const features = [
        'AI lead scoring with 5-factor analysis',
        'Build targeted prospect lists in seconds',
        'Real-time pipeline intelligence',
        'Enterprise-grade data security',
    ];

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            background: '#0a0c14',
        }}>
            {/* Left panel — branding */}
            <div style={{
                width: 460, position: 'relative', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: '48px 44px',
            }}>
                {/* Background gradient */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(160deg, #111530 0%, #0f1117 50%, #1a0f24 100%)',
                    zIndex: 0,
                }} />
                <div style={{
                    position: 'absolute', top: '-20%', left: '-20%', width: '80%', height: '80%',
                    background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
                    zIndex: 0,
                }} />
                <div style={{
                    position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%',
                    background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
                    zIndex: 0,
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: '#0a0c14',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(16,185,129,0.2)',
                            boxShadow: '0 4px 14px rgba(16,185,129,0.15)',
                        }}>
                            <img src="/logo.png" alt="Lead Beast logo" style={{ width: 28, height: 28 }} />
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Lead Beast</span>
                    </div>

                    <h2 style={{ fontSize: 28, fontWeight: 800, color: 'white', lineHeight: 1.25, marginBottom: 16 }}>
                        Turn prospects into<br />
                        <span className="gradient-text">pipeline, faster.</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, marginBottom: 44 }}>
                        AI-powered lead intelligence that scores, ranks, and helps you prioritize your best opportunities.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {features.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{
                                    width: 24, height: 24, borderRadius: 8,
                                    background: 'rgba(16,185,129,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Check size={12} style={{ color: '#10b981' }} />
                                </div>
                                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', position: 'relative', zIndex: 1 }}>
                    © 2026 Lead Beast. All rights reserved.
                </p>
            </div>

            {/* Right panel — form */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-base)',
                borderLeft: '1px solid rgba(255,255,255,0.04)',
            }}>
                <div style={{ width: 380 }}>
                    <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' }}>Welcome back</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Sign in to your account to continue</p>

                    {/* Google OAuth */}
                    <button
                        onClick={handleGoogle}
                        className="btn btn-outline"
                        style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', marginBottom: 24, fontSize: 14 }}
                    >
                        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
                        Continue with Google
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: 18 }}>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email" required className="input"
                                    style={{ paddingLeft: 40 }}
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type={showPass ? 'text' : 'password'} required className="input"
                                    style={{ paddingLeft: 40, paddingRight: 44 }}
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                }}>
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                padding: '10px 16px', borderRadius: 10, marginBottom: 20,
                                background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)',
                                color: '#fb7185', fontSize: 13,
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit" disabled={loading}
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: 14, opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                            {!loading && <ArrowRight size={15} />}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 28 }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/signup" style={{ color: 'var(--emerald)', fontWeight: 600 }}>Get started free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
