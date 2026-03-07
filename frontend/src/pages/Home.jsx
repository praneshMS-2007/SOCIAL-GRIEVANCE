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
                        🏛️ Government Login
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
                <h2 className="section-title">How It Works</h2>
                <div className="grid-4" style={{ marginBottom: 40 }}>
                    <div className="glass-card feature-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>1️⃣</div>
                        <h3 style={{ fontSize: 15 }}>File Complaint</h3>
                        <p style={{ fontSize: 13 }}>Submit your grievance in English, Hindi, or Tamil with full details</p>
                    </div>
                    <div className="glass-card feature-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>2️⃣</div>
                        <h3 style={{ fontSize: 15 }}>AI Classifies</h3>
                        <p style={{ fontSize: 13 }}>Gemini AI auto-routes to the right department with urgency & SLA</p>
                    </div>
                    <div className="glass-card feature-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>3️⃣</div>
                        <h3 style={{ fontSize: 15 }}>Department Acts</h3>
                        <p style={{ fontSize: 13 }}>The assigned department reviews and resolves your complaint</p>
                    </div>
                    <div className="glass-card feature-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>4️⃣</div>
                        <h3 style={{ fontSize: 15 }}>Track & Rate</h3>
                        <p style={{ fontSize: 13 }}>Track status anytime, rate the resolution, auto-reopen if unsatisfied</p>
                    </div>
                </div>
            </section>

            {/* Problem Context */}
            <section className="features-section animate-in">
                <div className="glass-card" style={{ padding: 32, borderLeft: '4px solid var(--accent-cyan)', marginBottom: 40 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 12, color: 'var(--accent-cyan)' }}>
                        📋 Background & Problem Context
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        India receives over <strong style={{ color: 'var(--text-primary)' }}>20 lakh citizen grievances annually</strong> through
                        platforms like CPGRAMS with resolution rates below 40% and average resolution times
                        exceeding 60 days. Citizens have no visibility into why their complaint is stalled. Officials
                        face zero measurable consequence for non-resolution. GrievanceAI is a
                        <strong style={{ color: 'var(--accent-green)' }}> next-generation AI-powered alternative</strong> that
                        ensures every complaint is classified, tracked, and resolved within SLA deadlines.
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section animate-in">
                <h2 className="section-title">Platform Features</h2>
                <div className="grid-3">
                    <div className="glass-card feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3>AI Classification</h3>
                        <p>Automatic department routing and urgency detection using Google Gemini AI</p>
                    </div>
                    <div className="glass-card feature-card">
                        <div className="feature-icon">⏰</div>
                        <h3>SLA Tracking</h3>
                        <p>Automated breach detection and escalation — no manual intervention needed</p>
                    </div>
                    <div className="glass-card feature-card">
                        <div className="feature-icon">🌍</div>
                        <h3>Multilingual</h3>
                        <p>File grievances in English, Hindi, or Tamil with full AI understanding</p>
                    </div>
                    <div className="glass-card feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Whistleblower</h3>
                        <p>Report corruption anonymously with complete identity protection</p>
                    </div>
                    <div className="glass-card feature-card">
                        <div className="feature-icon">⚖️</div>
                        <h3>Citizen Lawyer Bot</h3>
                        <p>AI-powered legal guidance on rights, entitlements, and escalation</p>
                    </div>
                    <div className="glass-card feature-card">
                        <div className="feature-icon">🏢</div>
                        <h3>Dept Dashboards</h3>
                        <p>Each department gets its own login to view and resolve their complaints</p>
                    </div>
                </div>
            </section>

            {/* Government Access */}
            <section className="features-section animate-in" style={{ textAlign: 'center', paddingBottom: 60 }}>
                <div className="glass-card" style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
                    <h3 style={{ fontSize: 18, marginBottom: 12 }}>🏛️ Government Officials</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
                        Admin and department officials can log in to manage and resolve grievances assigned to their department.
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        🔐 Official Login Portal
                    </Link>
                </div>
            </section>
        </div>
    );
}
