import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Upload, Search, BarChart2, MessageSquare, Zap, ShieldCheck, FileText, AlertTriangle, CreditCard, User, LogOut, Settings } from 'lucide-react';

const producerLinks = [
  { to: '/producer', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/producer/upload', icon: Upload, label: 'My Listings' },
  { to: '/producer/matches', icon: Zap, label: 'Matches', badge: 'AI' },
  { to: '/producer/analytics', icon: BarChart2, label: 'Analytics' },
];

const consumerLinks = [
  { to: '/consumer', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/consumer/search', icon: Search, label: 'Browse Waste' },
  { to: '/consumer/recommendations', icon: Zap, label: 'AI Picks', badge: 'AI' },
  { to: '/consumer/analytics', icon: BarChart2, label: 'Analytics' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/verify', icon: ShieldCheck, label: 'Verify Companies' },
  { to: '/admin/moderation', icon: FileText, label: 'Moderation' },
  { to: '/admin/disputes', icon: AlertTriangle, label: 'Disputes' },
  { to: '/admin/transactions', icon: CreditCard, label: 'Transactions' },
];

const roleColors = { producer: '#16a34a', consumer: '#2563eb', admin: '#7c3aed' };
const roleLabels = { producer: 'Waste Producer', consumer: 'Waste Consumer', admin: 'Administrator' };

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'consumer' ? consumerLinks : producerLinks;
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 49 }} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, background: 'var(--gradient-primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>♻️</div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>Eco<span style={{ color: 'var(--green-600)' }}>Link</span> AI</span>
          </NavLink>
        </div>

        {/* Role badge */}
        <div style={{ margin: '0 8px 16px', padding: '8px 12px', background: `${roleColors[user?.role]}15`, borderRadius: 'var(--radius-md)', border: `1px solid ${roleColors[user?.role]}30` }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: roleColors[user?.role], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {user?.role === 'producer' ? '🏭' : user?.role === 'consumer' ? '🛒' : '🛡️'} {roleLabels[user?.role]}
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div className="sidebar-label">Navigation</div>
          {links.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to} end={to.split('/').length <= 2} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={17} />
              {label}
              {badge && <span className="badge badge-ai" style={{ marginLeft: 'auto', fontSize: '0.62rem', padding: '2px 6px' }}>{badge}</span>}
            </NavLink>
          ))}
        </div>

        <div style={{ marginTop: 8 }}>
          <div className="sidebar-label">Account</div>
          <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <User size={17} /> Profile
          </NavLink>
        </div>

        <div className="sidebar-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            <div className="avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.company?.name}</div>
            </div>
            <div className="dot-online" />
          </div>
          <button onClick={handleLogout} className="nav-link" style={{ width: '100%', background: 'none', border: 'none', color: '#ef4444', marginTop: 4 }}>
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
