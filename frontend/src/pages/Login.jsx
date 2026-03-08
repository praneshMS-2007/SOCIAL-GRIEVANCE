import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils/i18n';

export default function Login({ lang }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) return;
        setLoading(true);
        setError('');
        try {
            const userData = await login(username, password);
            if (userData.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dept-dashboard');
            }
        } catch (err) {
            setError(t(lang, 'login_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass-card animate-in" style={{ maxWidth: 440, width: '100%', padding: 40 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🏛️</div>
                    <h1 style={{ fontSize: 24, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {t(lang, 'login_title')}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
                        {t(lang, 'login_subtitle')}
                    </p>
                </div>

                {error && <div className="message message-error" style={{ marginBottom: 16 }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">{t(lang, 'login_username')}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={t(lang, 'login_placeholder_user')}
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t(lang, 'login_password')}</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t(lang, 'login_placeholder_pass')}
                            autoComplete="current-password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 8 }}
                        disabled={loading}
                    >
                        {loading ? t(lang, 'login_signing') : `🔐 ${t(lang, 'login_btn')}`}
                    </button>
                </form>

                <div style={{ marginTop: 24, padding: 16, background: 'rgba(0,255,136,0.05)', borderRadius: 12, border: '1px solid rgba(0,255,136,0.1)' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                        <strong style={{ color: 'var(--accent-green)' }}>{t(lang, 'login_demo')}:</strong>
                    </p>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                        <div>{t(lang, 'login_demo_admin')}: <code>admin</code> / <code>admin123</code></div>
                        <div>{t(lang, 'login_demo_depts')}: <code>water</code>, <code>roads</code>, <code>electricity</code>, <code>healthcare</code>, <code>education</code>, <code>revenue</code>, <code>law</code>, <code>municipal</code> / <code>dept123</code></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
