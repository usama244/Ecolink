import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title, onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="icon-btn" onClick={onMenuClick} aria-label="Toggle menu"><Menu size={18} /></button>
        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="icon-btn" style={{ position: 'relative' }} aria-label="Notifications">
          <Bell size={18} />
          <div className="notif-dot" />
        </button>
        <div className="avatar" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>{initials}</div>
      </div>
    </div>
  );
}
