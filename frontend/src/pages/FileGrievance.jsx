import { useState } from 'react';
import { t, DISTRICTS, translateDistrict, translateDept } from '../utils/i18n';
import { fileGrievance } from '../utils/api';

export default function FileGrievance({ lang }) {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [termsChecked, setTermsChecked] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', district: '',
        location: '', state: '', city: '', area: '', pincode: '', landmark: '',
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
                        📋 {t(lang, 'terms_title')}
                    </h2>

                    <div style={{
                        background: 'rgba(255, 71, 87, 0.08)',
                        border: '1px solid rgba(255, 71, 87, 0.25)',
                        borderRadius: 'var(--radius)',
                        padding: '20px 24px',
                        marginBottom: 24
                    }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-red)', marginBottom: 16 }}>
                            ⚠️ {t(lang, 'terms_list_title')}
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--text-primary)' }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-red)', flexShrink: 0 }}></span>
                                {t(lang, 'terms_rti')}
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--text-primary)' }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-red)', flexShrink: 0 }}></span>
                                {t(lang, 'terms_court')}
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--text-primary)' }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-red)', flexShrink: 0 }}></span>
                                {t(lang, 'terms_religion')}
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
                        <p>{t(lang, 'terms_desc_1')}</p>
                        <p style={{ marginTop: 8 }}>{t(lang, 'terms_desc_2')}</p>
                    </div>

                    <label className="form-checkbox" style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius)', border: '1px solid var(--border-glass)' }}>
                        <input type="checkbox" checked={termsChecked} onChange={(e) => setTermsChecked(e.target.checked)} />
                        <span style={{ fontSize: 14 }}>
                            {t(lang, 'terms_checkbox')}
                        </span>
                    </label>

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={!termsChecked}
                        onClick={() => setTermsAccepted(true)}
                    >
                        ✅ {t(lang, 'terms_accept')}
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.district || !form.location || !form.state || !form.city || !form.pincode) {
            setError(t(lang, 'error_fill_fields'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fileGrievance({ ...form, language: lang });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || t(lang, 'error'));
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <div className="page">
                <div className="glass-card animate-in" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                    <h2 style={{ marginBottom: 16, color: 'var(--accent-green)' }}>{t(lang, 'success_title')}</h2>
                    <div className="message message-success" style={{ textAlign: 'left' }}>
                        <p><strong>{t(lang, 'result_tracking_id')}:</strong> {result.tracking_id}</p>
                        <p><strong>{t(lang, 'result_department')}:</strong> {translateDept(lang, result.classification?.category)}</p>
                        <p><strong>{t(lang, 'result_urgency')}:</strong> <span className={`badge badge-${result.classification?.urgency}`}>{t(lang, `urgency_${result.classification?.urgency}`)}</span></p>
                        <p><strong>{t(lang, 'result_sentiment')}:</strong> {(result.classification?.sentiment_score * 100).toFixed(0)}%</p>
                        <p><strong>{t(lang, 'result_sla')}:</strong> {new Date(result.sla_deadline).toLocaleString()}</p>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 16, fontSize: 14 }}>
                        {t(lang, 'save_tracking_id')}
                    </p>
                    <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => { setResult(null); setForm({ title: '', description: '', district: '', location: '', state: '', city: '', area: '', pincode: '', landmark: '', citizen_name: '', citizen_contact: '', is_anonymous: false, language: lang }); }}>
                        {t(lang, 'file_another')}
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

                {/* Grievance Details */}
                <div className="form-group">
                    <label className="form-label">{t(lang, 'field_title')} *</label>
                    <input type="text" className="form-input" value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder={t(lang, 'placeholder_title')}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">{t(lang, 'field_description')} *</label>
                    <textarea className="form-textarea" value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder={t(lang, 'placeholder_desc')}
                    />
                </div>

                {/* Location Section */}
                <div style={{
                    background: 'rgba(0, 212, 255, 0.04)',
                    border: '1px solid rgba(0, 212, 255, 0.15)',
                    borderRadius: 'var(--radius)',
                    padding: '20px 24px',
                    marginBottom: 20,
                }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--accent-cyan)' }}>
                        {t(lang, 'location_section_title')}
                    </h3>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">{t(lang, 'field_district')} *</label>
                            <select className="form-select" value={form.district}
                                onChange={(e) => setForm({ ...form, district: e.target.value })}>
                                <option value="">{t(lang, 'select_district')}</option>
                                {DISTRICTS.map((d) => <option key={d} value={d}>{translateDistrict(lang, d)}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t(lang, 'field_state')} *</label>
                            <input type="text" className="form-input" value={form.state}
                                onChange={(e) => setForm({ ...form, state: e.target.value })}
                                placeholder={t(lang, 'placeholder_state')}
                            />
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">{t(lang, 'field_city')} *</label>
                            <input type="text" className="form-input" value={form.city}
                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                                placeholder={t(lang, 'placeholder_city')}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t(lang, 'field_pincode')} *</label>
                            <input type="text" className="form-input" value={form.pincode}
                                onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                placeholder={t(lang, 'placeholder_pincode')}
                                maxLength={6}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t(lang, 'field_location')} *</label>
                        <input type="text" className="form-input" value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            placeholder={t(lang, 'placeholder_location')}
                        />
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">{t(lang, 'field_area')}</label>
                            <input type="text" className="form-input" value={form.area}
                                onChange={(e) => setForm({ ...form, area: e.target.value })}
                                placeholder={t(lang, 'placeholder_area')}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t(lang, 'field_landmark')}</label>
                            <input type="text" className="form-input" value={form.landmark}
                                onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                                placeholder={t(lang, 'placeholder_landmark')}
                            />
                        </div>
                    </div>
                </div>

                {/* Personal Info */}
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
                                placeholder={t(lang, 'placeholder_contact')}
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
