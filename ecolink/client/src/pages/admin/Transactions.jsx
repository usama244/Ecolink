import { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import api from '../../services/api';

export default function AdminTransactions() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/transactions${filter ? `?status=${filter}` : ''}`)
      .then(r => setDeals(r.data.deals))
      .finally(() => setLoading(false));
  }, [filter]);

  const statusBadge = s => ({ accepted: 'badge-green', negotiating: 'badge-blue', proposed: 'badge-yellow', rejected: 'badge-red', disputed: 'badge-red', completed: 'badge-green' }[s] || 'badge-blue');

  return (
    <AppLayout title="Transactions">
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['','All'],['negotiating','Negotiating'],['accepted','Accepted'],['rejected','Rejected'],['disputed','Disputed']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-ghost'}`}>{l}</button>
        ))}
      </div>

      {loading ? [1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 72, marginBottom: 8 }} />) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {deals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate-400)' }}>No transactions found.</div>
          ) : deals.map(d => (
            <div key={d._id} className="chart-card" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{d.listing?.wasteType || d.listing?.category}</span>
                  <span className={`badge ${statusBadge(d.status)}`}>{d.status}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: 2 }}>
                  🏭 {d.producer?.company?.name} → 🛒 {d.consumer?.company?.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: 2 }}>{new Date(d.updatedAt).toLocaleDateString()}</div>
              </div>
              {d.finalTerms?.totalValue && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, color: 'var(--green-700)' }}>Rs.{d.finalTerms.totalValue.toLocaleString()}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>{d.finalTerms.quantity} {d.listing?.unit}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
