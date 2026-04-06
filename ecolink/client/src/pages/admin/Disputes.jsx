import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState('');
  const [note, setNote] = useState('');

  const load = () => {
    setLoading(true);
    api.get(`/admin/disputes?status=${filter}`)
      .then(r => setDisputes(r.data.disputes))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const resolve = async (id) => {
    try {
      await api.patch(`/admin/disputes/${id}`, { status: 'resolved', resolution, note });
      toast.success('Dispute resolved!');
      setSelected(null); setResolution(''); setNote('');
      load();
    } catch { toast.error('Failed to resolve'); }
  };

  const priorityColor = p => ({ high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }[p] || '#64748b');

  return (
    <AppLayout title="Disputes">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['open','under_review','resolved','closed'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}>
            {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, marginBottom: 10 }} />) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {disputes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate-400)' }}>No {filter} disputes.</div>
          ) : disputes.map(d => (
            <div key={d._id} className="chart-card" style={{ borderLeft: `4px solid ${priorityColor(d.priority)}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700 }}>{d.reason}</span>
                    <span className="badge" style={{ background: `${priorityColor(d.priority)}20`, color: priorityColor(d.priority) }}>{d.priority}</span>
                    <span className={`badge ${d.status === 'resolved' ? 'badge-green' : d.status === 'open' ? 'badge-red' : 'badge-yellow'}`}>{d.status}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginBottom: 4 }}>{d.description?.slice(0, 120)}...</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                    Raised by <strong>{d.raisedBy?.company?.name}</strong> against <strong>{d.against?.company?.name}</strong>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: 2 }}>{new Date(d.createdAt).toLocaleDateString()}</div>
                </div>
                {(d.status === 'open' || d.status === 'under_review') && (
                  <button className="btn btn-primary btn-sm" onClick={() => setSelected(d)}>Resolve</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 500, width: '100%' }}>
            <h3 style={{ marginBottom: 4 }}>Resolve Dispute</h3>
            <p className="text-sm text-muted" style={{ marginBottom: 16 }}>{selected.reason}</p>
            <div style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 16, fontSize: '0.875rem' }}>
              <div><strong>Raised by:</strong> {selected.raisedBy?.company?.name}</div>
              <div><strong>Against:</strong> {selected.against?.company?.name}</div>
              <div style={{ marginTop: 8, color: 'var(--slate-600)' }}>{selected.description}</div>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Resolution</label>
              <textarea className="textarea" placeholder="Describe the resolution..." value={resolution} onChange={e => setResolution(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Admin Note</label>
              <input className="input" placeholder="Internal note..." value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => resolve(selected._id)}>Mark Resolved</button>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
