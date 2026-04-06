import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ConsumerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/matches/consumer'), api.get('/deals')])
      .then(([m, d]) => { setMatches(m.data.matches); setDeals(d.data.deals); })
      .finally(() => setLoading(false));
  }, []);

  const runAI = async () => {
    setRunning(true);
    try {
      const res = await api.post('/matches/run');
      toast.success(`AI found ${res.data.count} new matches!`);
      const m = await api.get('/matches/consumer');
      setMatches(m.data.matches);
    } catch { toast.error('AI matching failed'); }
    finally { setRunning(false); }
  };

  const activeDeals = deals.filter(d => ['negotiating','proposed'].includes(d.status)).length;

  return (
    <AppLayout title="Dashboard">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3>Welcome, {user?.firstName} 👋</h3>
          <p className="text-muted text-sm">{user?.company?.name} · {user?.company?.industry}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/consumer/search')}>🔍 Browse Waste</button>
          <button className="btn btn-primary btn-sm" onClick={runAI} disabled={running}>
            {running ? '🤖 Finding...' : '🤖 Run AI Matching'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { icon: '🎯', label: 'AI Matches', value: matches.length, color: '#f5f3ff', sub: 'for your needs' },
          { icon: '🤝', label: 'Active Deals', value: activeDeals, color: '#f0fdf4', sub: 'in progress' },
          { icon: '✅', label: 'Completed', value: deals.filter(d => d.status === 'accepted').length, color: '#eff6ff', sub: 'deals done' },
          { icon: '💰', label: 'Cost Saved', value: 'Rs.0', color: '#fff7ed', sub: 'vs market price' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* AI Recommendations */}
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontWeight: 700 }}>🤖 AI Recommendations</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/consumer/recommendations')}>View All</button>
          </div>
          {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8 }} />) :
           matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--slate-400)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🤖</div>
              <p className="text-sm">Click "Run AI Matching" to find waste that matches your needs.</p>
            </div>
          ) : matches.slice(0, 4).map(m => (
            <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', marginBottom: 8, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background='var(--green-50)'}
              onMouseOut={e => e.currentTarget.style.background='var(--slate-50)'}
              onClick={() => navigate('/consumer/recommendations')}>
              <span style={{ fontSize: '1.3rem' }}>♻️</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{m.listing?.wasteType || m.listing?.category}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{m.listing?.quantity} {m.listing?.unit} · {m.listing?.location?.city}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 800, color: 'var(--green-700)', fontSize: '0.9rem' }}>{m.score}%</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--slate-400)' }}>match</div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Deals */}
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontWeight: 700 }}>🤝 Active Deals</span>
          </div>
          {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8 }} />) :
           deals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--slate-400)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🤝</div>
              <p className="text-sm">No deals yet. Browse waste and send a deal request.</p>
            </div>
          ) : deals.slice(0, 5).map(d => (
            <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', marginBottom: 8, cursor: 'pointer' }} onClick={() => navigate(`/deals/${d._id}`)}>
              <div className="avatar" style={{ background: 'var(--gradient-green)' }}>{d.producer?.firstName?.[0]}{d.producer?.lastName?.[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{d.producer?.company?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{d.listing?.wasteType}</div>
              </div>
              <span className={`badge ${d.status === 'accepted' ? 'badge-green' : d.status === 'negotiating' ? 'badge-blue' : 'badge-yellow'}`}>{d.status}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
