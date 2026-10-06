import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, List, CreditCard } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 14,
      padding: '18px 24px',
      border: '1px solid #bae6fd',
      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.04)',
      marginBottom: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 16
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Quick Actions</h3>
        <span style={{ fontSize: 13, color: '#64748b' }}>Shortcut tools for fast management</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/add-bill')}
          style={{
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: '#0284c7',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#0369a1'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#0284c7'; }}
        >
          <Plus size={18} />
          <span>+ Add New Bill</span>
        </button>

        <button
          onClick={() => navigate('/bills')}
          style={{
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 600,
            color: '#0284c7',
            backgroundColor: '#e0f2fe',
            border: '1px solid #bae6fd',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#bae6fd'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
        >
          <List size={18} />
          <span>View All Bills</span>
        </button>

        <button
          onClick={() => navigate('/bills')}
          style={{
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 600,
            color: '#0f172a',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
        >
          <CreditCard size={18} />
          <span>Make Payment</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
