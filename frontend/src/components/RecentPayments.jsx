import React from 'react';
import { CheckCircle, ArrowUpRight } from 'lucide-react';

const RecentPayments = ({ recentPayments = [] }) => {
  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amt);
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 24,
      border: '1px solid #bae6fd',
      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.04)',
      marginBottom: 28
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Recent Payments</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>History of completed bill settlements</p>
        </div>
        <button
          onClick={() => alert('Opening full payment history...')}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#0284c7',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <span>View All</span>
          <ArrowUpRight size={16} />
        </button>
      </div>

      {recentPayments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontSize: 14 }}>
          No payment history recorded yet.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 14px' }}>Bill Name</th>
                <th style={{ padding: '12px 14px' }}>Amount</th>
                <th style={{ padding: '12px 14px' }}>Payment Date</th>
                <th style={{ padding: '12px 14px' }}>Method</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((item) => (
                <tr key={item.payment_id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 14, color: '#0f172a' }}>
                  <td style={{ padding: '14px', fontWeight: 600 }}>{item.title}</td>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#166534' }}>
                    {formatCurrency(item.amount)}
                  </td>
                  <td style={{ padding: '14px', color: '#64748b', fontSize: 13 }}>
                    {item.payment_date?.split(' ')[0] || item.payment_date}
                  </td>
                  <td style={{ padding: '14px', color: '#64748b', fontSize: 13 }}>
                    {item.payment_method || 'UPI'}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: '#f0fdf4',
                      color: '#166534',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      border: '1px solid #bbf7d0'
                    }}>
                      <CheckCircle size={12} />
                      {item.status || 'Completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentPayments;
