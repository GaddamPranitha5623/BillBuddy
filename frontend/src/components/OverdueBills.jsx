import React from 'react';
import { AlertCircle, CreditCard, Calendar } from 'lucide-react';

const OverdueBills = ({ overdueBills = [] }) => {
  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amt);
  };

  if (!overdueBills || overdueBills.length === 0) {
    return null; // Don't render banner if no overdue bills exist
  }

  return (
    <div style={{
      backgroundColor: '#fff5f5',
      borderRadius: 16,
      padding: 24,
      border: '1px solid #fecaca',
      boxShadow: '0 4px 14px rgba(220, 38, 38, 0.05)',
      marginBottom: 28
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 36,
          height: 36,
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertCircle size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#991b1b' }}>Overdue Bills Action Required</h3>
          <p style={{ fontSize: 13, color: '#7f1d1d' }}>Please clear these past due payments to avoid penalty fees</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {overdueBills.map((bill) => (
          <div
            key={bill.bill_id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 18,
              border: '1px solid #fca5a5',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{bill.title}</h4>
                <span style={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  padding: '3px 8px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                  border: '1px solid #fecaca'
                }}>
                  OVERDUE
                </span>
              </div>
              <span style={{ fontSize: 12, color: '#64748b' }}>Category: {bill.category}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#dc2626' }}>
                {formatCurrency(bill.amount)}
              </div>
              <div style={{ fontSize: 12, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={13} />
                <span>Due: {bill.due_date}</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Processing urgent payment for ${bill.title} (${formatCurrency(bill.amount)})...`)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: 13,
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#dc2626',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#b91c1c'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; }}
            >
              <CreditCard size={16} />
              <span>Pay Now</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverdueBills;
