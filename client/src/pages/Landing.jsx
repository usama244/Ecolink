import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';

/* ── Animated counter ── */
function AnimCounter({ end, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let cur = 0; const step = end / 80;
      const t = setInterval(() => {
        cur = Math.min(cur + step, end);
        const v = end >= 1e6 ? (cur/1e6).toFixed(1)+'M' : end >= 1000 ? Math.round(cur/100)/10+'K' : Math.round(cur);
        el.textContent = prefix + v + suffix;
        if (cur >= end) clearInterval(t);
      }, 20);
      obs.disconnect();
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

/* ── Live ticker ── */
function LiveTicker() {
  const items = [
    '🏭 SteelCo Industries listed 25t Steel Scrap → matched in 4s',
    '🛒 RopeCraft accepted Coconut Fiber deal — Rs.2,64,000',
    '🌱 2.4 tonnes CO₂ saved · BuildRight + SteelCo deal closed',
    '🤖 AI matched E-Waste listing to 6 recyclers in Bangalore',
    '✅ GreenCycle closed deal · 15t Plastic · Rs.2,49,000',
    '📍 New listing: Copper Wire 5t · Mumbai · 91% AI match found',
    '🏭 Kerala Coconut Co. listed 40t Coir Fiber — 3 buyers matched',
    '💰 AutoParts Forge saved Rs.8.2L on steel procurement this month',
  ];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % items.length); setVisible(true); }, 400);
    }, 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 99, padding: '8px 20px', display: 'inline-flex', alignItems: 'center', gap: 10, maxWidth: '100%' }}>
      <div style={{ width: 7, height: 7, background: '#4ade80', borderRadius: '50%', flexShrink: 0, animation: 'pulse 2s infinite' }} />
      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', opacity: visible ? 1 : 0, transition: 'opacity 0.3s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {items[idx]}
      </span>
    </div>
  );
}

/* ── Waste Flow Diagram ── */
function WasteFlowDiagram() {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 4), 1800); return () => clearInterval(t); }, []);
  const nodes = [
    { icon: '🏭', label: 'Factory A', sub: 'Steel Waste', color: '#ef4444' },
    { icon: '🤖', label: 'EcoLink AI', sub: 'Matching...', color: '#7c3aed' },
    { icon: '🏗️', label: 'Factory B', sub: 'Raw Material', color: '#22c55e' },
  ];
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '28px 24px' }}>
      {/* Flow nodes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 24 }}>
        {nodes.map((n, i) => (
          <div key={n.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: i === 1 ? 0 : 1 }}>
            {i === 1 ? (
              <div style={{ background: 'var(--gradient-primary)', borderRadius: 16, padding: '12px 20px', textAlign: 'center', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}>
                <div style={{ fontSize: '1.4rem' }}>{n.icon}</div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '0.8rem', marginTop: 4 }}>{n.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem' }}>{step === 1 || step === 2 ? '⚡ Scoring...' : 'Ready'}</div>
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${n.color}40`, borderRadius: 16, padding: '14px 18px', textAlign: 'center', transition: 'all 0.4s' }}>
                <div style={{ fontSize: '1.8rem' }}>{n.icon}</div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.82rem', marginTop: 4 }}>{n.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>{n.sub}</div>
              </div>
            )}
            {i < 2 && (
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 4px' }}>
                <div style={{ height: 2, flex: 1, background: `linear-gradient(90deg, ${i===0?'#ef4444':'#7c3aed'}, ${i===0?'#7c3aed':'#22c55e'})`, opacity: step > i ? 1 : 0.3, transition: 'opacity 0.5s' }} />
                <div style={{ position: 'absolute', fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                  {i === 0 ? (step >= 1 ? '✓ Listed' : 'Upload') : (step >= 3 ? '✓ Matched' : 'Matching')}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Score cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[['94%','AI Score','#4ade80'],['Rs.99K','Deal Value','#60a5fa'],['2.4t','CO₂ Saved','#4ade80']].map(([v,l,c]) => (
          <div key={l} style={{ background: `${c}18`, border: `1px solid ${c}35`, borderRadius: 12, padding: '10px 8px', textAlign: 'center', opacity: step >= 3 ? 1 : 0.4, transition: 'opacity 0.6s' }}>
            <div style={{ color: c, fontWeight: 900, fontSize: '1.1rem', lineHeight: 1 }}>{v}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginTop: 3 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 14, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
        Average match time: <span style={{ color: '#4ade80', fontWeight: 700 }}>4.2 seconds</span>
      </div>
    </div>
  );
}

/* ── Feature card ── */
function FeatureCard({ icon, title, desc, color, delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.opacity = '0'; el.style.transform = 'translateY(24px)';
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      setTimeout(() => { el.style.transition = 'all 0.6s ease'; el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, delay);
      obs.disconnect();
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid var(--slate-100)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s', cursor: 'default' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
      <div style={{ width: 52, height: 52, background: color, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: 16 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: '0.875rem', color: 'var(--slate-500)', lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

/* ── Main Landing component ── */
export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const go = () => navigate(user ? '/dashboard' : '/auth');

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .hero-btn:hover { transform:translateY(-3px)!important; }
        .step-card:hover { transform:translateY(-4px); box-shadow:0 20px 60px rgba(0,0,0,0.15)!important; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: scrolled ? '10px 0' : '18px 0', background: scrolled ? 'rgba(15,23,42,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none', transition: 'all 0.3s' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'var(--gradient-primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 4px 16px rgba(34,197,94,0.4)' }}>♻️</div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>EcoLink <span style={{ color: '#4ade80' }}>AI</span></span>
          </div>
          <div style={{ display: 'none', gap: 4, alignItems: 'center' }} className="nav-links-desktop">
            {['Features','How It Works','Impact','Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(' ','-')}`} style={{ padding: '7px 14px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 500, borderRadius: 99, transition: 'all 0.2s', textDecoration: 'none' }}
                onMouseEnter={e => { e.target.style.color='white'; e.target.style.background='rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { e.target.style.color='rgba(255,255,255,0.7)'; e.target.style.background='transparent'; }}>{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {user ? (
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')} style={{ boxShadow: '0 4px 20px rgba(34,197,94,0.4)' }}>Dashboard →</button>
            ) : (
              <>
                <button onClick={() => navigate('/auth')} style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.15)'}
                  onMouseLeave={e => e.target.style.background='rgba(255,255,255,0.08)'}>Sign In</button>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')} style={{ boxShadow: '0 4px 20px rgba(34,197,94,0.4)' }}>Get Started Free</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#020817 0%,#0f172a 40%,#0d2137 70%,#0a1f0f 100%)', backgroundSize: '400% 400%', animation: 'gradientShift 12s ease infinite', display: 'flex', alignItems: 'center', padding: '110px 0 70px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '15%', left: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '30%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              {/* Live ticker */}
              <div style={{ marginBottom: 24 }}><LiveTicker /></div>

              <h1 style={{ color: 'white', fontSize: 'clamp(2.4rem,4.5vw,4.2rem)', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.03em', fontWeight: 900 }}>
                Turn Industrial{' '}
                <span style={{ background: 'linear-gradient(135deg,#4ade80,#22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Waste</span>
                {' '}into{' '}
                <span style={{ background: 'linear-gradient(135deg,#60a5fa,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Profit</span>
                {' '}with AI
              </h1>

              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.1rem', lineHeight: 1.75, marginBottom: 36, maxWidth: 500 }}>
                EcoLink AI uses machine learning to connect industries — where one factory's waste becomes another's raw material. Reduce costs, generate revenue, and build a sustainable future.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
                <button className="hero-btn" onClick={go} style={{ padding: '14px 28px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', border: 'none', borderRadius: 99, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 32px rgba(34,197,94,0.45)', transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: 8 }}>
                  📦 List Your Waste — Free
                </button>
                <button className="hero-btn" onClick={go} style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 99, fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: 8 }}>
                  🔍 Find Resources
                </button>
              </div>

              {/* Trust signals */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, background: '#4ade80', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem' }}>2,400+ Active Companies</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#fbbf24', fontSize: '0.9rem' }}>★★★★★</span>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem' }}>4.9/5 · 1,200+ reviews</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#4ade80', fontSize: '0.82rem', fontWeight: 700 }}>🔒</span>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem' }}>ISO 27001 Certified</span>
                </div>
              </div>
            </div>

            {/* Animated flow diagram */}
            <div style={{ animation: 'float 4s ease-in-out infinite' }}>
              <WasteFlowDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: 'white', padding: '56px 0', borderBottom: '1px solid var(--slate-100)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32, textAlign: 'center' }}>
            {[
              { end: 48200, label: 'Tonnes Waste Reused', icon: '♻️' },
              { end: 12400, label: 'Tonnes CO₂ Saved', icon: '🌱' },
              { end: 26600, label: 'Crore Revenue Generated', icon: '💰', prefix: 'Rs.', suffix: 'Cr+' },
              { end: 2400, label: 'Partner Companies', icon: '🏭' },
            ].map(s => (
              <div key={s.label} style={{ padding: '16px 8px' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>
                  <AnimCounter end={s.end} prefix={s.prefix || ''} />
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '90px 0', background: 'var(--slate-50)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="badge badge-green" style={{ marginBottom: 12, fontSize: '0.78rem' }}>✦ How It Works</span>
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: 'var(--slate-900)', marginBottom: 12 }}>From waste to revenue in 3 steps</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>Our AI handles the entire workflow — from listing to deal closure in minutes.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              { num: '01', icon: '📦', title: 'List Your Waste', desc: 'Upload waste type, quantity, and location in under 60 seconds. AI auto-categorizes, suggests pricing, and generates a smart caption.', color: '#f0fdf4', accent: '#22c55e' },
              { num: '02', icon: '🤖', title: 'AI Finds Matches', desc: 'Our ML engine scores every potential buyer using 8 weighted features — industry affinity, geo-proximity, TF-IDF text similarity, and more.', color: '#eff6ff', accent: '#3b82f6' },
              { num: '03', icon: '🤝', title: 'Close the Deal', desc: 'Negotiate, accept, and track your transaction in our built-in chat. Get paid and see your real-time CO₂ impact dashboard update.', color: '#f5f3ff', accent: '#7c3aed' },
            ].map((s, i) => (
              <div key={s.num} className="step-card" style={{ background: 'white', borderRadius: 20, padding: 32, border: `1px solid ${s.accent}20`, boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 16, right: 20, fontSize: '3rem', fontWeight: 900, color: `${s.accent}12`, lineHeight: 1 }}>{s.num}</div>
                <div style={{ width: 56, height: 56, background: s.color, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: 18, border: `1px solid ${s.accent}30` }}>{s.icon}</div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '90px 0', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="badge badge-blue" style={{ marginBottom: 12 }}>✦ Platform Features</span>
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: 'var(--slate-900)' }}>Everything you need to close the loop</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            <FeatureCard icon="🤖" title="8-Factor AI Matching" desc="TF-IDF cosine similarity, Haversine geo-distance, industry affinity matrix, price competitiveness — all weighted into one score." color="#f5f3ff" delay={0} />
            <FeatureCard icon="📍" title="Geo-Intelligent Routing" desc="Haversine distance scoring minimises transport costs. Matches within 50km score 40% higher than 500km matches." color="#eff6ff" delay={80} />
            <FeatureCard icon="💬" title="Built-in Deal Chat" desc="Negotiate, propose terms, and close deals without leaving the platform. AI suggests fair pricing in real time." color="#f0fdf4" delay={160} />
            <FeatureCard icon="📊" title="Impact Analytics" desc="Track CO₂ saved, waste diverted, revenue generated, and energy saved — all updated live after every deal." color="#fff7ed" delay={240} />
            <FeatureCard icon="🛡️" title="Trust & Verification" desc="Every company is KYC-verified by our admin team. Ratings, transaction history, and compliance badges ensure safe deals." color="#fef2f2" delay={320} />
            <FeatureCard icon="⚡" title="1-Minute Listing" desc="AI auto-classifies waste from your description, suggests market pricing, and finds buyers before you finish the form." color="#f0fdf4" delay={400} />
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section style={{ padding: '90px 0', background: 'var(--slate-50)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="badge badge-green" style={{ marginBottom: 12 }}>✦ Who It's For</span>
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: 'var(--slate-900)' }}>Built for every player in the circular economy</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              { icon: '🏭', title: 'Waste Producers', gradient: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '#86efac', features: ['Upload waste in 60 seconds','AI auto-categorizes & prices','Get matched with buyers instantly','Track revenue & CO₂ impact'], cta: 'Start Selling Waste' },
              { icon: '🛒', title: 'Waste Consumers', gradient: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '#93c5fd', features: ['Browse verified waste listings','AI recommends best matches','Send deal requests directly','Reduce raw material costs by 30%+'], cta: 'Find Raw Materials' },
              { icon: '🛡️', title: 'Platform Admin', gradient: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: '#c4b5fd', features: ['Verify company identities','Moderate all listings','Resolve disputes fairly','Monitor all transactions live'], cta: 'Admin Access' },
            ].map(r => (
              <div key={r.title} style={{ background: r.gradient, border: `1.5px solid ${r.border}`, borderRadius: 22, padding: 30, transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: '2.8rem', marginBottom: 14 }}>{r.icon}</div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', marginBottom: 16 }}>{r.title}</h3>
                {r.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: 9 }}>
                    <span style={{ color: 'var(--green-600)', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
                <button className="btn btn-primary btn-sm" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }} onClick={go}>{r.cta} →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '90px 0', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="badge badge-green" style={{ marginBottom: 12 }}>✦ Success Stories</span>
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: 'var(--slate-900)' }}>Companies already profiting from waste</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              { name: 'Rajesh Kumar', role: 'Operations Director, SteelCo Industries', quote: 'EcoLink AI turned our scrap metal into Rs.40 lakh annual revenue. The AI matching found buyers we never knew existed — within 4 seconds of listing.', rating: 5, result: '+Rs.40L revenue' },
              { name: 'Anita Patel', role: 'CEO, RopeCraft Manufacturing, Pune', quote: 'We reduced raw material costs by 34% by sourcing coconut fiber through EcoLink. The AI matched us with Kerala Coconut Co. — a perfect fit for our coir rope production.', rating: 5, result: '-34% material cost' },
              { name: 'Deepa Nair', role: 'Plant Manager, GreenCycle Recyclers', quote: 'As a recycler, EcoLink is a goldmine. The AI sends us pre-scored listings every time a new waste is approved. We closed 52 deals in 6 months — all in India.', rating: 5, result: '52 deals closed' },
            ].map(t => (
              <div key={t.name} style={{ background: 'var(--slate-50)', borderRadius: 20, padding: 28, border: '1px solid var(--slate-100)', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--slate-50)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                  {[...Array(t.rating)].map((_, i) => <span key={i} style={{ color: '#fbbf24', fontSize: '1rem' }}>★</span>)}
                </div>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{t.name[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--slate-900)' }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{t.role}</div>
                    </div>
                  </div>
                  <span style={{ background: 'var(--green-100)', color: 'var(--green-700)', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 99 }}>{t.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '90px 0', background: 'linear-gradient(135deg,#020817,#0f172a,#0a1f0f)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', fontSize: '0.78rem', fontWeight: 600, padding: '6px 14px', borderRadius: 99, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ✦ Join the Circular Economy
          </div>
          <h2 style={{ color: 'white', fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 16, letterSpacing: '-0.02em' }}>Ready to profit from your waste?</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 36, fontSize: '1.05rem', lineHeight: 1.7 }}>Join 2,400+ companies already building a circular economy with AI. Free to start — no credit card required.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="hero-btn" onClick={go} style={{ padding: '15px 32px', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', border: 'none', borderRadius: 99, fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 32px rgba(34,197,94,0.45)', transition: 'all 0.25s' }}>
              📦 Start for Free →
            </button>
            <button className="hero-btn" onClick={() => navigate('/impact')} style={{ padding: '15px 32px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 99, fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s' }}>
              🌍 View Impact Report
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#020817', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: 'var(--gradient-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>♻️</div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>EcoLink <span style={{ color: '#4ade80' }}>AI</span></span>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Privacy','Terms','Contact','Impact'].map(l => (
                <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color='rgba(255,255,255,0.8)'}
                  onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.4)'}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>© 2026 EcoLink AI. All rights reserved.</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>🌱 Carbon neutral company · Powered by renewable energy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
