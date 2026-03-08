import { Link, useLocation, useNavigate } from 'react-router-dom';
import { t, LANGUAGES } from '../utils/i18n';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar({ lang, setLang }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin, isDepartment } = useAuth();

    // Public links always visible
    const publicItems = [
        { path: '/', label: t(lang, 'nav_home'), icon: '🏠' },
        { path: '/file', label: t(lang, 'nav_file'), icon: '📝' },
        { path: '/track', label: t(lang, 'nav_track'), icon: '🔍' },
        { path: '/whistleblower', label: t(lang, 'nav_whistleblower'), icon: '🔒' },
        { path: '/lawyer-bot', label: t(lang, 'nav_lawyer'), icon: '⚖️' },
        { path: '/dashboard', label: t(lang, 'nav_dashboard'), icon: '📊' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">🏛️</span>
                    <span className="brand-text">GrievanceAI</span>
                </Link>

                <div className="navbar-links">
                    {publicItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}

                    {/* Admin link - only for admins */}
                    {isAdmin() && (
                        <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                            <span className="nav-icon">⚙️</span>
                            <span className="nav-label">{t(lang, 'nav_admin')}</span>
                        </Link>
                    )}

                    {/* Dept dashboard - only for department users */}
                    {isDepartment() && (
                        <Link to="/dept-dashboard" className={`nav-link ${location.pathname === '/dept-dashboard' ? 'active' : ''}`}>
                            <span className="nav-icon">🏢</span>
                            <span className="nav-label">{t(lang, 'dept_dashboard_title')}</span>
                        </Link>
                    )}
                </div>

                <div className="navbar-lang" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        className="lang-select"
                    >
                        {LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code}>
                                {l.native}
                            </option>
                        ))}
                    </select>

                    {user ? (
                        <button onClick={handleLogout} className="btn btn-secondary"
                            style={{ fontSize: 11, padding: '4px 12px', whiteSpace: 'nowrap' }}>
                            👋 {t(lang, 'nav_logout')}
                        </button>
                    ) : (
                        <Link to="/login" className="btn btn-primary"
                            style={{ fontSize: 11, padding: '4px 12px', whiteSpace: 'nowrap', textDecoration: 'none' }}>
                            🔐 {t(lang, 'nav_login')}
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
