import { useState } from 'react';
import { t, DISTRICTS, translateDept, translateDistrict } from '../utils/i18n';
import { fileWhistleblower, trackWhistleblower } from '../utils/api';
import './Whistleblower.css';

export default function Whistleblower({ lang }) {
    const [tab, setTab] = useState('file'); // file | track
    const [description, setDescription] = useState('');
    const [district, setDistrict] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [token, setToken] = useState('');
    const [trackResult, setTrackResult] = useState(null);
    const [error, setError] = useState('');

    const handleFile = async (e) => {
        e.preventDefault();
        if (!description.trim()) return;
        setLoading(true);
        setError('');
        try {
            const res = await fileWhistleblower({ description, district: district || 'Unknown', language: lang });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || t(lang, 'error'));
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!token.trim()) return;
        setLoading(true);
        setError('');
        setTrackResult(null);
        try {
            const res = await trackWhistleblower(token.trim());
            setTrackResult(res.data);
        } catch {
            setError(t(lang, 'whistle_not_found'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header animate-in">
                <h1 className="page-title">{t(lang, 'whistle_title')}</h1>
                <p className="page-subtitle">{t(lang, 'whistle_subtitle')}</p>
            </div>

            <div className="message message-info animate-in" style={{ maxWidth: 600, margin: '0 auto 24px' }}>
                {t(lang, 'whistle_privacy')}
            </div>

            <div className="whistle-tabs" style={{ maxWidth: 600, margin: '0 auto 24px' }}>
                <button className={`tab-btn ${tab === 'file' ? 'active' : ''}`} onClick={() => setTab('file')}>
                    🔒 {t(lang, 'whistle_file_tab')}
                </button>
                <button className={`tab-btn ${tab === 'track' ? 'active' : ''}`} onClick={() => setTab('track')}>
                    🔍 {t(lang, 'whistle_track_tab')}
                </button>
            </div>

            {tab === 'file' && !result && (
                <form onSubmit={handleFile} className="glass-card animate-in" style={{ maxWidth: 600, margin: '0 auto' }}>
                    {error && <div className="message message-error">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">{t(lang, 'field_district')}</label>
                        <select className="form-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
                            <option value="">{t(lang, 'select_district')}</option>
                            {DISTRICTS.map((d) => <option key={d} value={d}>{translateDistrict(lang, d)}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t(lang, 'whistle_report_details')} *</label>
                        <textarea className="form-textarea" value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t(lang, 'whistle_placeholder')}
                            style={{ minHeight: 180 }}
                        />
                    </div>

                    <button type="submit" className="btn btn-red" style={{ width: '100%' }} disabled={loading}>
                        {loading ? '...' : t(lang, 'whistle_submit')}
                    </button>
                </form>
            )}

            {tab === 'file' && result && (
                <div className="glass-card animate-in" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                    <h2 style={{ color: 'var(--accent-green)', marginBottom: 16 }}>{t(lang, 'whistle_report_filed')}</h2>
                    <div className="message message-success" style={{ textAlign: 'left' }}>
                        <p><strong>{t(lang, 'whistle_token_msg')}</strong></p>
                        <p style={{ fontSize: 24, fontFamily: 'monospace', wordBreak: 'break-all', marginTop: 8 }}>
                            {result.tracking_token}
                        </p>
                        <p style={{ marginTop: 12 }}><strong>{t(lang, 'result_department')}:</strong> {translateDept(lang, result.classification?.category)}</p>
                    </div>
                    <button className="btn btn-secondary" style={{ marginTop: 16 }}
                        onClick={() => navigator.clipboard.writeText(result.tracking_token)}>
                        📋 {t(lang, 'whistle_copy_token')}
                    </button>
                </div>
            )}

            {tab === 'track' && (
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <form onSubmit={handleTrack} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                        <input type="text" className="form-input" value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder={t(lang, 'whistle_enter_token')}
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading}>{t(lang, 'btn_track')}</button>
                    </form>

                    {error && <div className="message message-error">{error}</div>}

                    {trackResult && (
                        <div className="glass-card animate-in">
                            <div className="grid-2">
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t(lang, 'label_status')}</div>
                                    <span className={`badge badge-${trackResult.status}`}>{t(lang, `status_${trackResult.status}`)}</span>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t(lang, 'label_category')}</div>
                                    <div>{translateDept(lang, trackResult.category)}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t(lang, 'label_urgency')}</div>
                                    <span className={`badge badge-${trackResult.urgency}`}>{t(lang, `urgency_${trackResult.urgency}`)}</span>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{t(lang, 'label_escalation_level')}</div>
                                    <div>{trackResult.escalation_level}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
