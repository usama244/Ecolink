import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const categories = ['','steel','copper','plastic','wood','chemical','paper','rubber','glass','textile','electronic','coconut','food'];

export default function ConsumerSearch() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', city: '', minQty: '', maxQty: '' });
  const [total, setTotal] = useState(0);

  const fetchListings = async (f = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.category) params.set('category', f.category);
      if (f.city) params.set('city', f.city);
      if (f.minQty) params.set('minQty', f.minQty);
      if (f.maxQty) params.set('maxQty', f.maxQty);
      const res = await api.get(`/listings?${params}`);
      setListings(res.data.listings);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load listings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchListings(); }, []);

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const sendDealRequest = async (listing) => {
    try {
      const res = await api.post('/deals', { listingId: listing._id, producerId: listing.producer._id, message: `Hi! I'm interested in your ${listing.wasteType} listing. Can we discuss the details?` });
      toast.success('Deal request sent!');
      navigate(`/deals/${res.data.deal._id}`);
    } catch { toast.error('Failed to send request'); }
  };

  return (
    <AppLayout title="Browse Waste">
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Filters */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div className="chart-card">
            <div style={{ fontWeight: 700, marginBottom: 16 }}>🔧 Filters</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="select" value={filters.category} onChange={e => setF('category', e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c ? c.charAt(0).toUpperCase() + c.slice(1) : 'All Categories'}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="input" placeholder="e.g. Mumbai" value={filters.city} onChange={e => setF('city', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity (tonnes)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" type="number" placeholder="Min" value={filters.minQty} onChange={e => setF('minQty', e.target.value)} />
                  <input className="input" type="number" placeholder="Max" value={filters.maxQty} onChange={e => setF('maxQty', e.target.value)} />
                </div>
              </div>
              <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => fetchListings()}>Apply Filters</button>
              <button className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={() => { setFilters({ category:'',city:'',minQty:'',maxQty:'' }); fetchListings({ category:'',city:'',minQty:'',maxQty:'' }); }}>Reset</button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontWeight: 700 }}>{total} listings found</span>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 200 }} />)}
            </div>
          ) : listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-400)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
              <h3 style={{ color: 'var(--slate-600)', marginBottom: 8 }}>No listings found</h3>
              <p className="text-sm">Try adjusting your filters.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {listings.map(l => (
                <div key={l._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 44, height: 44, background: 'var(--gradient-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>♻️</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{l.wasteType}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{l.producer?.company?.name}</div>
                      </div>
                    </div>
                    {l.producer?.verification?.status === 'verified' && <span className="verified-badge">✓</span>}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>📦 {l.quantity} {l.unit}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>📍 {l.location?.city}</span>
                    {l.pricePerUnit && <span style={{ fontSize: '0.8rem', color: 'var(--green-700)', fontWeight: 600 }}>💰 ${l.pricePerUnit}/{l.unit}</span>}
                  </div>

                  {l.aiData?.suggestedUses?.[0] && (
                    <div style={{ background: 'var(--green-50)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', fontSize: '0.75rem', color: 'var(--green-700)', marginBottom: 12 }}>
                      🤖 {l.aiData.suggestedUses[0]}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => sendDealRequest(l)}>Send Request</button>
                    <button className="btn btn-ghost btn-sm">Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
