import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrvpoqmndasttgroszku.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFydnBvcW1uZGFzdHRncm9zemt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NzcxNjcsImV4cCI6MjA4ODQ1MzE2N30._gwT0K2ulEVgJDu8XJcvbZpINaj6FbnyI5PuRhe-nGk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || 'Request failed');
    }

    return res.json();
}
