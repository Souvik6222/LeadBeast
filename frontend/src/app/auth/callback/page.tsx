'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RefreshCw } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        // Handle the OAuth callback
        const handleCallback = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Auth callback error:', error);
                    router.push('/auth/login?error=auth_failed');
                    return;
                }

                if (session?.user) {
                    // Check if user has a profile (org) already
                    try {
                        const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1';
                        const API_URL = rawApiUrl.endsWith('/v1') ? rawApiUrl : `${rawApiUrl}/v1`;
                        const res = await fetch(`${API_URL}/auth/check-profile`, {
                            headers: {
                                'Authorization': `Bearer ${session.access_token}`,
                                'Content-Type': 'application/json',
                            },
                        });
                        const data = await res.json();

                        if (data.has_profile) {
                            router.push('/dashboard');
                        } else {
                            // New Google user — needs onboarding
                            router.push('/auth/signup');
                        }
                    } catch {
                        // If check fails, go to signup for onboarding
                        router.push('/auth/signup');
                    }
                } else {
                    router.push('/auth/login');
                }
            } catch {
                router.push('/auth/login?error=callback_failed');
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#0b0f1a',
        }}>
            <div style={{ textAlign: 'center' }}>
                <RefreshCw size={28} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Completing sign in...</p>
            </div>
        </div>
    );
}
