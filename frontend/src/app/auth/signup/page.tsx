'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, apiRequest } from '@/lib/supabase';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, User, Building2, Check, Sparkles } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({ full_name: '', email: '', organization: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [googleUser, setGoogleUser] = useState<any>(null);
    const [onboarding, setOnboarding] = useState(false);
    const [onboardForm, setOnboardForm] = useState({ full_name: '', organization: '' });

    useEffect(() => {
        async function checkGoogleUser() {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.app_metadata?.provider === 'google') {
                setGoogleUser(session.user);
                setOnboarding(true);
                setOnboardForm(f => ({
                    ...f,
                    full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                }));
            }
        }
        checkGoogleUser();
    }, []);

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await apiRequest('/auth/signup', {
                method: 'POST',
                body: JSON.stringify({
                    email: form.email, password: form.password,
                    full_name: form.full_name, organization_name: form.organization,
                }),
            });
            if (data.session) {
                await supabase.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                });
                router.push('/dashboard');
            } else if (data.user) {
                router.push('/auth/login?msg=check_email');
            } else {
                setError(data.detail || 'Signup failed');
            }
        } catch (err) {
            setError((err as Error).message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleOnboard(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await apiRequest('/auth/google-onboard', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: googleUser.id,
                    email: googleUser.email,
                    full_name: onboardForm.full_name,
                    organization_name: onboardForm.organization,
                }),
            });
            router.push('/dashboard');
        } catch (err) {
            setError((err as Error).message || 'Onboarding failed');
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

    const benefits = [
        'Free plan — no credit card required',
        'AI-powered prospect discovery',
        'Smart lead scoring & prioritization',
        'Team collaboration built in',
    ];

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            background: '#0a0c14',
        }}>
            {/* Left panel */}
            <div style={{
                width: 460, position: 'relative', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: '48px 44px',
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(160deg, #0f1a30 0%, #0f1117 50%, #0f1a20 100%)',
                    zIndex: 0,
                }} />
                <div style={{
                    position: 'absolute', top: '-20%', right: '-10%', width: '70%', height: '70%',
                    background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
                    zIndex: 0,
                }} />
                <div style={{
                    position: 'absolute', bottom: '-15%', left: '-10%', width: '60%', height: '60%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
                    zIndex: 0,
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: 'var(--gradient-brand)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                        }}>
                            <Zap size={20} color="white" />
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>LeadIntel</span>
                    </div>

                    <h2 style={{ fontSize: 28, fontWeight: 800, color: 'white', lineHeight: 1.25, marginBottom: 16 }}>
                        Start closing deals with{' '}
                        <span className="gradient-text">better data.</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.7, marginBottom: 44 }}>
                        Join growing teams using LeadIntel to find, score, and convert ideal customers.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {benefits.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{
                                    width: 24, height: 24, borderRadius: 8,
                                    background: 'rgba(16,185,129,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Check size={12} style={{ color: '#34d399' }} />
                                </div>
                                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', position: 'relative', zIndex: 1 }}>
                    © 2026 LeadIntel. All rights reserved.
                </p>
            </div>

            {/* Right panel */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-base)',
                borderLeft: '1px solid rgba(255,255,255,0.04)',
            }}>
                <div style={{ width: 380 }}>
                    {onboarding ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <Sparkles size={20} style={{ color: 'var(--amber)' }} />
                                <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>Almost there</h1>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>
                                Complete your profile to start generating leads
                            </p>
                            <form onSubmit={handleGoogleOnboard}>
                                <div style={{ marginBottom: 18 }}>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="input" required style={{ paddingLeft: 40 }}
                                            value={onboardForm.full_name}
                                            onChange={(e) => setOnboardForm({ ...onboardForm, full_name: e.target.value })}
                                            placeholder="Jane Smith" />
                                    </div>
                                </div>
                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization</label>
                                    <div style={{ position: 'relative' }}>
                                        <Building2 size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="input" required style={{ paddingLeft: 40 }}
                                            value={onboardForm.organization}
                                            onChange={(e) => setOnboardForm({ ...onboardForm, organization: e.target.value })}
                                            placeholder="Acme Corp" />
                                    </div>
                                </div>
                                {error && (
                                    <div style={{ padding: '10px 16px', borderRadius: 10, marginBottom: 20, background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', color: '#fb7185', fontSize: 13 }}>
                                        {error}
                                    </div>
                                )}
                                <button type="submit" disabled={loading} className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: 14, opacity: loading ? 0.7 : 1 }}>
                                    {loading ? 'Setting up...' : 'Launch dashboard'}
                                    {!loading && <ArrowRight size={15} />}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' }}>Create your account</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>
                                Get started free — takes under a minute
                            </p>

                            <button onClick={handleGoogle} className="btn btn-outline"
                                style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', marginBottom: 24, fontSize: 14 }}>
                                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
                                Continue with Google
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or sign up with email</span>
                                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                            </div>

                            <form onSubmit={handleSignup}>
                                <div style={{ marginBottom: 18 }}>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="input" required style={{ paddingLeft: 40 }}
                                            value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                            placeholder="Jane Smith" />
                                    </div>
                                </div>

                                <div style={{ marginBottom: 18 }}>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work email</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="email" className="input" required style={{ paddingLeft: 40 }}
                                            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="you@company.com" />
                                    </div>
                                </div>

                                <div style={{ marginBottom: 18 }}>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization</label>
                                    <div style={{ position: 'relative' }}>
                                        <Building2 size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="input" required style={{ paddingLeft: 40 }}
                                            value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })}
                                            placeholder="Acme Corp" />
                                    </div>
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type={showPass ? 'text' : 'password'} className="input" required style={{ paddingLeft: 40, paddingRight: 44 }}
                                            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            placeholder="Min. 6 characters" minLength={6} />
                                        <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                        }}>
                                            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div style={{ padding: '10px 16px', borderRadius: 10, marginBottom: 20, background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', color: '#fb7185', fontSize: 13 }}>
                                        {error}
                                    </div>
                                )}

                                <button type="submit" disabled={loading} className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '12px 24px', fontSize: 14, opacity: loading ? 0.7 : 1 }}>
                                    {loading ? 'Creating account...' : 'Create account'}
                                    {!loading && <ArrowRight size={15} />}
                                </button>
                            </form>

                            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 28 }}>
                                Already have an account?{' '}
                                <Link href="/auth/login" style={{ color: 'var(--indigo-light)', fontWeight: 600 }}>Sign in</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
