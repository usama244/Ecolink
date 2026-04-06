import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import api from '../services/api';
Chart.register(...registerables);

function useChart(ref, cfg, deps = []) {
  useEffect(() => {
    if (!ref.current) return;
    const c = new Chart(ref.current, cfg);
    return () => c.destroy();
  }, deps);
}

function AnimNum({ end, prefix = '', suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let cur = 0; const step = end / 80;
      const t = setInterval(() => {
        cur = Math.min(cur + step, end);
        el.textContent = prefix + (decimals ? cur.toFixed(decimals) : Math.round(cur).toLocaleString()) + suffix;
        if (cur >= end) clearInterval(t);
      }, 20);
      obs.disconnect();
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

export default function ImpactPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const co2Ref = useRef(); const wasteRef = useRef(); const dealRef = useRef();

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  useChart(co2Ref, {
    type: 'line',
    data: { labels: ['Oct','Nov','Dec','Jan','Feb','Mar','Apr'], datasets: [{ label: 'CO₂ Saved (t)', data: [820, 1140, 1680, 2100, 2640, 3120, 2980], borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)', borderWidth: 3, fill: true, tension: 0.4, pointBackgroundColor: '#22c55e', pointRadius: 5 }] },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' } } } }
  });
  useChart(wasteRef, {
    type: 'bar',
    data: { labels: ['Steel','Copper','Plastic','Coconut','E-Waste','Aluminium','Wood'], datasets: [{ data: [18400, 4200, 8600, 6800, 1200, 3900, 5100], backgroundColor: ['#22c55e','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#94a3b8'], borderRadius: 6, borderWidth: 0 }] },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' } } } }
  });
  useChart(dealRef, {
    type: 'doughnut',
    data: { labels: ['Accepted','Negotiating','Completed','Rejected'], datasets: [{ data: [86, 34, 52, 14], backgroundColor: ['#22c55e','#3b82f6','#8b5cf6','#ef4444'], borderWidth: 0, hoverOffset: 6 }] },
    options: { responsive: true, cutout: '68%', plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } } } }
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate-50)', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#020817,#0f172a,#0a1f0f)', padding: '80px 0 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', fontSize: '0.78rem', fontWeight: 600, padding: '6px 14px', borderRadius: 99, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🌍 Live Impact Report
          </span>
          <h1 style={{ color: 'white', fontSize: 'clamp(2rem,4vw,3.2rem)', marginBottom: 14, letterSpacing: '-0.02em' }}>EcoLink AI Global Impact</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', maxWidth: 500, margin: '0 auto 28px' }}>Real-time data on waste diverted, CO₂ saved, and revenue generated across our platform.</p>
          <button onClick={() => navigate('/')} style={{ padding: '10px 22px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>← Back to Home</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {/* Big numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 32 }}>
          {[
            { icon: '♻️', label: 'Tonnes Waste Reused', end: 48200, suffix: 't', color: '#f0fdf4', accent: '#22c55e' },
            { icon: '🌱', label: 'Tonnes CO₂ Saved', end: 12400, suffix: 't', color: '#f0fdf4', accent: '#16a34a' },
            { icon: '💰', label: 'Revenue Generated (Crore)', end: 266, prefix: 'Rs.', suffix: ' Cr', color: '#f5f3ff', accent: '#7c3aed' },
            { icon: '🤝', label: 'Deals Completed', end: stats?.deals || 186, color: '#eff6ff', accent: '#2563eb' },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', borderRadius: 16, padding: '24px 20px', border: `1px solid ${s.accent}20`, boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: s.accent, lineHeight: 1 }}>
                <AnimNum end={s.end} prefix={s.prefix || ''} suffix={s.suffix || ''} decimals={s.decimals || 0} />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1px solid var(--slate-100)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontWeight: 700, marginBottom: 16, color: 'var(--slate-900)' }}>🌱 CO₂ Saved Over Time (tonnes)</div>
            <canvas ref={co2Ref} height={200} />
          </div>
          <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1px solid var(--slate-100)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontWeight: 700, marginBottom: 16, color: 'var(--slate-900)' }}>🤝 Deal Status</div>
            <canvas ref={dealRef} height={200} />
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1px solid var(--slate-100)', boxShadow: 'var(--shadow-sm)', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, color: 'var(--slate-900)' }}>♻️ Waste Reused by Category (tonnes)</div>
          <canvas ref={wasteRef} height={120} />
        </div>

        {/* Environmental equivalents */}
        <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#eff6ff)', borderRadius: 16, padding: '28px', border: '1px solid var(--green-200)' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)', marginBottom: 20, textAlign: 'center' }}>🌍 What Our Impact Equals</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, textAlign: 'center' }}>
            {[
              { icon: '🌳', value: '1,860', label: 'Trees planted equivalent' },
              { icon: '🚗', value: '5.2Cr', label: 'Car km offset' },
              { icon: '💡', value: '57.8L', label: 'kWh energy saved' },
              { icon: '🏠', value: '4,800', label: 'Homes powered for a year' },
            ].map(e => (
              <div key={e.label} style={{ background: 'white', borderRadius: 12, padding: '16px 12px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 6 }}>{e.icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--green-700)', lineHeight: 1 }}>{e.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: 4 }}>{e.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button className="btn btn-primary" onClick={() => navigate('/auth')} style={{ fontSize: '1rem', padding: '14px 32px' }}>Join the Movement →</button>
        </div>
      </div>
    </div>
  );
}
