import { useState } from 'react';
import { t, DISTRICTS } from '../utils/i18n';
import { fileGrievance } from '../utils/api';

export default function FileGrievance({ lang }) {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [termsChecked, setTermsChecked] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', district: '', location: '',
        citizen_name: '', citizen_contact: '', is_anonymous: false, language: lang,
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    // Terms & Conditions gate
    if (!termsAccepted) {
        return (
            <div className="page">
                <div className="page-header animate-in">
                    <h1 className="page-title">{t(lang, 'file_title')}</h1>
                    <p className="page-subtitle">{t(lang, 'file_subtitle')}</p>
                </div>

                <div className="glass-card animate-in" style={{ maxWidth: 650, margin: '0 auto' }}>
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
                        📋 Grievance Terms and Conditions
                    </h2>

                    <div style={{
                        background: 'rgba(255, 71, 87, 0.08)',
                        border: '1px solid rgba(255, 71, 87, 0.25)',
                        borderRadius: 'var(--radius)',
                        padding: '20px 24px',
                        marginBottom: 24
                    }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-red)', marginBottom: 16 }}>
                            ⚠️ List of subjects/topics which can not be treated as grievance:
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--text-primary)' }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-red)', flexShrink: 0 }}></span>
                                RTI Matters
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--text-primary)' }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-red)', flexShrink: 0 }}></span>
                                Court related / Subjudice matters
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--text-primary)' }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-red)', flexShrink: 0 }}></span>
                                Religious matters
                            </li>
                        </ul>
                    </div>

                    <div style={{
                        background: 'rgba(0, 212, 255, 0.06)',
                        border: '1px solid rgba(0, 212, 255, 0.15)',
                        borderRadius: 'var(--radius)',
                        padding: '16px 20px',
                        marginBottom: 24,
                        fontSize: 14,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.7
                    }}>
                        <p>By proceeding, you confirm that your grievance does <strong style={{ color: 'var(--text-primary)' }}>not</strong> fall under any of the above categories. Grievances related to these subjects will not be processed and may be rejected.</p>
                        <p style={{ marginTop: 8 }}>Please ensure your complaint pertains to a genuine public service issue and provide accurate information.</p>
                    </div>

                    <label className="form-checkbox" style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius)', border: '1px solid var(--border-glass)' }}>
                        <input type="checkbox" checked={termsChecked} onChange={(e) => setTermsChecked(e.target.checked)} />
                        <span style={{ fontSize: 14 }}>
                            I have read and understood the above terms. My grievance does not relate to RTI, Court/Subjudice, or Religious matters.
                        </span>
                    </label>

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={!termsChecked}
                        onClick={() => setTermsAccepted(true)}
                    >
                        ✅ I Accept — Proceed to File Grievance
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.district) {
            setError('Please fill in title, description, and district');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fileGrievance({ ...form, language: lang });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to submit grievance');
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <div className="page">
                <div className="glass-card animate-in" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                    <h2 style={{ marginBottom: 16, color: 'var(--accent-green)' }}>Grievance Filed Successfully!</h2>
                    <div className="message message-success" style={{ textAlign: 'left' }}>
                        <p><strong>Tracking ID:</strong> {result.tracking_id}</p>
                        <p><strong>Department:</strong> {result.classification?.category}</p>
                        <p><strong>Urgency:</strong> <span className={`badge badge-${result.classification?.urgency}`}>{result.classification?.urgency}</span></p>
                        <p><strong>Sentiment Score:</strong> {(result.classification?.sentiment_score * 100).toFixed(0)}%</p>
                        <p><strong>SLA Deadline:</strong> {new Date(result.sla_deadline).toLocaleString()}</p>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 16, fontSize: 14 }}>
                        Save your tracking ID to check status later.
                    </p>
                    <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => { setResult(null); setForm({ title: '', description: '', district: '', location: '', citizen_name: '', citizen_contact: '', is_anonymous: false, language: lang }); }}>
                        File Another Grievance
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header animate-in">
                <h1 className="page-title">{t(lang, 'file_title')}</h1>
                <p className="page-subtitle">{t(lang, 'file_subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="glass-card animate-in" style={{ maxWidth: 700, margin: '0 auto' }}>
                {error && <div className="message message-error">{error}</div>}

                <div className="form-group">
                    <label className="form-label">{t(lang, 'field_title')} *</label>
                    <input type="text" className="form-input" value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Brief title of your complaint"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">{t(lang, 'field_description')} *</label>
                    <textarea className="form-textarea" value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Describe your complaint in detail..."
                    />
                </div>

                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">{t(lang, 'field_district')} *</label>
                        <select className="form-select" value={form.district}
                            onChange={(e) => setForm({ ...form, district: e.target.value })}>
                            <option value="">Select District</option>
                            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t(lang, 'field_location')}</label>
                        <input type="text" className="form-input" value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            placeholder="Street / Area"
                        />
                    </div>
                </div>

                {!form.is_anonymous && (
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">{t(lang, 'field_name')}</label>
                            <input type="text" className="form-input" value={form.citizen_name}
                                onChange={(e) => setForm({ ...form, citizen_name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t(lang, 'field_contact')}</label>
                            <input type="text" className="form-input" value={form.citizen_contact}
                                onChange={(e) => setForm({ ...form, citizen_contact: e.target.value })}
                                placeholder="Phone or Email"
                            />
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-checkbox">
                        <input type="checkbox" checked={form.is_anonymous}
                            onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })}
                        />
                        {t(lang, 'field_anonymous')}
                    </label>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
                    {loading ? t(lang, 'btn_submitting') : t(lang, 'btn_submit')}
                </button>
            </form>
        </div>
    );
}
