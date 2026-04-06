import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ProducerMatches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/matches/producer').then(r => setMatches(r.data.matches)).finally(() => setLoading(false));
  }, []);

  const initiateDeal = async (match) => {
    try {
      const res = await api.post('/deals', { matchId: match._id, listingId: match.listing?._id, producerId: match.producer, message: 'Hi! I saw your interest in my listing. Let\'s discuss the details.' });
      toast.success('Deal initiated!');
      navigate(`/deals/${res.data.deal._id}`);
    } catch { toast.error('Failed to initiate deal'); }
  };

  const scoreColor = s => s >= 85 ? 'var(--green-700)' : s >= 70 ? 'var(--blue-600)' : 'var(--slate-600)';

  return (
    <AppLayout title="AI Matches">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span style={{ fontWeight: 700 }}>{matches.length} matches</span>
          <span className="text-muted text-sm" style={{ marginLeft: 8 }}>for your listings</span>
          <span className="badge badge-ai" style={{ marginLeft: 8 }}>🤖 AI Powered</span>
        </div>
        <select className="select" style={{ width: 160, fontSize: '0.85rem', padding: '8px 12px' }}>
          <option>Sort: Match Score</option>
          <option>Sort: Newest</option>
          <option>Sort: Profit</option>
        </select>
      </div>

      {loading ? (
        [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, marginBottom: 16 }} />)
      ) : matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-400)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🤖</div>
          <h3 style={{ color: 'var(--slate-600)', marginBottom: 8 }}>No matches yet</h3>
          <p className="text-sm">Add active listings and AI will find buyers automatically.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {matches.map((m, idx) => (
            <div key={m._id} className="card" style={{ padding: 20, border: idx === 0 ? '1.5px solid var(--green-200)' : '1px solid var(--slate-100)', background: idx === 0 ? 'linear-gradient(135deg,#f0fdf4,white)' : 'white' }}>
              {idx === 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <span className="badge badge-green">🏆 Top Match</span>
                  <span className="badge badge-ai">🤖 AI Recommended</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar" style={{ width: 48, height: 48, fontSize: '1rem', background: 'var(--gradient-blue)' }}>
                    {m.consumer?.firstName?.[0]}{m.consumer?.lastName?.[0]}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>{m.consumer?.company?.name}</span>
                      {m.consumer?.verification?.status === 'verified' && <span className="verified-badge">✓ Verified</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{m.consumer?.company?.industry}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)', marginTop: 2 }}>⭐ {m.consumer?.rating?.average || 'New'} · {m.consumer?.rating?.count || 0} deals</div>
                  </div>
                </div>
                <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#eff6ff)', border: '1.5px solid var(--green-200)', borderRadius: 'var(--radius-md)', padding: '8px 14px', textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: scoreColor(m.score), lineHeight: 1 }}>{m.score}%</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Match</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: 4 }}>📦 {m.listing?.wasteType}</span>
                {m.distanceKm && <span style={{ fontSize: '0.82rem', color: 'var(--slate-600)' }}>📍 {m.distanceKm}km away</span>}
                {m.profitEstimate && <span style={{ fontSize: '0.82rem', color: 'var(--slate-600)' }}>💰 ~Rs.{m.profitEstimate?.toLocaleString()} potential</span>}
              </div>

              {m.aiReason && (
                <div style={{ background: 'rgba(34,197,94,0.06)', borderRadius: 'var(--radius-md)', padding: '9px 12px', marginTop: 12, fontSize: '0.8rem', color: 'var(--slate-700)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--green-700)' }}>🤖 AI: </span>{m.aiReason}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => initiateDeal(m)}>💬 Connect Now</button>
                <button className="btn btn-ghost btn-sm">View Profile</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
