import { useState, useEffect } from 'react';
import { t, translateDistrict } from '../utils/i18n';
import { getDashboardStats, getDashboardClusters } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './Dashboard.css';

const COLORS = ['#00d4ff', '#00ff88', '#a855f7', '#ffb800', '#ff4757', '#3b82f6', '#f97316', '#ec4899'];

export default function Dashboard({ lang }) {
    const [stats, setStats] = useState(null);
    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getDashboardStats(), getDashboardClusters()])
            .then(([statsRes, clustersRes]) => {
                setStats(statsRes.data);
                setClusters(clustersRes.data.clusters || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>{t(lang, 'loading')}</p>
                </div>
            </div>
        );
    }

    const statusData = [
        { name: t(lang, 'status_open'), value: stats?.open || 0, color: '#3b82f6' },
        { name: t(lang, 'status_resolved'), value: stats?.resolved || 0, color: '#00ff88' },
        { name: t(lang, 'status_escalated'), value: stats?.escalated || 0, color: '#ff4757' },
        { name: t(lang, 'status_reopened'), value: stats?.reopened || 0, color: '#a855f7' },
    ].filter(d => d.value > 0);

    return (
        <div className="page">
            <div className="page-header animate-in">
                <h1 className="page-title">{t(lang, 'dash_title')}</h1>
                <p className="page-subtitle">{t(lang, 'dash_subtitle')}</p>
            </div>

            {/* Stats Overview */}
            <div className="grid-4 animate-in" style={{ marginBottom: 40 }}>
                <div className="glass-card stat-card">
                    <div className="stat-value">{stats?.total_grievances || 0}</div>
                    <div className="stat-label">{t(lang, 'total_grievances')}</div>
                </div>
                <div className="glass-card stat-card">
                    <div className="stat-value" style={{ background: 'var(--gradient-green)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {stats?.resolution_rate || 0}%
                    </div>
                    <div className="stat-label">{t(lang, 'dash_resolution_rate')}</div>
                </div>
                <div className="glass-card stat-card">
                    <div className="stat-value" style={{ background: 'var(--gradient-amber)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {stats?.avg_quality_rating || 0}⭐
                    </div>
                    <div className="stat-label">{t(lang, 'dash_avg_quality')}</div>
                </div>
                <div className="glass-card stat-card">
                    <div className="stat-value" style={{ background: 'var(--gradient-red)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {stats?.sla_breached || 0}
                    </div>
                    <div className="stat-label">{t(lang, 'sla_breached')}</div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid-2 animate-in" style={{ marginBottom: 40 }}>
                {/* Department Performance Bar Chart */}
                <div className="glass-card">
                    <h3 className="chart-title">{t(lang, 'dash_dept_performance')}</h3>
                    {stats?.department_stats?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={stats.department_stats} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" stroke="#64748b" fontSize={12} />
                                <YAxis dataKey="department" type="category" width={130} stroke="#64748b" fontSize={11} tick={{ fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
                                <Bar dataKey="resolved" fill="#00ff88" name={t(lang, 'chart_resolved')} radius={[0, 4, 4, 0]} />
                                <Bar dataKey="escalated" fill="#ff4757" name={t(lang, 'chart_escalated')} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data-chart">{t(lang, 'no_data')}</div>
                    )}
                </div>

                {/* Status Pie Chart */}
                <div className="glass-card">
                    <h3 className="chart-title">{t(lang, 'dash_status_dist')}</h3>
                    {statusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={120}
                                    paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                    {statusData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
                                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data-chart">{t(lang, 'no_data')}</div>
                    )}
                </div>
            </div>

            {/* District Stats Table */}
            {stats?.district_stats?.length > 0 && (
                <div className="glass-card animate-in" style={{ marginBottom: 40 }}>
                    <h3 className="chart-title">{t(lang, 'dash_district_perf')}</h3>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t(lang, 'label_district')}</th>
                                    <th>{t(lang, 'dash_total')}</th>
                                    <th>{t(lang, 'dash_resolved')}</th>
                                    <th>{t(lang, 'dash_resolution_rate')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.district_stats.map((d, i) => (
                                    <tr key={i}>
                                        <td>{translateDistrict(lang, d.district)}</td>
                                        <td>{d.total}</td>
                                        <td>{d.resolved}</td>
                                        <td>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar" style={{ width: `${d.resolution_rate}%`, background: d.resolution_rate > 60 ? 'var(--accent-green)' : d.resolution_rate > 30 ? 'var(--accent-amber)' : 'var(--accent-red)' }}></div>
                                                <span>{d.resolution_rate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Systemic Issues */}
            {clusters.length > 0 && (
                <div className="glass-card animate-in">
                    <h3 className="chart-title" style={{ color: 'var(--accent-red)' }}>
                        🚨 {t(lang, 'dash_systemic')}
                    </h3>
                    <div className="clusters-grid">
                        {clusters.map((c, i) => (
                            <div key={i} className="cluster-card">
                                <div className="cluster-header">
                                    <span className="badge badge-critical">{c.category}</span>
                                    <span className="cluster-count">{c.grievance_count} {t(lang, 'dash_complaints')}</span>
                                </div>
                                <div className="cluster-district">{c.district}</div>
                                <div className="cluster-desc">{c.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
