import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import api from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  const cards = [
    { icon: '👥', label: 'Total Users', value: stats.users, color: '#eff6ff', action: () => navigate('/admin/verify') },
    { icon: '📦', label: 'Total Listings', value: stats.listings, color: '#f0fdf4', action: () => navigate('/admin/moderation') },
    { icon: '🤝', label: 'Total Deals', value: stats.deals, color: '#f5f3ff', action: () => navigate('/admin/transactions') },
    { icon: '⚠️', label: 'Open Disputes', value: stats.openDisputes, color: '#fef2f2', action: () => navigate('/admin/disputes') },
    { icon: '⏳', label: 'Pending Verifications', value: stats.pendingVerifications, color: '#fef3c7', action: () => navigate('/admin/verify') },
    { icon: '📋', label: 'Pending Listings', value: stats.pendingListings, color: '#fff7ed', action: () => navigate('/admin/moderation') },
    { icon: '💰', label: 'Platform Revenue', value: `Rs.${(stats.totalRevenue || 0).toLocaleString()}`, color: '#f0fdf4', action: () => navigate('/admin/transactions') },
  ];

  return (
    <AppLayout title="Admin Overview">
      <div style={{ marginBottom: 24 }}>
        <h3>Platform Overview 🛡️</h3>
        <p className="text-muted text-sm">Monitor and manage the EcoLink AI platform</p>
      </div>

      {/* Alert banners */}
      {stats.pendingVerifications > 0 && (
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
          <span>⏳ <strong>{stats.pendingVerifications}</strong> companies waiting for verification</span>
          <button className="btn btn-sm" style={{ background: '#d97706', color: 'white', border: 'none' }} onClick={() => navigate('/admin/verify')}>Review Now</button>
        </div>
      )}
      {stats.openDisputes > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
          <span>⚠️ <strong>{stats.openDisputes}</strong> open disputes need attention</span>
          <button className="btn btn-sm btn-danger" onClick={() => navigate('/admin/disputes')}>View Disputes</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
        {cards.map(c => (
          <div key={c.label} className="stat-card" style={{ cursor: 'pointer' }} onClick={c.action}>
            <div className="stat-icon" style={{ background: c.color }}>{c.icon}</div>
            <div className="stat-value">{loading ? '—' : c.value ?? 0}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="chart-card">
        <div style={{ fontWeight: 700, marginBottom: 16 }}>⚡ Quick Actions</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/verify')}>🔍 Review Verifications</button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/moderation')}>📋 Moderate Listings</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/disputes')}>⚠️ Handle Disputes</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/transactions')}>💳 View Transactions</button>
        </div>
      </div>
    </AppLayout>
  );
}
