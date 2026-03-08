import { useState, useEffect } from 'react';
import { t, translateDept, translateRole, translateDisplayName, translateDistrict } from '../utils/i18n';
import { listGrievances, resolveGrievance, listUsers, createUser, updateUser, deleteUser } from '../utils/api';

const DEPARTMENTS = [
    "All", "Water Supply & Sanitation", "Roads & Transport", "Electricity & Power",
    "Healthcare & Hospitals", "Education", "Revenue & Land",
    "Law & Order", "Municipal Administration"
];

export default function Admin({ lang }) {
    const [tab, setTab] = useState('grievances');

    return (
        <div className="page">
            <div className="page-header animate-in">
                <h1 className="page-title">⚙️ {t(lang, 'admin_title')}</h1>
                <p className="page-subtitle">{t(lang, 'admin_subtitle')}</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button className={`btn ${tab === 'grievances' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTab('grievances')}>
                    📋 {t(lang, 'admin_tab_grievances')}
                </button>
                <button className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTab('users')}>
                    👤 {t(lang, 'admin_tab_users')}
                </button>
            </div>

            {tab === 'grievances' ? <GrievancesTab lang={lang} /> : <UsersTab lang={lang} />}
        </div>
    );
}

// ────── Grievances Tab ──────
function GrievancesTab({ lang }) {
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dept, setDept] = useState('All');
    const [status, setStatus] = useState('All');
    const [resolving, setResolving] = useState(null);
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState('');

    const fetchGrievances = async () => {
        try {
            const params = {};
            if (dept !== 'All') params.category = dept;
            if (status !== 'All') params.status = status;
            const res = await listGrievances(params);
            setGrievances(res.data.grievances || []);
        } catch {
            setGrievances([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchGrievances(); }, [dept, status]);

    const handleResolve = async (id) => {
        if (!notes.trim()) return;
        try {
            await resolveGrievance(id, { resolution_notes: notes });
            setMessage(`✅ ${t(lang, 'admin_resolved_msg')}`);
            setResolving(null);
            setNotes('');
            fetchGrievances();
            setTimeout(() => setMessage(''), 3000);
        } catch {
            setMessage(`❌ ${t(lang, 'admin_resolve_fail')}`);
        }
    };

    const getTimeRemaining = (deadline) => {
        if (!deadline) return 'N/A';
        const diff = new Date(deadline) - new Date();
        if (diff < 0) return `⚠️ ${t(lang, 'admin_breached')}`;
        const hours = Math.floor(diff / 3600000);
        if (hours < 24) return `${hours}${t(lang, 'hours').charAt(0)}`;
        return `${Math.floor(hours / 24)}${t(lang, 'days').charAt(0)} ${hours % 24}${t(lang, 'hours').charAt(0)}`;
    };

    return (
        <>
            {/* Filters */}
            <div className="glass-card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>{t(lang, 'admin_filter_dept')}:</span>
                <select className="form-input" value={dept} onChange={e => setDept(e.target.value)} style={{ width: 200 }}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'All' ? t(lang, 'admin_filter_all') : translateDept(lang, d)}</option>)}
                </select>
                <span>{t(lang, 'admin_filter_status')}:</span>
                <select className="form-input" value={status} onChange={e => setStatus(e.target.value)} style={{ width: 140 }}>
                    {['All', 'open', 'escalated', 'resolved', 'reopened'].map(s =>
                        <option key={s} value={s}>{s === 'All' ? t(lang, 'admin_filter_all') : t(lang, `status_${s}`)}</option>
                    )}
                </select>
                <span style={{ color: 'var(--text-muted)' }}>{grievances.length} {t(lang, 'admin_grievance_count')}</span>
            </div>

            {message && <div className="message message-success" style={{ marginBottom: 16 }}>{message}</div>}

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>{t(lang, 'loading')}</div>
            ) : grievances.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                    <p style={{ color: 'var(--text-muted)' }}>{t(lang, 'no_data')}</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {grievances.map(g => (
                        <div key={g.id} className="glass-card" style={{ padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <div>
                                    <strong>{g.tracking_id}</strong> — {g.title}
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                        {translateDept(lang, g.category)} • {translateDistrict(lang, g.district)} • SLA: {getTimeRemaining(g.sla_deadline)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <span className={`badge badge-${g.urgency}`}>{t(lang, `urgency_${g.urgency}`)?.toUpperCase()}</span>
                                    <span className={`badge badge-${g.status}`}>{t(lang, `status_${g.status}`)?.toUpperCase()}</span>
                                </div>
                            </div>
                            {g.status !== 'resolved' && (
                                resolving === g.id ? (
                                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                        <input className="form-input" value={notes} onChange={e => setNotes(e.target.value)}
                                            placeholder={t(lang, 'admin_resolve_placeholder')} style={{ flex: 1, fontSize: 13 }} />
                                        <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => handleResolve(g.id)}>{t(lang, 'admin_confirm')}</button>
                                        <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => { setResolving(null); setNotes(''); }}>{t(lang, 'admin_cancel')}</button>
                                    </div>
                                ) : (
                                    <button className="btn btn-primary" style={{ fontSize: 12, marginTop: 8 }} onClick={() => setResolving(g.id)}>{t(lang, 'admin_resolve')}</button>
                                )
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

// ────── Users Tab ──────
function UsersTab({ lang }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [form, setForm] = useState({ username: '', password: '', role: 'department', department: '', display_name: '' });

    const fetchUsers = async () => {
        try {
            const res = await listUsers();
            setUsers(res.data.users || []);
        } catch {
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleCreate = async () => {
        if (!form.username || !form.password) return;
        try {
            await createUser(form);
            setMessage(`✅ ${t(lang, 'admin_user_created')}`);
            setShowCreate(false);
            setForm({ username: '', password: '', role: 'department', department: '', display_name: '' });
            fetchUsers();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('❌ ' + (err.response?.data?.detail || t(lang, 'admin_create_fail')));
        }
    };

    const handleUpdate = async (id) => {
        try {
            const data = {};
            if (form.password) data.password = form.password;
            if (form.role) data.role = form.role;
            if (form.department !== undefined) data.department = form.department;
            if (form.display_name) data.display_name = form.display_name;
            await updateUser(id, data);
            setMessage(`✅ ${t(lang, 'admin_user_updated')}`);
            setEditing(null);
            fetchUsers();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('❌ ' + (err.response?.data?.detail || t(lang, 'admin_update_fail')));
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteUser(id);
            setMessage(`✅ ${t(lang, 'admin_user_deleted')}`);
            setConfirmDelete(null);
            fetchUsers();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('❌ ' + (err.response?.data?.detail || t(lang, 'admin_delete_fail')));
            setConfirmDelete(null);
        }
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ color: 'var(--text-muted)' }}>{users.length} {t(lang, 'admin_user_count')}</span>
                <button className="btn btn-primary" onClick={() => { setShowCreate(!showCreate); setEditing(null); }}>
                    ➕ {t(lang, 'admin_add_user')}
                </button>
            </div>

            {message && <div className="message message-success" style={{ marginBottom: 16 }}>{message}</div>}

            {/* Create Form */}
            {showCreate && (
                <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16 }}>{t(lang, 'admin_create_user')}</h3>
                    <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
                        <div>
                            <label className="form-label">{t(lang, 'admin_username')}</label>
                            <input className="form-input" value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })} placeholder="e.g. newuser" />
                        </div>
                        <div>
                            <label className="form-label">{t(lang, 'admin_password')}</label>
                            <input className="form-input" type="password" value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })} placeholder={t(lang, 'admin_password')} />
                        </div>
                        <div>
                            <label className="form-label">{t(lang, 'admin_role')}</label>
                            <select className="form-input" value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}>
                                <option value="admin">{translateRole(lang, 'admin')}</option>
                                <option value="department">{translateRole(lang, 'department')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">{t(lang, 'admin_department')}</label>
                            <select className="form-input" value={form.department}
                                onChange={e => setForm({ ...form, department: e.target.value })}>
                                <option value="">{t(lang, 'admin_none')}</option>
                                {DEPARTMENTS.slice(1).map(d => <option key={d} value={d}>{translateDept(lang, d)}</option>)}
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">{t(lang, 'admin_display_name')}</label>
                            <input className="form-input" value={form.display_name}
                                onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="e.g. John Doe" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" onClick={handleCreate}>{t(lang, 'admin_create')}</button>
                        <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>{t(lang, 'admin_cancel')}</button>
                    </div>
                </div>
            )}

            {/* Users List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>{t(lang, 'loading')}</div>
            ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                    {users.map(u => (
                        <div key={u.id} className="glass-card" style={{ padding: 16 }}>
                            {editing === u.id ? (
                                /* Edit Mode */
                                <div>
                                    <div className="grid-2" style={{ gap: 10, marginBottom: 12 }}>
                                        <div>
                                            <label className="form-label" style={{ fontSize: 11 }}>{t(lang, 'admin_new_password')}</label>
                                            <input className="form-input" type="password" value={form.password}
                                                onChange={e => setForm({ ...form, password: e.target.value })} placeholder={t(lang, 'admin_password')} />
                                        </div>
                                        <div>
                                            <label className="form-label" style={{ fontSize: 11 }}>{t(lang, 'admin_role')}</label>
                                            <select className="form-input" value={form.role}
                                                onChange={e => setForm({ ...form, role: e.target.value })}>
                                                <option value="admin">{translateRole(lang, 'admin')}</option>
                                                <option value="department">{translateRole(lang, 'department')}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label" style={{ fontSize: 11 }}>{t(lang, 'admin_department')}</label>
                                            <select className="form-input" value={form.department}
                                                onChange={e => setForm({ ...form, department: e.target.value })}>
                                                <option value="">{t(lang, 'admin_none')}</option>
                                                {DEPARTMENTS.slice(1).map(d => <option key={d} value={d}>{translateDept(lang, d)}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label" style={{ fontSize: 11 }}>{t(lang, 'admin_display_name')}</label>
                                            <input className="form-input" value={form.display_name}
                                                onChange={e => setForm({ ...form, display_name: e.target.value })} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => handleUpdate(u.id)}>{t(lang, 'admin_save')}</button>
                                        <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => setEditing(null)}>{t(lang, 'admin_cancel')}</button>
                                    </div>
                                </div>
                            ) : (
                                /* View Mode */
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <strong style={{ fontSize: 15 }}>{translateDisplayName(lang, u.display_name || u.username)}</strong>
                                            <span className={`badge ${u.role === 'admin' ? 'badge-critical' : 'badge-open'}`}
                                                style={{ fontSize: 10 }}>
                                                {translateRole(lang, u.role).toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            @{u.username} {u.department ? `• ${translateDept(lang, u.department)}` : ''}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 12px' }}
                                            onClick={() => {
                                                setEditing(u.id);
                                                setShowCreate(false);
                                                setForm({ password: '', role: u.role, department: u.department || '', display_name: u.display_name || '' });
                                            }}>
                                            ✏️ {t(lang, 'admin_edit')}
                                        </button>
                                        {u.username !== 'admin' && (
                                            confirmDelete === u.id ? (
                                                <>
                                                    <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 12px', color: 'var(--accent-red)', background: 'rgba(255,0,80,0.15)' }}
                                                        onClick={() => handleDelete(u.id)}>
                                                        ⚠️ {t(lang, 'admin_confirm_delete')}
                                                    </button>
                                                    <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 12px' }}
                                                        onClick={() => setConfirmDelete(null)}>
                                                        {t(lang, 'admin_cancel')}
                                                    </button>
                                                </>
                                            ) : (
                                                <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 12px', color: 'var(--accent-red)' }}
                                                    onClick={() => setConfirmDelete(u.id)}>
                                                    🗑️ {t(lang, 'admin_delete')}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
