import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../utils/i18n';
import { getDashboardStats } from '../utils/api';
import './Home.css';

export default function Home({ lang }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getDashboardStats()
            .then((res) => setStats(res.data))
            .catch(() => setStats(null));
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero animate-in">
                <div className="hero-glow"></div>
                <h1 className="hero-title">{t(lang, 'hero_title')}</h1>
                <p className="hero-subtitle">{t(lang, 'hero_subtitle')}</p>

                <div className="hero-actions">
                    <Link to="/file" className="btn btn-primary btn-lg">
                        📝 {t(lang, 'hero_cta_file')}
                    </Link>
                    <Link to="/track" className="btn btn-secondary btn-lg">
                        🔍 {t(lang, 'hero_cta_track')}
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-lg" style={{ border: '1px solid rgba(0,255,136,0.3)' }}>
                        🏛️ {t(lang, 'hero_cta_govt_login')}
                    </Link>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="grid-4">
                    <div className="glass-card stat-card animate-in animate-in-delay-1">
                        <div className="stat-value">{stats?.total_grievances || 0}</div>
                        <div className="stat-label">{t(lang, 'total_grievances')}</div>
                    </div>
                    <div className="glass-card stat-card animate-in animate-in-delay-2">
                        <div className="stat-value" style={{ background: 'var(--gradient-green)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {stats?.resolved || 0}
                        </div>
                        <div className="stat-label">{t(lang, 'resolved')}</div>
                    </div>
                    <div className="glass-card stat-card animate-in animate-in-delay-3">
                        <div className="stat-value" style={{ background: 'var(--gradient-amber)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {stats?.resolution_rate || 0}%
                        </div>
                        <div className="stat-label">{t(lang, 'dash_resolution_rate')}</div>
                    </div>
                    <div className="glass-card stat-card animate-in animate-in-delay-4">
                        <div className="stat-value" style={{ background: 'var(--gradient-red)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {stats?.sla_breached || 0}
                        </div>
                        <div className="stat-label">{t(lang, 'sla_breached')}</div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="features-section animate-in">
                <h2 className="section-title">{t(lang, 'how_it_works')}</h2>
                <div className="grid-4" style={{ marginBottom: 40 }}>
                    <div className="glass-card feature-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>1️⃣</div>
                        <h3 style={{ fontSize: 15 }}>{t(lang, 'step1_title')}</h3>
                        <p style={{ fontSize: 13 }}>{t(lang, 'step1_desc')}</p>
                    </div>
                    <div className="glass-card feature-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>2️⃣</div>
                        <h3 style={{ fontSize: 15 }}>{t(lang, 'step2_title')}</h3>
                        <p style={{ fontSize: 13 }}>{t(lang, 'step2_desc')}</p>
                    </div>
                    <div className="glass-card feature-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>3️⃣</div>
                        <h3 style={{ fontSize: 15 }}>{t(lang, 'step3_title')}</h3>
                        <p style={{ fontSize: 13 }}>{t(lang, 'step3_desc')}</p>
                    </div>
                    <div className="glass-card feature-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>4️⃣</div>
                        <h3 style={{ fontSize: 15 }}>{t(lang, 'step4_title')}</h3>
                        <p style={{ fontSize: 13 }}>{t(lang, 'step4_desc')}</p>
                    </div>
                </div>
            </section>

            {/* Problem Context */}
            <section className="features-section animate-in">
                <div className="glass-card" style={{ padding: 32, borderLeft: '4px solid var(--accent-cyan)', marginBottom: 40 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 12, color: 'var(--accent-cyan)' }}>
                        📋 {t(lang, 'bg_title')}
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        {t(lang, 'bg_text_1')} <strong style={{ color: 'var(--text-primary)' }}>{t(lang, 'bg_text_highlight')}</strong> {t(lang, 'bg_text_2')}
                        <strong style={{ color: 'var(--accent-green)' }}> {t(lang, 'bg_text_solution')}</strong> {t(lang, 'bg_text_3')}
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section animate-in">
                <h2 className="section-title">{t(lang, 'features_title')}</h2>
                <div className="grid-3">
                    <div className="glass-card feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3>{t(lang, 'feat_ai')}</h3>
                        <p>{t(lang, 'feat_ai_desc')}</p>
                    </div>
                    <div className="glass-card feature-card">
                        <div className="feature-icon">⏰</div>
                        <h3>{t(lang, 'feat_sla')}</h3>
                        <p>{t(lang, 'feat_sla_desc')}</p>
                    </div>
                    <div className="glass-card feature-card">
                        <div className="feature-icon">🌍</div>
                        <h3>{t(lang, 'feat_multi')}</h3>
                        <p>{t(lang, 'feat_multi_desc')}</p>
                    </div>
                    <div className="glass-card feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>{t(lang, 'feat_whistle')}</h3>
                        <p>{t(lang, 'feat_whistle_desc')}</p>
                    </div>
                    <div className="glass-card feature-card">
                        <div className="feature-icon">⚖️</div>
                        <h3>{t(lang, 'feat_lawyer')}</h3>
                        <p>{t(lang, 'feat_lawyer_desc')}</p>
                    </div>
                    <div className="glass-card feature-card">
                        <div className="feature-icon">🏢</div>
                        <h3>{t(lang, 'feat_dept')}</h3>
                        <p>{t(lang, 'feat_dept_desc')}</p>
                    </div>
                </div>
            </section>

            {/* Government Access */}
            <section className="features-section animate-in" style={{ textAlign: 'center', paddingBottom: 60 }}>
                <div className="glass-card" style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
                    <h3 style={{ fontSize: 18, marginBottom: 12 }}>🏛️ {t(lang, 'govt_officials')}</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
                        {t(lang, 'govt_desc')}
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        🔐 {t(lang, 'govt_login_btn')}
                    </Link>
                </div>
            </section>
        </div>
    );
}
