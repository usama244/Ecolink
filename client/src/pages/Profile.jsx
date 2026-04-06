import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', companyName: user?.company?.name || '', industry: user?.company?.industry || '', location: user?.company?.location || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/users/profile', { firstName: form.firstName, lastName: form.lastName, company: { name: form.companyName, industry: form.industry, location: form.location } });
      setUser(res.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/users/password', pwdForm);
      toast.success('Password changed!');
      setPwdForm({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const roleColors = { producer: 'var(--green-600)', consumer: 'var(--blue-600)', admin: '#7c3aed' };
  const roleLabels = { producer: '🏭 Waste Producer', consumer: '🛒 Waste Consumer', admin: '🛡️ Administrator' };
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;

  return (
    <AppLayout title="Profile">
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header card */}
        <div className="chart-card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '1.5rem', flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h3>{user?.firstName} {user?.lastName}</h3>
              <span style={{ background: `${roleColors[user?.role]}15`, color: roleColors[user?.role], fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>{roleLabels[user?.role]}</span>
              {user?.verification?.status === 'verified' && <span className="verified-badge">✓ Verified</span>}
              {user?.verification?.status === 'pending' && <span className="badge badge-yellow">⏳ Pending Verification</span>}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: 4 }}>{user?.company?.name} · {user?.email}</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>⭐ {user?.rating?.average || 0} rating</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>🤝 {user?.stats?.totalDeals || 0} deals</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>🌱 {user?.stats?.co2Saved || 0}t CO₂ saved</span>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div className="chart-card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 20 }}>Edit Profile</div>
          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="input" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="input" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input className="input" value={form.companyName} onChange={e => set('companyName', e.target.value)} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Industry</label>
                <input className="input" value={form.industry} onChange={e => set('industry', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="input" placeholder="City, State" value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving} style={{ alignSelf: 'flex-start' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="chart-card">
          <div style={{ fontWeight: 700, marginBottom: 20 }}>Change Password</div>
          <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="input" type="password" value={pwdForm.currentPassword} onChange={e => setPwdForm(f => ({ ...f, currentPassword: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="input" type="password" value={pwdForm.newPassword} onChange={e => setPwdForm(f => ({ ...f, newPassword: e.target.value }))} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>Update Password</button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
