import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminVerify() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');

  const load = () => {
    setLoading(true);
    api.get(`/admin/users?verificationStatus=${filter}&search=${search}`)
      .then(r => setUsers(r.data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const verify = async (id, status) => {
    try {
      await api.patch(`/admin/users/${id}/verify`, { status, notes });
      toast.success(`Company ${status}!`);
      setSelected(null); setNotes('');
      load();
    } catch { toast.error('Action failed'); }
  };

  const statusBadge = s => ({ verified: 'badge-green', pending: 'badge-yellow', rejected: 'badge-red' }[s] || 'badge-blue');

  return (
    <AppLayout title="Verify Companies">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['pending','verified','rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Search company..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} onKeyDown={e => e.key === 'Enter' && load()} />
          <button className="btn btn-ghost btn-sm" onClick={load}>Search</button>
        </div>
      </div>

      {loading ? [1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 72, marginBottom: 10 }} />) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate-400)' }}>No {filter} companies found.</div>
          ) : users.map(u => (
            <div key={u._id} className="chart-card" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div className="avatar" style={{ width: 44, height: 44, fontSize: '1rem', flexShrink: 0 }}>{u.firstName?.[0]}{u.lastName?.[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700 }}>{u.company?.name}</span>
                  <span className={`badge ${statusBadge(u.verification?.status)}`}>{u.verification?.status}</span>
                  <span className="badge badge-blue">{u.role}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{u.firstName} {u.lastName} · {u.email} · {u.company?.industry}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Joined {new Date(u.createdAt).toLocaleDateString()}</div>
              </div>
              {u.verification?.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setSelected(u)}>Review</button>
                </div>
              )}
              {u.verification?.status === 'verified' && (
                <button className="btn btn-danger btn-sm" onClick={() => verify(u._id, 'rejected')}>Revoke</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 480, width: '100%' }}>
            <h3 style={{ marginBottom: 4 }}>Review: {selected.company?.name}</h3>
            <p className="text-muted text-sm" style={{ marginBottom: 20 }}>{selected.firstName} {selected.lastName} · {selected.email}</p>
            <div style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16, fontSize: '0.875rem' }}>
              <div><strong>Industry:</strong> {selected.company?.industry}</div>
              <div><strong>Location:</strong> {selected.company?.location || 'Not provided'}</div>
              <div><strong>Role:</strong> {selected.role}</div>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Admin Notes</label>
              <textarea className="textarea" placeholder="Add notes about this verification..." value={notes} onChange={e => setNotes(e.target.value)} style={{ minHeight: 80 }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => verify(selected._id, 'verified')}>✅ Approve</button>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => verify(selected._id, 'rejected')}>✕ Reject</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(null); setNotes(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
