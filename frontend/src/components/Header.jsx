import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Wallet, LogOut, UserCircle } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #bae6fd',
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 10px rgba(2, 132, 199, 0.05)'
    }}>
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: 42,
          height: 42,
          backgroundColor: '#e0f2fe',
          color: '#0284c7',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 3px 8px rgba(2, 132, 199, 0.15)'
        }}>
          <Wallet size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>BillBuddy</h1>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Smart Bill & Subscription Tracker</span>
        </div>
      </div>

      {/* User Greeting & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px',
          backgroundColor: '#f0f9ff',
          borderRadius: 20,
          border: '1px solid #bae6fd'
        }}>
          <UserCircle size={22} color="#0284c7" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
            Welcome, <span style={{ color: '#0284c7' }}>{user?.name || 'User'}</span>
          </span>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 600,
            color: '#0284c7',
            backgroundColor: '#e0f2fe',
            border: '1px solid #bae6fd',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#bae6fd'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
