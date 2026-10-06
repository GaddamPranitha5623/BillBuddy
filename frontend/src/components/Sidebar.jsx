import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  PlusCircle, 
  CreditCard, 
  BarChart3, 
  User, 
  LogOut 
} from 'lucide-react';

const Sidebar = ({ activeItem }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Bills', icon: Receipt, path: '/bills' },
    { name: 'Add Bill', icon: PlusCircle, path: '/add-bill' },
    { name: 'Payments', icon: CreditCard, path: '/payments' },
    { name: 'Reports', icon: BarChart3, path: '/reports' },
    { name: 'Profile', icon: User, path: '/profile' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: 240,
      backgroundColor: '#ffffff',
      borderRight: '1px solid #bae6fd',
      minHeight: 'calc(100vh - 71px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      boxShadow: '2px 0 10px rgba(2, 132, 199, 0.02)'
    }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{
          padding: '0 12px 12px 12px',
          fontSize: 11,
          fontWeight: 700,
          color: '#94a3b8',
          letterSpacing: '0.8px',
          textTransform: 'uppercase'
        }}>
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem ? activeItem === item.name : location.pathname === item.path;

          return (
            <button
              key={item.name}
              onClick={() => {
                if (['/dashboard', '/bills', '/add-bill'].includes(item.path)) {
                  navigate(item.path);
                } else {
                  alert(`${item.name} module will be available in the next feature update!`);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: 'none',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#0284c7' : '#475569',
                backgroundColor: isActive ? '#e0f2fe' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#f0f9ff';
                  e.currentTarget.style.color = '#0284c7';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#475569';
                }
              }}
            >
              <Icon size={18} color={isActive ? '#0284c7' : '#64748b'} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Logout */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid #fee2e2',
            fontSize: 14,
            fontWeight: 600,
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fecaca'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
        >
          <LogOut size={18} color="#dc2626" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
