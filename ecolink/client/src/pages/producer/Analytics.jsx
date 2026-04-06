import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
Chart.register(...registerables);

const months = ['Nov','Dec','Jan','Feb','Mar','Apr'];

function useChart(ref, config) {
  useEffect(() => {
    if (!ref.current) return;
    const chart = new Chart(ref.current, config);
    return () => chart.destroy();
  }, []);
}

export default function ProducerAnalytics() {
  const { user } = useAuth();
  const revenueRef = useRef(); const wasteRef = useRef(); const co2Ref = useRef(); const typeRef = useRef();

  useChart(revenueRef, { type: 'bar', data: { labels: months, datasets: [{ data: [1820000,2320000,2570000,2900000,3150000,2650000], backgroundColor: 'rgba(34,197,94,0.15)', borderColor: '#22c55e', borderWidth: 2, borderRadius: 6 }] }, options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' } } } } });
  useChart(wasteRef, { type: 'line', data: { labels: months, datasets: [{ data: [28,35,42,48,52,43], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', borderWidth: 2.5, fill: true, tension: 0.4, pointBackgroundColor: '#3b82f6', pointRadius: 4 }] }, options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' } } } } });
  useChart(co2Ref, { type: 'line', data: { labels: months, datasets: [{ data: [8.4,10.5,12.6,14.4,15.6,12.9], borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)', borderWidth: 2.5, fill: true, tension: 0.4, pointBackgroundColor: '#22c55e', pointRadius: 4 }] }, options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' } } } } });
  useChart(typeRef, { type: 'doughnut', data: { labels: ['Steel','Copper','Plastic','Wood','Other'], datasets: [{ data: [45,20,18,10,7], backgroundColor: ['#22c55e','#3b82f6','#f59e0b','#8b5cf6','#94a3b8'], borderWidth: 0, hoverOffset: 4 }] }, options: { responsive: true, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 8 } } } } });

  const stats = user?.stats || {};

  return (
    <AppLayout title="Analytics">
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { icon: '🌱', label: 'CO₂ Saved', value: `${stats.co2Saved || 74}t`, color: '#f0fdf4', change: '↑ 22%' },
          { icon: '♻️', label: 'Waste Reused', value: `${stats.wasteReused || 248}t`, color: '#eff6ff', change: '↑ 31%' },
          { icon: '💰', label: 'Total Revenue', value: `Rs.${(stats.totalRevenue || 18600).toLocaleString()}`, color: '#f5f3ff', change: '↑ 18%' },
          { icon: '🤝', label: 'Deals Done', value: stats.totalDeals || 42, color: '#fff7ed', change: '↑ 8 this period' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-change up">{s.change}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="chart-card">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>💰 Revenue Generated</div>
          <canvas ref={revenueRef} height={200} />
        </div>
        <div className="chart-card">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>♻️ Waste Reused (tonnes)</div>
          <canvas ref={wasteRef} height={200} />
        </div>
      </div>

      <div className="grid-2">
        <div className="chart-card">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>🌍 CO₂ Saved (tonnes)</div>
          <canvas ref={co2Ref} height={200} />
        </div>
        <div className="chart-card">
          <div style={{ fontWeight: 700, marginBottom: 16 }}>📦 Waste by Type</div>
          <canvas ref={typeRef} height={200} />
        </div>
      </div>
    </AppLayout>
  );
}
