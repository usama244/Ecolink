import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const categories = ['steel','copper','plastic','wood','chemical','paper','rubber','glass','textile','electronic','coconut','food'];

export default function UploadListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ wasteType:'', category:'', condition:'clean', quantity:'', unit:'tonnes', pricePerUnit:'', currency:'USD', negotiable:true, availability:'immediate', description:'', location:{ city:'', state:'', country:'India' } });
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [drag, setDrag] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setLoc = (k, v) => setForm(f => ({ ...f, location: { ...f.location, [k]: v } }));

  const fetchAI = async (category, quantity, unit) => {
    if (!category) return;
    setAiLoading(true);
    try {
      const res = await api.post('/ai/classify', { category, quantity: quantity || 1, unit });
      setAiData(res.data);
    } catch { /* silent */ }
    finally { setAiLoading(false); }
  };

  const generateDescription = async () => {
    if (!form.category) {
      toast.error('Please select a waste category first');
      return;
    }
    
    setGeneratingDesc(true);
    try {
      const res = await api.post('/ai/generate-description', {
        wasteType: form.wasteType,
        category: form.category,
        condition: form.condition,
        quantity: form.quantity,
        unit: form.unit,
        location: form.location
      });
      set('description', res.data.description);
      toast.success('AI description generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate description');
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleCategoryChange = (val) => {
    set('category', val);
    set('wasteType', val.charAt(0).toUpperCase() + val.slice(1) + ' Waste');
    fetchAI(val, form.quantity, form.unit);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/listings', form);
      toast.success('Listing submitted for review!');
      navigate('/producer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally { setSubmitting(false); }
  };

  return (
    <AppLayout title="List Waste">
      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28, maxWidth: 480 }}>
        {['Waste Details','AI Preview','Publish'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: i === 0 ? 'var(--gradient-green)' : aiData && i === 1 ? 'var(--gradient-blue)' : 'var(--slate-200)', color: i === 0 || (aiData && i === 1) ? 'white' : 'var(--slate-500)', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: i === 0 ? 'var(--green-700)' : aiData && i === 1 ? 'var(--blue-600)' : 'var(--slate-400)' }}>{s}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: 'var(--slate-200)', margin: '0 12px' }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        {/* Form */}
        <div className="chart-card">
          <h3 style={{ marginBottom: 4 }}>Waste Details</h3>
          <p className="text-muted text-sm" style={{ marginBottom: 24 }}>Fill in the details. AI will auto-suggest categories and find buyers.</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Waste Category *</label>
                <select className="select" value={form.category} onChange={e => handleCategoryChange(e.target.value)} required>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Waste Type Name *</label>
                <input className="input" placeholder="e.g. Steel Scrap" value={form.wasteType} onChange={e => set('wasteType', e.target.value)} required />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select className="select" value={form.condition} onChange={e => set('condition', e.target.value)}>
                  <option value="clean">Clean / Sorted</option>
                  <option value="mixed">Mixed / Unsorted</option>
                  <option value="contaminated">Contaminated</option>
                  <option value="processed">Processed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Availability</label>
                <select className="select" value={form.availability} onChange={e => set('availability', e.target.value)}>
                  <option value="immediate">Immediate</option>
                  <option value="week">Within 1 week</option>
                  <option value="month">Within 1 month</option>
                  <option value="recurring">Recurring monthly</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" type="number" placeholder="25" value={form.quantity} onChange={e => { set('quantity', e.target.value); if (form.category) fetchAI(form.category, e.target.value, form.unit); }} required style={{ flex: 1 }} />
                  <select className="select" style={{ width: 100 }} value={form.unit} onChange={e => set('unit', e.target.value)}>
                    <option value="tonnes">Tonnes</option>
                    <option value="kg">Kg</option>
                    <option value="litres">Litres</option>
                    <option value="units">Units</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Price per unit</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select className="select" style={{ width: 80 }} value={form.currency} onChange={e => set('currency', e.target.value)}>
                    <option>USD</option><option>INR</option><option>EUR</option>
                  </select>
                  <input className="input" type="number" placeholder="480" value={form.pricePerUnit} onChange={e => set('pricePerUnit', e.target.value)} style={{ flex: 1 }} />
                </div>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="input" placeholder="Mumbai" value={form.location.city} onChange={e => setLoc('city', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="input" placeholder="Maharashtra" value={form.location.state} onChange={e => setLoc('state', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Description</label>
                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  onClick={generateDescription}
                  disabled={generatingDesc || !form.category}
                  style={{ 
                    padding: '4px 12px', 
                    fontSize: '0.8rem', 
                    height: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {generatingDesc ? '⏳ Generating...' : '✨ Generate with AI'}
                </button>
              </div>
              <textarea className="textarea" placeholder="Describe the waste material, handling requirements, certifications..." value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            {/* Upload zone */}
            <div className="form-group">
              <label className="form-label">Photos</label>
              <div className={`upload-zone ${drag ? 'drag-over' : ''}`} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); toast.success(`${e.dataTransfer.files.length} file(s) ready`); }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📸</div>
                <div style={{ fontWeight: 600, color: 'var(--slate-700)' }}>Drag & drop photos here</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: 4 }}>or click to browse · PNG, JPG up to 10MB</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate('/producer')}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={submitting}>
                {submitting ? 'Publishing...' : '🚀 Publish Listing'}
              </button>
            </div>
          </form>
        </div>

        {/* AI Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
          <div className="ai-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span className="ai-badge">🤖 AI Insight</span>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--slate-800)' }}>Smart Suggestions</span>
            </div>
            {aiLoading ? (
              [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 36, marginBottom: 8 }} />)
            ) : aiData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {aiData.suggestedUses?.map(u => (
                  <div key={u} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', borderRadius: 'var(--radius-md)', padding: '9px 12px', fontSize: '0.82rem', color: 'var(--slate-700)', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ color: 'var(--green-600)', fontWeight: 700 }}>✓</span> {u}
                  </div>
                ))}
                <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '9px 12px', fontSize: '0.82rem', color: 'var(--slate-700)', marginTop: 4 }}>
                  <strong>Market Rate:</strong> {aiData.marketRate}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', textAlign: 'center', padding: '16px 0' }}>Select a waste category to see AI insights.</p>
            )}
          </div>

          {aiData && (
            <div className="chart-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginBottom: 4 }}>Estimated Value</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }} className="gradient-text">{aiData.estimatedValue}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>based on current market rates</div>
              <div className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span className="text-muted">Impact Score</span>
                <span style={{ fontWeight: 700, color: 'var(--green-700)' }}>{aiData.impactScore}/100</span>
              </div>
            </div>
          )}

          <div className="chart-card">
            <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 10 }}>💡 Tips</div>
            {['Add clear photos to get 3x more responses','Specify exact quantity for better AI matching','Mark as Recurring for long-term partnerships'].map(t => (
              <div key={t} style={{ display: 'flex', gap: 8, fontSize: '0.8rem', color: 'var(--slate-600)', marginBottom: 6 }}>
                <span style={{ color: 'var(--green-600)', fontWeight: 700, flexShrink: 0 }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
