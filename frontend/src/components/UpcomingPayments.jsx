import React from 'react';
import { Calendar, Tag, CreditCard } from 'lucide-react';

const UpcomingPayments = ({ upcomingBills = [] }) => {
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
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Upcoming Payments</h3>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Bills due in the next 15 days</p>
        </div>
        <span style={{
          backgroundColor: '#e0f2fe',
          color: '#0284c7',
          padding: '4px 12px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600
        }}>
          {upcomingBills.length} Pending
        </span>
      </div>

      {upcomingBills.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontSize: 14 }}>
          No upcoming bills due soon. All caught up!
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 14px' }}>Bill Name</th>
                <th style={{ padding: '12px 14px' }}>Category</th>
                <th style={{ padding: '12px 14px' }}>Amount</th>
                <th style={{ padding: '12px 14px' }}>Due Date</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {upcomingBills.map((bill) => (
                <tr key={bill.bill_id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 14, color: '#0f172a' }}>
                  <td style={{ padding: '14px', fontWeight: 600 }}>{bill.title}</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500
                    }}>
                      <Tag size={12} color="#0284c7" />
                      {bill.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#0284c7' }}>
                    {formatCurrency(bill.amount)}
                  </td>
                  <td style={{ padding: '14px', color: '#64748b', fontSize: 13 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={14} color="#94a3b8" />
                      {bill.due_date}
                    </span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      backgroundColor: '#fef3c7',
                      color: '#b45309',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      border: '1px solid #fde68a'
                    }}>
                      Pending
                    </span>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <button
                      onClick={() => alert(`Processing payment for ${bill.title} (${formatCurrency(bill.amount)})...`)}
                      style={{
                        padding: '6px 14px',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#ffffff',
                        backgroundColor: '#0284c7',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 6px rgba(2, 132, 199, 0.2)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#0369a1'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#0284c7'; }}
                    >
                      <CreditCard size={14} />
                      <span>Pay Now</span>
                    </button>
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

export default UpcomingPayments;
