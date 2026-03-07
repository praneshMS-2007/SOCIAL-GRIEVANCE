import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listGrievances, resolveGrievance } from '../utils/api';

export default function DeptDashboard({ lang }) {
    const { user } = useAuth();
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [resolving, setResolving] = useState(null);
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState('');

    const fetchGrievances = async () => {
        try {
            const params = { category: user.department };
            if (filter !== 'all') params.status = filter;
            const res = await listGrievances(params);
            setGrievances(res.data.grievances || []);
        } catch {
            setGrievances([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrievances();
    }, [filter]);

    const handleResolve = async (id) => {
        if (!notes.trim()) return;
        try {
            await resolveGrievance(id, { resolution_notes: notes });
            setMessage('✅ Grievance resolved successfully');
            setResolving(null);
            setNotes('');
            fetchGrievances();
            setTimeout(() => setMessage(''), 3000);
        } catch {
            setMessage('❌ Failed to resolve');
        }
    };

    const getTimeRemaining = (deadline) => {
        if (!deadline) return 'N/A';
        const diff = new Date(deadline) - new Date();
        if (diff < 0) return '⚠️ BREACHED';
        const hours = Math.floor(diff / 3600000);
        if (hours < 24) return `${hours}h remaining`;
        return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    };

    const stats = {
        total: grievances.length,
        open: grievances.filter(g => g.status === 'open').length,
        resolved: grievances.filter(g => g.status === 'resolved').length,
        escalated: grievances.filter(g => g.status === 'escalated').length,
    };

    return (
        <div className="page">
            <div className="page-header animate-in">
                <h1 className="page-title" style={{ fontSize: 22 }}>
                    🏢 {user?.department || 'Department'} Dashboard
                </h1>
                <p className="page-subtitle">
                    Welcome, {user?.display_name}. Manage complaints assigned to your department.
                </p>
            </div>

            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                <div className="glass-card stat-card animate-in">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total</div>
                </div>
                <div className="glass-card stat-card animate-in">
                    <div className="stat-value" style={{ color: 'var(--accent-amber)' }}>{stats.open}</div>
                    <div className="stat-label">Open</div>
                </div>
                <div className="glass-card stat-card animate-in">
                    <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{stats.resolved}</div>
                    <div className="stat-label">Resolved</div>
                </div>
                <div className="glass-card stat-card animate-in">
                    <div className="stat-value" style={{ color: 'var(--accent-red)' }}>{stats.escalated}</div>
                    <div className="stat-label">Escalated</div>
                </div>
            </div>

            {message && <div className="message message-success" style={{ marginBottom: 16 }}>{message}</div>}

            {/* Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {['all', 'open', 'escalated', 'resolved'].map(s => (
                    <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: 13, padding: '6px 16px' }}
                        onClick={() => setFilter(s)}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {/* Grievances List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</div>
            ) : grievances.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
                    <p style={{ color: 'var(--text-muted)' }}>No grievances found for your department.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {grievances.map(g => (
                        <div key={g.id} className="glass-card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <h3 style={{ fontSize: 16, marginBottom: 4 }}>{g.title}</h3>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        ID: {g.tracking_id} • {g.district} • SLA: {getTimeRemaining(g.sla_deadline)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span className={`badge badge-${g.urgency}`}>{g.urgency?.toUpperCase()}</span>
                                    <span className={`badge badge-${g.status}`}>{g.status?.toUpperCase()}</span>
                                </div>
                            </div>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                                {g.description?.substring(0, 150)}{g.description?.length > 150 ? '...' : ''}
                            </p>

                            {g.status !== 'resolved' && (
                                resolving === g.id ? (
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <input type="text" className="form-input" value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            placeholder="Resolution notes..." style={{ flex: 1, fontSize: 13 }} />
                                        <button className="btn btn-primary" style={{ fontSize: 13 }}
                                            onClick={() => handleResolve(g.id)}>Confirm</button>
                                        <button className="btn btn-secondary" style={{ fontSize: 13 }}
                                            onClick={() => { setResolving(null); setNotes(''); }}>Cancel</button>
                                    </div>
                                ) : (
                                    <button className="btn btn-primary" style={{ fontSize: 13, padding: '6px 16px' }}
                                        onClick={() => setResolving(g.id)}>
                                        ✅ Resolve
                                    </button>
                                )
                            )}
                            {g.status === 'resolved' && g.resolution_notes && (
                                <div style={{ fontSize: 12, color: 'var(--accent-green)', marginTop: 4 }}>
                                    ✅ {g.resolution_notes}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
