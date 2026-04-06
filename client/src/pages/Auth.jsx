import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const industries = ['Steel & Metal','Chemical & Pharma','Textile & Apparel','Food & Beverage','Construction','Automotive','Electronics','Paper & Packaging','Recycling','Agriculture','Rope Manufacturing','Other'];

export default function Auth() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('signin');
  const [role, setRole] = useState('producer');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'', companyName:'', industry:'' });

  if (user) return <Navigate to="/dashboard" replace />;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      toast.success(`Welcome back, ${u.firstName}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, role, company: { name: form.companyName, industry: form.industry } });
      toast.success(`Account created! Welcome, ${u.firstName}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(34,197,94,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: 900, width: '100%', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-xl)', position: 'relative', zIndex: 1 }}>

        {/* Left */}
        <div style={{ background: 'linear-gradient(135deg,rgba(22,163,74,0.9),rgba(37,99,235,0.9))', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>♻️</div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>EcoLink AI</span>
            </div>
            <h2 style={{ color: 'white', fontSize: '1.7rem', marginBottom: 12 }}>The circular economy starts here.</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', lineHeight: 1.7 }}>Join 2,400+ companies turning industrial waste into profit with AI-powered matching.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['🏭','Waste Producer','List waste, get AI matches, earn revenue'],['🛒','Waste Consumer','Find raw materials, reduce procurement costs'],['🛡️','Admin','Verify companies, manage platform']].map(([icon,name,desc]) => (
              <div key={name} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.3rem' }}>{icon}</span>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ background: 'white', padding: '48px 40px', overflowY: 'auto', maxHeight: '90vh' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--slate-100)', borderRadius: 'var(--radius-full)', padding: 4, marginBottom: 28 }}>
            {['signin','signup'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', borderRadius: 'var(--radius-full)', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', background: tab === t ? 'white' : 'transparent', color: tab === t ? 'var(--slate-900)' : 'var(--slate-500)', boxShadow: tab === t ? 'var(--shadow-sm)' : 'none' }}>
                {t === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h3 style={{ marginBottom: 4 }}>Welcome back</h3>
                <p className="text-muted text-sm">Sign in to your EcoLink AI account</p>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--green-600)', fontWeight: 600 }}>Forgot password?</a>
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', width: '100%' }}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
              <div style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', padding: 12, fontSize: '0.78rem', color: 'var(--slate-600)' }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Demo accounts:</div>
                <div>🏭 producer@ecolink.ai / producer123</div>
                <div>🛒 consumer@ecolink.ai / consumer123</div>
                <div>🛡️ admin@ecolink.ai / admin123</div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <h3 style={{ marginBottom: 4 }}>Create your account</h3>
                <p className="text-muted text-sm">Join the circular economy in minutes</p>
              </div>
              {/* Role selection */}
              <div>
                <div className="form-label" style={{ marginBottom: 8 }}>I am a...</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[['producer','🏭','Waste Producer','I generate waste'],['consumer','🛒','Waste Consumer','I need materials']].map(([r,icon,name,desc]) => (
                    <div key={r} onClick={() => setRole(r)} style={{ border: `1.5px solid ${role===r?'var(--green-500)':'var(--slate-200)'}`, borderRadius: 'var(--radius-md)', padding: '12px', cursor: 'pointer', textAlign: 'center', background: role===r?'var(--green-50)':'white', transition: 'all 0.2s', boxShadow: role===r?'0 0 0 3px rgba(34,197,94,0.15)':'none' }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{icon}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-800)' }}>{name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="input" placeholder="John" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="input" placeholder="Doe" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input className="input" placeholder="Your Company Ltd." value={form.companyName} onChange={e => set('companyName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Industry</label>
                <select className="select" value={form.industry} onChange={e => set('industry', e.target.value)} required>
                  <option value="">Select industry...</option>
                  {industries.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Work Email</label>
                <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', width: '100%' }}>
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
            </form>
          )}
          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--slate-400)', marginTop: 16 }}>🔒 Your data is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
}
