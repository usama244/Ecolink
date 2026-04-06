import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminModeration() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  const load = () => {
    setLoading(true);
    api.get(`/admin/listings?moderationStatus=${filter}`)
      .then(r => setListings(r.data.listings))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const moderate = async (id, status) => {
    try {
      await api.patch(`/admin/listings/${id}/moderate`, { moderationStatus: status, moderationNote: note });
      toast.success(`Listing ${status}!`);
      setSelected(null); setNote('');
      load();
    } catch { toast.error('Action failed'); }
  };

  return (
    <AppLayout title="Listing Moderation">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['pending','approved','rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, marginBottom: 10 }} />) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate-400)' }}>No {filter} listings.</div>
          ) : listings.map(l => (
            <div key={l._id} className="chart-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, background: 'var(--gradient-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>♻️</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{l.wasteType}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{l.producer?.company?.name} · {l.quantity} {l.unit} · {l.location?.city}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: 2 }}>Listed {new Date(l.createdAt).toLocaleDateString()}</div>
                    {l.description && <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: 6, maxWidth: 400 }}>{l.description.slice(0, 120)}...</div>}
                  </div>
                </div>
                {filter === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => moderate(l._id, 'approved')}>✅ Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setSelected(l)}>✕ Reject</button>
                  </div>
                )}
                {filter === 'approved' && (
                  <button className="btn btn-danger btn-sm" onClick={() => moderate(l._id, 'rejected')}>Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 440, width: '100%' }}>
            <h3 style={{ marginBottom: 16 }}>Reject Listing</h3>
            <p className="text-sm text-muted" style={{ marginBottom: 16 }}>Rejecting: <strong>{selected.wasteType}</strong> by {selected.producer?.company?.name}</p>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Reason for rejection</label>
              <textarea className="textarea" placeholder="Explain why this listing is being rejected..." value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => moderate(selected._id, 'rejected')}>Confirm Reject</button>
              <button className="btn btn-ghost" onClick={() => { setSelected(null); setNote(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
