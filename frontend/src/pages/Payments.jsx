import React, { useEffect, useState } from 'react';
import { fetchPaymentsApi } from '../services/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await fetchPaymentsApi();
      setPayments(response.data.payments || []);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError('Unable to load payment history.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h2>Payment History</h2>
        <p>Loading payments...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Payment History</h1>
          <p style={styles.subtitle}>
            View all your completed bill payments
          </p>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {!error && payments.length === 0 ? (
        <div style={styles.empty}>
          <h3>No payments yet</h3>
          <p>
            Payments will appear here when you mark a bill as paid.
          </p>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Bill Name</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Payment Date</th>
                  <th style={styles.th}>Payment Method</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.payment_id}>
                    <td style={styles.td}>
                      <strong>{payment.title}</strong>
                    </td>

                    <td style={styles.amount}>
                      ₹{Number(payment.amount).toLocaleString('en-IN')}
                    </td>

                    <td style={styles.td}>
                      {payment.payment_date
                        ? new Date(payment.payment_date).toLocaleDateString(
                            'en-IN'
                          )
                        : '-'}
                    </td>

                    <td style={styles.td}>
                      {payment.payment_method || 'UPI'}
                    </td>

                    <td style={styles.td}>
                      <span style={styles.status}>
                        {payment.status || 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '30px',
    backgroundColor: '#f8fbff',
    minHeight: '100%',
  },

  header: {
    marginBottom: '25px',
  },

  title: {
    margin: 0,
    color: '#14213d',
    fontSize: '28px',
  },

  subtitle: {
    color: '#64748b',
    marginTop: '8px',
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.06)',
    overflowX: 'auto',
  },

  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '750px',
  },

  th: {
    textAlign: 'left',
    padding: '14px',
    backgroundColor: '#eaf6ff',
    color: '#14213d',
    fontWeight: '600',
    borderBottom: '1px solid #dbeafe',
  },

  td: {
    padding: '16px 14px',
    borderBottom: '1px solid #e5e7eb',
    color: '#334155',
  },

  amount: {
    padding: '16px 14px',
    borderBottom: '1px solid #e5e7eb',
    color: '#0284c7',
    fontWeight: '600',
  },

  status: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    fontSize: '13px',
    fontWeight: '600',
  },

  empty: {
    backgroundColor: '#ffffff',
    padding: '50px',
    textAlign: 'center',
    borderRadius: '12px',
    color: '#64748b',
  },

  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
};

export default Payments;