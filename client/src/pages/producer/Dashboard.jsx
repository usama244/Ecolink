import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function MiniSparkline({ data, color }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const c = new Chart(ref.current, {
      type: 'line',
      data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: color, borderWidth: 2, fill: true, backgroundColor: `${color}18`, tension: 0.4, pointRadius: 0 }] },
      options: { responsive: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } }, animation: { duration: 800 } },
    });
    return () => c.destroy();
  }, []);
  return <canvas ref={ref} width={80} height={36} />;
}

export default function ProducerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/listings/my'), api.get('/matches/producer')])
      .then(([l, m]) => { setListings(l.data.listings); setMatches(m.data.matches); })
      .finally(() => setLoading(false));

    // Simulated live activity feed (in production this would be a websocket)
    const feed = [
      { icon: '🤖', text: 'AI found 3 new matches for Steel Scrap listing', time: '2m ago', color: '#f5f3ff' },
      { icon: '💬', text: 'BuildRight Construction sent a message', time: '18m ago', color: '#eff6ff' },
      { icon: '✅', text: 'Deal accepted — Copper Wire 5t · Rs.14.1L', time: '1h ago', color: '#f0fdf4' },
      { icon: '📦', text: 'Listing approved by admin — Coconut Fiber 40t', time: '3h ago', color: '#fff7ed' },
      { icon: '⭐', text: 'New 5-star rating from GreenCycle Recyclers', time: '5h ago', color: '#fef3c7' },
    ];
    setActivity(feed);
  }, []);

  const stats = user?.stats || {};
  const activeListings = listings.filter(l => l.status === 'active').length;
  const pendingListings = listings.filter(l => l.moderationStatus === 'pending').length;
  const topMatches = matches.filter(m => m.score >= 70).length;

  return (
    <AppLayout title="Dashboard">
      {/* Welcome row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: '1.3rem' }}>Good morning, {user?.firstName} 👋</h3>
          <p className="text-muted text-sm">{user?.company?.name} · {user?.company?.industry}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/producer/analytics')}>📊 Analytics</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/producer/upload')}>+ New Listing</button>
        </div>
      </div>

      {/* Verification banner */}
      {user?.verification?.status === 'pending' && (
        <div style={{ background: 'linear-gradient(135deg,#fef3c7,#fff7ed)', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
          <span style={{ fontSize: '1.2rem' }}>⏳</span>
          <span style={{ color: '#92400e' }}>Your company verification is <strong>pending</strong>. Listings will be reviewed before going live.</span>
        </div>
      )}

      {/* Stat cards with sparklines */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { icon: '🌱', label: 'CO₂ Saved', value: `${stats.co2Saved || 74}t`, color: '#f0fdf4', accent: '#22c55e', spark: [4,6,8,10,12,11,14], change: '↑ 18%' },
          { icon: '📦', label: 'Waste Reused', value: `${stats.wasteReused || 248}t`, color: '#eff6ff', accent: '#3b82f6', spark: [20,28,35,42,48,52,43], change: '↑ 24%' },
          { icon: '💰', label: 'Revenue', value: `Rs.${(stats.totalRevenue || 18600).toLocaleString()}`, color: '#f5f3ff', accent: '#7c3aed', spark: [22,28,31,35,38,32,40], change: '↑ 12%' },
          { icon: '🎯', label: 'AI Matches', value: topMatches || matches.length, color: '#fff7ed', accent: '#f59e0b', spark: [2,4,6,8,10,9,12], change: `${activeListings} active` },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
              <MiniSparkline data={s.spark} color={s.accent} />
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-change up">{s.change}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 20 }}>
        {/* Top AI Matches */}
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700 }}>🎯 Top AI Matches</span>
              <span className="badge badge-ai" style={{ fontSize: '0.65rem' }}>ML</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/producer/matches')}>View All</button>
          </div>
          {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8 }} />) :
           matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--slate-400)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🤖</div>
              <p className="text-sm">No matches yet. Add listings to get AI matches.</p>
            </div>
          ) : matches.slice(0, 4).map(m => {
            const score = m.score;
            const scoreColor = score >= 80 ? '#15803d' : score >= 60 ? '#2563eb' : '#64748b';
            return (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', marginBottom: 8, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent' }}
                onMouseOver={e => { e.currentTarget.style.background='var(--green-50)'; e.currentTarget.style.borderColor='var(--green-200)'; }}
                onMouseOut={e => { e.currentTarget.style.background='var(--slate-50)'; e.currentTarget.style.borderColor='transparent'; }}
                onClick={() => navigate('/producer/matches')}>
                <div className="avatar" style={{ background: 'var(--gradient-blue)', width: 38, height: 38, fontSize: '0.8rem' }}>{m.consumer?.firstName?.[0]}{m.consumer?.lastName?.[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.consumer?.company?.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>{m.listing?.wasteType} · {m.listing?.quantity}{m.listing?.unit}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 900, color: scoreColor, fontSize: '1rem', lineHeight: 1 }}>{score}%</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>match</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* My Listings */}
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontWeight: 700 }}>📦 My Listings</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {pendingListings > 0 && <span className="badge badge-yellow">{pendingListings} pending</span>}
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/producer/upload')}>+ Add</button>
            </div>
          </div>
          {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8 }} />) :
           listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--slate-400)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📦</div>
              <p className="text-sm">No listings yet.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/producer/upload')}>Create First Listing</button>
            </div>
          ) : listings.slice(0, 5).map(l => (
            <div key={l._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', marginBottom: 8, transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background='var(--slate-100)'}
              onMouseOut={e => e.currentTarget.style.background='var(--slate-50)'}>
              <div style={{ width: 36, height: 36, background: 'var(--gradient-primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>♻️</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.wasteType}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>{l.quantity} {l.unit} · {l.location?.city}</div>
              </div>
              <span className={`badge ${l.moderationStatus === 'pending' ? 'badge-yellow' : l.status === 'active' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.68rem' }}>
                {l.moderationStatus === 'pending' ? '⏳ Review' : l.status === 'active' ? '✓ Live' : l.status}
              </span>
            </div>
          ))}
        </div>

        {/* Live Activity Feed */}
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontWeight: 700 }}>⚡ Live Activity</span>
            <div style={{ width: 7, height: 7, background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          </div>
          {activity.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < activity.length - 1 ? '1px solid var(--slate-50)' : 'none' }}>
              <div style={{ width: 32, height: 32, background: a.color, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>{a.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-800)', lineHeight: 1.4 }}>{a.text}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--slate-400)', marginTop: 2 }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact summary bar */}
      <div style={{ marginTop: 20, background: 'linear-gradient(135deg,#f0fdf4,#eff6ff)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', border: '1px solid var(--green-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.5rem' }}>🌍</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.9rem' }}>Your Environmental Impact</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>You're in the top 5% of EcoLink contributors this month</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[['🌱', `${stats.co2Saved || 74}t`, 'CO₂ Saved'], ['♻️', `${stats.wasteReused || 248}t`, 'Waste Diverted'], ['🌳', '22', 'Trees Equivalent']].map(([icon, val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem' }}>{icon}</div>
              <div style={{ fontWeight: 800, color: 'var(--green-700)', fontSize: '1.1rem', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)' }}>{label}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/producer/analytics')}>View Full Report →</button>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </AppLayout>
  );
}
