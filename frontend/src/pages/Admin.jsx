import { useState, useEffect } from 'react';
import { t } from '../utils/i18n';
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
                <h1 className="page-title">⚙️ Admin Panel</h1>
                <p className="page-subtitle">Superadmin — Manage grievances and users</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button className={`btn ${tab === 'grievances' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTab('grievances')}>
                    📋 Grievances
                </button>
                <button className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTab('users')}>
                    👤 User Management
                </button>
            </div>

            {tab === 'grievances' ? <GrievancesTab lang={lang} /> : <UsersTab />}
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
            setMessage('✅ Grievance resolved');
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
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    };

    return (
        <>
            {/* Filters */}
            <div className="glass-card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <span>Department:</span>
                <select className="form-input" value={dept} onChange={e => setDept(e.target.value)} style={{ width: 200 }}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <span>Status:</span>
                <select className="form-input" value={status} onChange={e => setStatus(e.target.value)} style={{ width: 140 }}>
                    {['All', 'open', 'escalated', 'resolved', 'reopened'].map(s =>
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    )}
                </select>
                <span style={{ color: 'var(--text-muted)' }}>{grievances.length} grievances</span>
            </div>

            {message && <div className="message message-success" style={{ marginBottom: 16 }}>{message}</div>}

            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
            ) : grievances.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                    <p style={{ color: 'var(--text-muted)' }}>No data available</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {grievances.map(g => (
                        <div key={g.id} className="glass-card" style={{ padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <div>
                                    <strong>{g.tracking_id}</strong> — {g.title}
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                        {g.category} • {g.district} • SLA: {getTimeRemaining(g.sla_deadline)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <span className={`badge badge-${g.urgency}`}>{g.urgency?.toUpperCase()}</span>
                                    <span className={`badge badge-${g.status}`}>{g.status?.toUpperCase()}</span>
                                </div>
                            </div>
                            {g.status !== 'resolved' && (
                                resolving === g.id ? (
                                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                        <input className="form-input" value={notes} onChange={e => setNotes(e.target.value)}
                                            placeholder="Resolution notes..." style={{ flex: 1, fontSize: 13 }} />
                                        <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => handleResolve(g.id)}>Confirm</button>
                                        <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => { setResolving(null); setNotes(''); }}>Cancel</button>
                                    </div>
                                ) : (
                                    <button className="btn btn-primary" style={{ fontSize: 12, marginTop: 8 }} onClick={() => setResolving(g.id)}>Resolve</button>
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
function UsersTab() {
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
            setMessage('✅ User created');
            setShowCreate(false);
            setForm({ username: '', password: '', role: 'department', department: '', display_name: '' });
            fetchUsers();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('❌ ' + (err.response?.data?.detail || 'Failed to create'));
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
            setMessage('✅ User updated');
            setEditing(null);
            fetchUsers();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('❌ ' + (err.response?.data?.detail || 'Failed to update'));
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteUser(id);
            setMessage('✅ User deleted');
            setConfirmDelete(null);
            fetchUsers();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('❌ ' + (err.response?.data?.detail || 'Failed to delete'));
            setConfirmDelete(null);
        }
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ color: 'var(--text-muted)' }}>{users.length} users</span>
                <button className="btn btn-primary" onClick={() => { setShowCreate(!showCreate); setEditing(null); }}>
                    ➕ Add User
                </button>
            </div>

            {message && <div className="message message-success" style={{ marginBottom: 16 }}>{message}</div>}

            {/* Create Form */}
            {showCreate && (
                <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16 }}>Create New User</h3>
                    <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
                        <div>
                            <label className="form-label">Username</label>
                            <input className="form-input" value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })} placeholder="e.g. newuser" />
                        </div>
                        <div>
                            <label className="form-label">Password</label>
                            <input className="form-input" type="password" value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" />
                        </div>
                        <div>
                            <label className="form-label">Role</label>
                            <select className="form-input" value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}>
                                <option value="admin">Admin</option>
                                <option value="department">Department</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Department</label>
                            <select className="form-input" value={form.department}
                                onChange={e => setForm({ ...form, department: e.target.value })}>
                                <option value="">None</option>
                                {DEPARTMENTS.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Display Name</label>
                            <input className="form-input" value={form.display_name}
                                onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="e.g. John Doe" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" onClick={handleCreate}>Create</button>
                        <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Users List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
            ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                    {users.map(u => (
                        <div key={u.id} className="glass-card" style={{ padding: 16 }}>
                            {editing === u.id ? (
                                /* Edit Mode */
                                <div>
                                    <div className="grid-2" style={{ gap: 10, marginBottom: 12 }}>
                                        <div>
                                            <label className="form-label" style={{ fontSize: 11 }}>New Password (leave blank to keep)</label>
                                            <input className="form-input" type="password" value={form.password}
                                                onChange={e => setForm({ ...form, password: e.target.value })} placeholder="New password" />
                                        </div>
                                        <div>
                                            <label className="form-label" style={{ fontSize: 11 }}>Role</label>
                                            <select className="form-input" value={form.role}
                                                onChange={e => setForm({ ...form, role: e.target.value })}>
                                                <option value="admin">Admin</option>
                                                <option value="department">Department</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label" style={{ fontSize: 11 }}>Department</label>
                                            <select className="form-input" value={form.department}
                                                onChange={e => setForm({ ...form, department: e.target.value })}>
                                                <option value="">None</option>
                                                {DEPARTMENTS.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label" style={{ fontSize: 11 }}>Display Name</label>
                                            <input className="form-input" value={form.display_name}
                                                onChange={e => setForm({ ...form, display_name: e.target.value })} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => handleUpdate(u.id)}>Save</button>
                                        <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => setEditing(null)}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                /* View Mode */
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <strong style={{ fontSize: 15 }}>{u.display_name || u.username}</strong>
                                            <span className={`badge ${u.role === 'admin' ? 'badge-critical' : 'badge-open'}`}
                                                style={{ fontSize: 10 }}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            @{u.username} {u.department ? `• ${u.department}` : ''}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 12px' }}
                                            onClick={() => {
                                                setEditing(u.id);
                                                setShowCreate(false);
                                                setForm({ password: '', role: u.role, department: u.department || '', display_name: u.display_name || '' });
                                            }}>
                                            ✏️ Edit
                                        </button>
                                        {u.username !== 'admin' && (
                                            confirmDelete === u.id ? (
                                                <>
                                                    <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 12px', color: 'var(--accent-red)', background: 'rgba(255,0,80,0.15)' }}
                                                        onClick={() => handleDelete(u.id)}>
                                                        ⚠️ Confirm
                                                    </button>
                                                    <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 12px' }}
                                                        onClick={() => setConfirmDelete(null)}>
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 12px', color: 'var(--accent-red)' }}
                                                    onClick={() => setConfirmDelete(u.id)}>
                                                    🗑️ Delete
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
