'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { ShieldCheck, UploadCloud, File, Trash2, CheckCircle, AlertTriangle, XCircle, Search, Copy, Download } from 'lucide-react';
import { apiRequest } from '@/lib/supabase';

export default function EmailVerifierPage() {
    const [mode, setMode] = useState<'single' | 'bulk'>('single');
    const [singleEmail, setSingleEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const [file, setFile] = useState<File | null>(null);
    const [bulkResults, setBulkResults] = useState<any[]>([]);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [isVerifyingBulk, setIsVerifyingBulk] = useState(false);

    const handleSingleVerify = async () => {
        if (!singleEmail) return;
        setLoading(true);
        try {
            const res = await apiRequest(`/tools/verify-email?email=${encodeURIComponent(singleEmail)}`);
            setResult(res.result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files?.length > 0) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleBulkVerify = async () => {
        if (!file) return;
        setIsVerifyingBulk(true);
        setBulkResults([]);

        try {
            const text = await file.text();
            // Find all valid email strings
            const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
            // Deduplicate
            const emails = Array.from(new Set(matches)).slice(0, 1000); // Limit to 1000 for frontend safety

            if (emails.length === 0) {
                alert("No valid email addresses found in the file.");
                setIsVerifyingBulk(false);
                return;
            }

            setProgress({ current: 0, total: emails.length });

            const results = [];
            // Process in chunks of 5
            for (let i = 0; i < emails.length; i += 5) {
                const chunk = emails.slice(i, i + 5);
                const promises = chunk.map(async (email) => {
                    try {
                        const res = await apiRequest(`/tools/verify-email?email=${encodeURIComponent(email)}`);
                        return { email, ...res.result };
                    } catch (e) {
                        return { email, is_valid_format: false, is_deliverable: false, error: true };
                    }
                });

                const chunkResults = await Promise.all(promises);
                results.push(...chunkResults);
                setProgress(p => ({ ...p, current: Math.min(p.current + 5, p.total) }));
                setBulkResults([...results]);
            }
        } catch (e) {
            console.error(e);
            alert("Error reading file");
        } finally {
            setIsVerifyingBulk(false);
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-content" style={{ padding: '32px 40px', background: '#09090b', minHeight: '100vh', width: '100%' }}>
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 8 }}>
                        Email Verifier
                    </h1>
                    <p style={{ color: '#a1a1aa', fontSize: 15 }}>
                        Verify email addresses in real-time to protect your sender reputation.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 24 }}>
                    {/* Left Column - Input */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', borderBottom: '1px solid #27272a' }}>
                                <button
                                    onClick={() => setMode('single')}
                                    style={{
                                        flex: 1, padding: '16px', background: mode === 'single' ? '#27272a' : 'transparent',
                                        border: 'none', color: mode === 'single' ? 'white' : '#a1a1aa', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                                        borderBottom: mode === 'single' ? '2px solid #10b981' : '2px solid transparent'
                                    }}
                                >
                                    Single Verification
                                </button>
                                <button
                                    onClick={() => setMode('bulk')}
                                    style={{
                                        flex: 1, padding: '16px', background: mode === 'bulk' ? '#27272a' : 'transparent',
                                        border: 'none', color: mode === 'bulk' ? 'white' : '#a1a1aa', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                                        borderBottom: mode === 'bulk' ? '2px solid #10b981' : '2px solid transparent'
                                    }}
                                >
                                    Bulk Upload (CSV)
                                </button>
                            </div>

                            <div style={{ padding: '24px' }}>
                                {mode === 'single' ? (
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#e4e4e7', marginBottom: 8 }}>Email Address</label>
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <input
                                                type="email"
                                                placeholder="john.doe@example.com"
                                                value={singleEmail}
                                                onChange={(e) => setSingleEmail(e.target.value)}
                                                style={{
                                                    flex: 1, background: '#09090b', border: '1px solid #27272a', borderRadius: 8, padding: '12px 16px', color: 'white', fontSize: 14,
                                                    outline: 'none', transition: 'border-color 0.2s'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                                onBlur={(e) => e.target.style.borderColor = '#27272a'}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSingleVerify()}
                                            />
                                            <button
                                                onClick={handleSingleVerify}
                                                disabled={loading || !singleEmail}
                                                style={{
                                                    background: '#10b981', color: 'white', border: 'none', borderRadius: 8, padding: '0 24px', fontSize: 14, fontWeight: 600,
                                                    cursor: loading || !singleEmail ? 'not-allowed' : 'pointer', opacity: loading || !singleEmail ? 0.7 : 1, transition: 'all 0.2s',
                                                    display: 'flex', alignItems: 'center', gap: 8
                                                }}
                                            >
                                                {loading ? <div className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <ShieldCheck size={18} />}
                                                Verify
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleFileDrop}
                                        style={{
                                            border: '2px dashed #27272a', borderRadius: 12, padding: '40px 24px', textAlign: 'center',
                                            background: '#09090b', cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#27272a'}
                                        onClick={() => document.getElementById('fileUpload')?.click()}
                                    >
                                        <input type="file" id="fileUpload" accept=".csv" style={{ display: 'none' }} onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                            <UploadCloud size={24} />
                                        </div>
                                        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 8 }}>Click to upload or drag and drop</h3>
                                        <p style={{ fontSize: 13, color: '#71717a' }}>CSV files only. Max 50,000 rows.</p>

                                        {file && (
                                            <div style={{ marginTop: 24, padding: '12px', background: '#18181b', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #27272a' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <File size={18} color="#10b981" />
                                                    <span style={{ fontSize: 13, color: 'white' }}>{file.name}</span>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                        {file && (
                                            <button
                                                style={{ marginTop: 16, width: '100%', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 600, cursor: isVerifyingBulk ? 'not-allowed' : 'pointer', opacity: isVerifyingBulk ? 0.7 : 1 }}
                                                onClick={(e) => { e.stopPropagation(); handleBulkVerify(); }}
                                                disabled={isVerifyingBulk}
                                            >
                                                {isVerifyingBulk ? `Verifying... (${progress.current}/${progress.total})` : 'Start Bulk Verification'}
                                            </button>
                                        )}
                                        {isVerifyingBulk && progress.total > 0 && (
                                            <div style={{ marginTop: 16 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, color: '#a1a1aa' }}>
                                                    <span>Progress</span>
                                                    <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                                                </div>
                                                <div style={{ height: 6, background: '#27272a', borderRadius: 3, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${(progress.current / progress.total) * 100}%`, background: '#10b981', borderRadius: 3, transition: 'width 0.3s' }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent History / Result block */}
                        <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: '24px', flex: 1 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 16 }}>Result</h2>
                            {mode === 'single' ? (
                                result ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', borderRadius: 12, background: result.is_valid_format && result.is_deliverable ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${result.is_valid_format && result.is_deliverable ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                                            {result.is_valid_format && result.is_deliverable ? (
                                                <CheckCircle size={32} color="#10b981" />
                                            ) : (
                                                <XCircle size={32} color="#ef4444" />
                                            )}
                                            <div>
                                                <h3 style={{ fontSize: 18, color: 'white', fontWeight: 600 }}>{singleEmail}</h3>
                                                <p style={{ color: result.is_valid_format && result.is_deliverable ? '#10b981' : '#ef4444', fontSize: 14, fontWeight: 500, marginTop: 4 }}>
                                                    {result.is_valid_format && result.is_deliverable ? 'Safe to Send' : 'Invalid / Do Not Send'}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div style={{ background: '#09090b', padding: '12px', borderRadius: 8, border: '1px solid #27272a' }}>
                                                <p style={{ fontSize: 12, color: '#71717a', marginBottom: 4 }}>Format Valid</p>
                                                <p style={{ fontSize: 14, color: 'white', fontWeight: 500 }}>{result.is_valid_format ? 'Yes' : 'No'}</p>
                                            </div>
                                            <div style={{ background: '#09090b', padding: '12px', borderRadius: 8, border: '1px solid #27272a' }}>
                                                <p style={{ fontSize: 12, color: '#71717a', marginBottom: 4 }}>Deliverable (MX)</p>
                                                <p style={{ fontSize: 14, color: 'white', fontWeight: 500 }}>{result.is_deliverable ? 'Yes' : 'No'}</p>
                                            </div>
                                            <div style={{ background: '#09090b', padding: '12px', borderRadius: 8, border: '1px solid #27272a' }}>
                                                <p style={{ fontSize: 12, color: '#71717a', marginBottom: 4 }}>Free Provider</p>
                                                <p style={{ fontSize: 14, color: 'white', fontWeight: 500 }}>{result.is_free_provider ? 'Yes' : 'No'}</p>
                                            </div>
                                            <div style={{ background: '#09090b', padding: '12px', borderRadius: 8, border: '1px solid #27272a' }}>
                                                <p style={{ fontSize: 12, color: '#71717a', marginBottom: 4 }}>Disposable</p>
                                                <p style={{ fontSize: 14, color: 'white', fontWeight: 500 }}>{result.is_disposable ? 'Yes' : 'No'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: '#71717a' }}>
                                        <Search size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                                        <p style={{ fontSize: 14 }}>Enter an email above to see verification results.</p>
                                    </div>
                                )
                            ) : (
                                bulkResults.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '400px', overflowY: 'auto', paddingRight: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #27272a', marginBottom: 8 }}>
                                            <span style={{ fontSize: 12, color: '#a1a1aa', flex: 1 }}>Email</span>
                                            <span style={{ fontSize: 12, color: '#a1a1aa', width: 100, textAlign: 'center' }}>Valid</span>
                                            <span style={{ fontSize: 12, color: '#a1a1aa', width: 100, textAlign: 'right' }}>Status</span>
                                        </div>
                                        {bulkResults.map((res, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px', background: '#09090b', borderRadius: 6, border: '1px solid #27272a' }}>
                                                <span style={{ fontSize: 13, color: 'white', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.email}</span>
                                                <span style={{ width: 100, textAlign: 'center' }}>
                                                    {res.is_valid_format && res.is_deliverable ? <CheckCircle size={16} color="#10b981" style={{ margin: '0 auto' }} /> : <XCircle size={16} color="#ef4444" style={{ margin: '0 auto' }} />}
                                                </span>
                                                <span style={{ fontSize: 12, width: 100, textAlign: 'right', color: res.is_valid_format && res.is_deliverable ? '#10b981' : '#ef4444' }}>
                                                    {res.is_valid_format && res.is_deliverable ? 'Safe' : 'Risky'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: '#71717a' }}>
                                        <File size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                                        <p style={{ fontSize: 14 }}>Upload a CSV file to see bulk verification results.</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Right Column - Stats / Recent */}
                    <div style={{ width: 350, display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: '24px' }}>
                            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 20 }}>Verification Stats</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontSize: 13, color: '#a1a1aa' }}>Safe to Send</span>
                                        <span style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>82%</span>
                                    </div>
                                    <div style={{ height: 6, background: '#27272a', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: '82%', background: '#10b981', borderRadius: 3 }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontSize: 13, color: '#a1a1aa' }}>Catch-all / Risky</span>
                                        <span style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>12%</span>
                                    </div>
                                    <div style={{ height: 6, background: '#27272a', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: '12%', background: '#f59e0b', borderRadius: 3 }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontSize: 13, color: '#a1a1aa' }}>Invalid (Bounces)</span>
                                        <span style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>6%</span>
                                    </div>
                                    <div style={{ height: 6, background: '#27272a', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: '6%', background: '#ef4444', borderRadius: 3 }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
