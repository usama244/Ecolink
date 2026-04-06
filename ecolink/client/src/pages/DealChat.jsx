import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function DealChat() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef(null);

  const load = () => api.get(`/deals/${id}`).then(r => setDeal(r.data.deal)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [deal?.messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.post(`/deals/${id}/message`, { text });
      setText('');
      load();
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  const accept = async () => {
    try {
      await api.patch(`/deals/${id}/accept`);
      toast.success('Deal accepted! 🎉');
      load();
    } catch { toast.error('Failed to accept deal'); }
  };

  const reject = async () => {
    if (!confirm('Reject this deal?')) return;
    try {
      await api.patch(`/deals/${id}/reject`);
      toast.success('Deal rejected');
      navigate(-1);
    } catch { toast.error('Failed to reject'); }
  };

  if (loading) return <AppLayout title="Deal Chat"><div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60 }} />)}</div></AppLayout>;
  if (!deal) return <AppLayout title="Deal Chat"><p>Deal not found.</p></AppLayout>;

  const isProducer = deal.producer?._id === user?._id || deal.producer === user?._id;
  const other = isProducer ? deal.consumer : deal.producer;
  const otherInitials = `${other?.firstName?.[0] || ''}${other?.lastName?.[0] || ''}`;

  return (
    <AppLayout title="Deal Chat">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, height: 'calc(100vh - 120px)', alignItems: 'start' }}>
        {/* Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-100)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar" style={{ background: 'var(--gradient-blue)' }}>{otherInitials}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>{other?.company?.name}</span>
                  {other?.verification?.status === 'verified' && <span className="verified-badge">✓</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{deal.listing?.wasteType} · {deal.listing?.quantity} {deal.listing?.unit}</div>
              </div>
            </div>
            <span className={`badge ${deal.status === 'accepted' ? 'badge-green' : deal.status === 'negotiating' ? 'badge-blue' : 'badge-yellow'}`}>{deal.status}</span>
          </div>

          {/* Deal action bar */}
          {deal.status !== 'accepted' && deal.status !== 'rejected' && (
            <div style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#f0fdf4,#eff6ff)', borderBottom: '1px solid var(--slate-100)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--slate-600)' }}>🤖 AI suggests: Accept this deal — strong match for your industry.</span>
              {isProducer && <button className="btn btn-primary btn-sm" onClick={accept}>✅ Accept Deal</button>}
              <button className="btn btn-ghost btn-sm" onClick={() => setText("I'd like to negotiate the price.")}>💬 Negotiate</button>
              <button className="btn btn-danger btn-sm" onClick={reject}>✕ Reject</button>
            </div>
          )}

          {deal.status === 'accepted' && (
            <div style={{ padding: '10px 20px', background: 'var(--green-50)', borderBottom: '1px solid var(--green-100)', fontSize: '0.875rem', color: 'var(--green-700)', fontWeight: 600 }}>
              🎉 Deal accepted! CO₂ saved: {deal.impact?.co2Saved || 0}t · Waste reused: {deal.impact?.wasteReused || 0} tonnes
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--slate-50)' }}>
            {deal.messages?.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '20px 0', fontSize: '0.875rem' }}>No messages yet. Start the conversation!</div>
            )}
            {deal.messages?.map(m => {
              const isMine = m.sender?._id === user?._id || m.sender === user?._id;
              if (m.type === 'system') return (
                <div key={m._id} style={{ textAlign: 'center' }}>
                  <span style={{ background: 'var(--slate-100)', color: 'var(--slate-500)', fontSize: '0.75rem', padding: '4px 12px', borderRadius: 99 }}>{m.text}</span>
                </div>
              );
              return (
                <div key={m._id} className={`message ${isMine ? 'sent' : 'received'}`}>
                  {!isMine && <div className="avatar" style={{ width: 30, height: 30, fontSize: '0.72rem', background: 'var(--gradient-blue)' }}>{otherInitials}</div>}
                  <div>
                    <div className="message-bubble">{m.text}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--slate-400)', marginTop: 3, textAlign: isMine ? 'right' : 'left' }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          {deal.status !== 'rejected' && (
            <form onSubmit={send} style={{ padding: '14px 20px', background: 'white', borderTop: '1px solid var(--slate-100)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea className="input" style={{ flex: 1, borderRadius: 'var(--radius-md)', resize: 'none', minHeight: 40, maxHeight: 100 }} placeholder="Type a message..." value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); } }} rows={1} />
                <button type="submit" disabled={sending || !text.trim()} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-green)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {["Sounds good, let's proceed!", "Can you share the spec sheet?", "What's your best price?"].map(q => (
                  <button key={q} type="button" className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => setText(q)}>{q}</button>
                ))}
              </div>
            </form>
          )}
        </div>

        {/* Deal Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="chart-card">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>📋 Deal Summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Material</span><span style={{ fontWeight: 600 }}>{deal.listing?.wasteType}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Quantity</span><span style={{ fontWeight: 600 }}>{deal.listing?.quantity} {deal.listing?.unit}</span></div>
              {deal.finalTerms?.pricePerUnit && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="text-muted">Price</span><span style={{ fontWeight: 600, color: 'var(--green-700)' }}>${deal.finalTerms.pricePerUnit}/{deal.listing?.unit}</span></div>}
              {deal.finalTerms?.totalValue && (
                <>
                  <div style={{ height: 1, background: 'var(--slate-100)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 700 }}>Total</span><span style={{ fontWeight: 800, color: 'var(--green-700)', fontSize: '0.95rem' }}>Rs.{deal.finalTerms.totalValue.toLocaleString()}</span></div>
                </>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>🏢 {isProducer ? 'Buyer' : 'Seller'}</div>
            <div style={{ textAlign: 'center' }}>
              <div className="avatar" style={{ margin: '0 auto 8px', width: 44, height: 44, fontSize: '1rem', background: 'var(--gradient-blue)' }}>{otherInitials}</div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{other?.company?.name}</div>
              {other?.verification?.status === 'verified' && <div className="verified-badge" style={{ margin: '6px auto', display: 'inline-flex' }}>✓ Verified</div>}
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: 4 }}>⭐ {other?.rating?.average || 'New'} · {other?.rating?.count || 0} deals</div>
            </div>
          </div>

          {deal.impact && (
            <div className="chart-card">
              <div style={{ fontWeight: 700, marginBottom: 12 }}>🌱 Impact</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ background: 'var(--green-50)', borderRadius: 'var(--radius-md)', padding: 10, textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, color: 'var(--green-700)' }}>{deal.impact.co2Saved}t</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>CO₂ Saved</div>
                </div>
                <div style={{ background: '#eff6ff', borderRadius: 'var(--radius-md)', padding: 10, textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, color: 'var(--blue-600)' }}>{deal.impact.wasteReused}t</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>Reused</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
