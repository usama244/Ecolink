import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Score breakdown bar component
function ScoreBar({ label, value, weight, color = '#22c55e' }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>{label}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--slate-400)' }}>weight {weight}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: value >= 70 ? '#15803d' : value >= 45 ? '#2563eb' : '#94a3b8' }}>{value}%</span>
        </div>
      </div>
      <div style={{ height: 5, background: 'var(--slate-100)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: value >= 70 ? 'var(--gradient-green)' : value >= 45 ? 'var(--gradient-blue)' : '#cbd5e1', borderRadius: 99, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

// Confidence badge
function ConfidenceBadge({ score }) {
  if (score >= 80) return <span className="badge badge-green">🔥 High Confidence</span>;
  if (score >= 60) return <span className="badge badge-blue">✓ Good Match</span>;
  return <span className="badge" style={{ background: 'var(--slate-100)', color: 'var(--slate-600)' }}>~ Potential</span>;
}

export default function ConsumerRecommendations() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [industryMap, setIndustryMap] = useState([]);
  const [filters, setFilters] = useState({ minScore: 0, maxDistance: 9999 });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.minScore > 0)    params.set('minScore', filters.minScore);
      if (filters.maxDistance < 9999) params.set('maxDistance', filters.maxDistance);
      const [mRes, iRes] = await Promise.all([
        api.get(`/matches/consumer?${params}`),
        api.get('/matches/industry-map'),
      ]);
      setMatches(mRes.data.matches);
      setIndustryMap(iRes.data.affinityMap || []);
    } catch { toast.error('Failed to load recommendations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const runAI = async () => {
    setRunning(true);
    try {
      const res = await api.post('/matches/run');
      toast.success(res.data.message || `🤖 AI found ${res.data.count} matches!`);
      await load();
    } catch { toast.error('AI matching failed'); }
    finally { setRunning(false); }
  };

  const sendDeal = async (match) => {
    try {
      const res = await api.post('/deals', {
        matchId:    match._id,
        listingId:  match.listing?._id,
        producerId: match.listing?.producer?._id || match.producer,
        message:    `Hi! I'm interested in your ${match.listing?.wasteType} listing. Our AI matched us at ${match.score}% — let's discuss!`,
      });
      toast.success('Deal request sent!');
      navigate(`/deals/${res.data.deal._id}`);
    } catch { toast.error('Failed to send deal request'); }
  };

  const scoreColor = s => s >= 80 ? '#15803d' : s >= 60 ? '#2563eb' : '#64748b';
  const scoreBg    = s => s >= 80 ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : s >= 60 ? 'linear-gradient(135deg,#eff6ff,#dbeafe)' : 'var(--slate-50)';

  const BREAKDOWN_META = [
    { key: 'industryAffinity',    label: 'Industry Affinity',    weight: '35%' },
    { key: 'textSimilarity',      label: 'Text Similarity',      weight: '15%' },
    { key: 'geoProximity',        label: 'Geo Proximity',        weight: '20%' },
    { key: 'priceCompetitive',    label: 'Price Competitiveness',weight: '10%' },
    { key: 'conditionQuality',    label: 'Condition Quality',    weight: '5%'  },
    { key: 'availabilityUrgency', label: 'Availability',         weight: '5%'  },
    { key: 'producerReputation',  label: 'Seller Reputation',    weight: '5%'  },
    { key: 'dealHistoryBoost',    label: 'Deal History',         weight: '5%'  },
  ];

  return (
    <AppLayout title="AI Recommendations">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' }}>

        {/* Main content */}
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={{ fontWeight: 700 }}>{matches.length} AI-matched listings</span>
              <span className="badge badge-ai" style={{ marginLeft: 8 }}>🤖 ML Powered</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <select className="select" style={{ width: 150, fontSize: '0.82rem', padding: '7px 10px' }}
                value={filters.minScore} onChange={e => setFilters(f => ({ ...f, minScore: Number(e.target.value) }))}>
                <option value={0}>All scores</option>
                <option value={60}>60%+ match</option>
                <option value={70}>70%+ match</option>
                <option value={80}>80%+ match</option>
              </select>
              <select className="select" style={{ width: 150, fontSize: '0.82rem', padding: '7px 10px' }}
                value={filters.maxDistance} onChange={e => setFilters(f => ({ ...f, maxDistance: Number(e.target.value) }))}>
                <option value={9999}>Any distance</option>
                <option value={50}>Within 50km</option>
                <option value={200}>Within 200km</option>
                <option value={500}>Within 500km</option>
              </select>
              <button className="btn btn-ghost btn-sm" onClick={load}>Apply</button>
              <button className="btn btn-primary btn-sm" onClick={runAI} disabled={running}>
                {running ? '🤖 Scanning...' : '🔄 Run AI Match'}
              </button>
            </div>
          </div>

          {/* AI scanning banner */}
          {running && (
            <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#eff6ff)', border: '1px solid #c4b5fd', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 18, height: 18, border: '2px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.875rem', color: '#7c3aed', fontWeight: 600 }}>AI engine running multi-factor scoring...</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: 2 }}>TF-IDF similarity · Geo proximity · Industry affinity · Price analysis</div>
              </div>
            </div>
          )}

          {loading ? (
            [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 200, marginBottom: 16 }} />)
          ) : matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-400)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🤖</div>
              <h3 style={{ color: 'var(--slate-600)', marginBottom: 8 }}>No matches yet</h3>
              <p className="text-sm" style={{ marginBottom: 20 }}>Click "Run AI Match" to scan all listings using our ML engine.</p>
              <button className="btn btn-primary" onClick={runAI}>Run AI Matching</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {matches.map((m, idx) => {
                const listing  = m.listing;
                const producer = listing?.producer;
                const isOpen   = expanded === m._id;
                return (
                  <div key={m._id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: idx === 0 ? '1.5px solid var(--green-200)' : '1px solid var(--slate-100)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', transition: 'all 0.2s' }}>

                    {/* Top badge row */}
                    {idx === 0 && (
                      <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#eff6ff)', padding: '8px 20px', display: 'flex', gap: 8 }}>
                        <span className="badge badge-green">🏆 Best Match</span>
                        <span className="badge badge-ai">🤖 AI Top Pick</span>
                      </div>
                    )}

                    <div style={{ padding: 20 }}>
                      {/* Header row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 48, height: 48, background: 'var(--gradient-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>♻️</div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700 }}>{listing?.wasteType || listing?.category}</span>
                              {producer?.verification?.status === 'verified' && <span className="verified-badge">✓ Verified</span>}
                              <ConfidenceBadge score={m.score} />
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: 2 }}>
                              {producer?.company?.name} · {listing?.location?.city}, {listing?.location?.state}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: 2 }}>
                              ⭐ {producer?.rating?.average || 'New'} · {listing?.quantity} {listing?.unit}
                              {m.distanceKm != null && ` · 📍 ${m.distanceKm}km away`}
                            </div>
                          </div>
                        </div>

                        {/* Score ring */}
                        <div style={{ background: scoreBg(m.score), border: `2px solid ${scoreColor(m.score)}30`, borderRadius: 'var(--radius-md)', padding: '10px 16px', textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: scoreColor(m.score), lineHeight: 1 }}>{m.score}%</div>
                          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Score</div>
                        </div>
                      </div>

                      {/* Quick stats */}
                      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                        {listing?.pricePerUnit && <span style={{ fontSize: '0.82rem', color: 'var(--slate-600)' }}>💰 ${listing.pricePerUnit}/{listing.unit} {listing.negotiable ? '(negotiable)' : ''}</span>}
                        <span style={{ fontSize: '0.82rem', color: 'var(--slate-600)' }}>⚡ {listing?.availability}</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--slate-600)' }}>🔬 {listing?.condition}</span>
                        {m.profitEstimate > 0 && <span style={{ fontSize: '0.82rem', color: 'var(--green-700)', fontWeight: 600 }}>📈 ~Rs.{m.profitEstimate?.toLocaleString()} savings vs new</span>}
                      </div>

                      {/* AI reason */}
                      {m.aiReason && (
                        <div style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.12)', borderRadius: 'var(--radius-md)', padding: '9px 12px', marginTop: 12, fontSize: '0.8rem', color: 'var(--slate-700)' }}>
                          <span style={{ fontWeight: 700, color: '#7c3aed' }}>🤖 Why this match: </span>{m.aiReason}
                        </div>
                      )}

                      {/* Suggested uses */}
                      {listing?.aiData?.suggestedUses && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                          {listing.aiData.suggestedUses.slice(0, 3).map(u => (
                            <span key={u} className="badge badge-green" style={{ fontSize: '0.7rem' }}>✓ {u}</span>
                          ))}
                        </div>
                      )}

                      {/* ML Score Breakdown (expandable) */}
                      {isOpen && m.scoreBreakdown && (
                        <div style={{ marginTop: 16, padding: 16, background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--slate-700)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="ai-badge">🤖 ML</span> Score Breakdown
                          </div>
                          {BREAKDOWN_META.map(({ key, label, weight }) => (
                            <ScoreBar key={key} label={label} value={m.scoreBreakdown[key] || 0} weight={weight} />
                          ))}
                          <div style={{ marginTop: 10, padding: '8px 12px', background: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--slate-500)', border: '1px solid var(--slate-100)' }}>
                            Final score = weighted sum of all features · Threshold: 35% · Algorithm: multi-factor cosine similarity
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                        <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => sendDeal(m)}>📨 Send Deal Request</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(isOpen ? null : m._id)}>
                          {isOpen ? '▲ Hide ML Details' : '📊 ML Breakdown'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right panel — Industry affinity map */}
        <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="chart-card">
            <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 4 }}>🏭 Your Industry Needs</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: 14 }}>Waste categories your industry commonly uses</p>
            {industryMap.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>Run AI matching to see your industry map.</p>
            ) : industryMap.slice(0, 8).map(({ category, affinity, topUses }) => (
              <div key={category} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-700)', textTransform: 'capitalize' }}>{category}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: affinity >= 80 ? 'var(--green-700)' : 'var(--blue-600)' }}>{affinity}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--slate-100)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${affinity}%`, background: affinity >= 80 ? 'var(--gradient-green)' : 'var(--gradient-blue)', borderRadius: 99 }} />
                </div>
                {topUses?.[0] && <div style={{ fontSize: '0.68rem', color: 'var(--slate-400)', marginTop: 2 }}>{topUses[0]}</div>}
              </div>
            ))}
          </div>

          <div className="chart-card">
            <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 10 }}>🧠 How AI Scores Work</div>
            {[
              ['35%', 'Industry Affinity', 'How well your industry uses this waste type'],
              ['20%', 'Geo Proximity',     'Haversine distance — lower transport cost'],
              ['15%', 'Text Similarity',   'TF-IDF cosine match on descriptions'],
              ['10%', 'Price Analysis',    'Price vs current market rate'],
              ['5%',  'Condition',         'Clean > processed > mixed > contaminated'],
              ['5%',  'Availability',      'Immediate > recurring > month'],
              ['5%',  'Seller Rating',     'Producer reputation score'],
              ['5%',  'Deal History',      'Your past deal activity signal'],
            ].map(([w, name, desc]) => (
              <div key={name} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                <span style={{ background: 'var(--green-100)', color: 'var(--green-700)', fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: 99, flexShrink: 0, marginTop: 1 }}>{w}</span>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-700)' }}>{name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AppLayout>
  );
}
