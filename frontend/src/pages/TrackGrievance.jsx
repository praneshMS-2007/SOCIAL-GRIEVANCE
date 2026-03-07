import { useState } from 'react';
import { t } from '../utils/i18n';
import { trackGrievance, rateGrievance } from '../utils/api';
import StarRating from '../components/StarRating';

export default function TrackGrievance({ lang }) {
    const [trackingId, setTrackingId] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rating, setRating] = useState(0);
    const [ratingSubmitted, setRatingSubmitted] = useState(false);

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!trackingId.trim()) return;
        setLoading(true);
        setError('');
        setData(null);
        try {
            const res = await trackGrievance(trackingId.trim());
            setData(res.data);
        } catch {
            setError('Grievance not found. Please check your tracking ID.');
        } finally {
            setLoading(false);
        }
    };

    const handleRate = async () => {
        if (!rating || !data?.grievance?.id) return;
        try {
            await rateGrievance(data.grievance.id, { rating });
            setRatingSubmitted(true);
            if (rating < 2) {
                setData({
                    ...data,
                    grievance: { ...data.grievance, status: 'reopened', quality_rating: rating }
                });
            }
        } catch {
            setError('Failed to submit rating');
        }
    };

    const getStatusBadge = (status) => (
        <span className={`badge badge-${status}`}>{t(lang, `status_${status}`)}</span>
    );

    return (
        <div className="page">
            <div className="page-header animate-in">
                <h1 className="page-title">{t(lang, 'track_title')}</h1>
                <p className="page-subtitle">{t(lang, 'track_subtitle')}</p>
            </div>

            <form onSubmit={handleTrack} style={{ maxWidth: 500, margin: '0 auto 32px', display: 'flex', gap: 12 }}>
                <input type="text" className="form-input" value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                    placeholder={t(lang, 'track_placeholder')}
                    style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? '...' : t(lang, 'btn_track')}
                </button>
            </form>

            {error && <div className="message message-error" style={{ maxWidth: 500, margin: '0 auto' }}>{error}</div>}

            {data?.grievance && (
                <div className="glass-card animate-in" style={{ maxWidth: 700, margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h2 style={{ fontSize: 20 }}>{data.grievance.title}</h2>
                        {getStatusBadge(data.grievance.status)}
                    </div>

                    <div className="grid-2" style={{ marginBottom: 24 }}>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>Department</div>
                            <div style={{ fontWeight: 600 }}>{data.grievance.category}</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>Urgency</div>
                            <span className={`badge badge-${data.grievance.urgency}`}>
                                {t(lang, `urgency_${data.grievance.urgency}`)}
                            </span>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>District</div>
                            <div>{data.grievance.district}</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>SLA Deadline</div>
                            <div>{new Date(data.grievance.sla_deadline).toLocaleString()}</div>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>Description</div>
                            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{data.grievance.description}</div>
                        </div>
                    </div>

                    {/* Escalation Timeline */}
                    {data.escalation_history?.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--accent-red)' }}>⚠️ Escalation History</h3>
                            <div className="timeline">
                                {data.escalation_history.map((e, i) => (
                                    <div key={i} className="timeline-item escalated">
                                        <div className="timeline-date">{new Date(e.escalated_at).toLocaleString()}</div>
                                        <div className="timeline-text">
                                            Level {e.escalation_level} — {e.reason}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quality Rating */}
                    {data.grievance.status === 'resolved' && !ratingSubmitted && (
                        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: 20, textAlign: 'center' }}>
                            <h3 style={{ marginBottom: 12 }}>{t(lang, 'rate_title')}</h3>
                            <StarRating rating={rating} setRating={setRating} />
                            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleRate} disabled={!rating}>
                                {t(lang, 'rate_submit')}
                            </button>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                                Rating below 2 stars will auto-reopen the grievance
                            </p>
                        </div>
                    )}

                    {ratingSubmitted && (
                        <div className="message message-success" style={{ textAlign: 'center' }}>
                            {rating < 2
                                ? '⚠️ Grievance has been reopened due to low rating'
                                : '✅ Thank you for your feedback!'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
