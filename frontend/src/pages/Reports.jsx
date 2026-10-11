import React, { useEffect, useState } from 'react';
import { fetchBillsApi } from '../services/api';

const Reports = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const response = await fetchBillsApi();
      setBills(response.data.bills || []);
    } catch (error) {
      console.error('Failed to load bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const paidBills = bills.filter(
    (bill) => bill.status === 'Paid'
  );

  const pendingBills = bills.filter(
    (bill) => bill.status !== 'Paid'
  );

  const totalSpending = paidBills.reduce(
    (total, bill) => total + Number(bill.amount || 0),
    0
  );

  const pendingAmount = pendingBills.reduce(
    (total, bill) => total + Number(bill.amount || 0),
    0
  );

  const categorySpending = {};

  paidBills.forEach((bill) => {
    const category = bill.category || 'Other';

    if (!categorySpending[category]) {
      categorySpending[category] = 0;
    }

    categorySpending[category] += Number(bill.amount || 0);
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <h2>Reports & Analytics</h2>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Reports & Analytics</h1>
        <p style={styles.subtitle}>
          Track your bill spending and payment summary
        </p>
      </div>

      {/* Summary Cards */}
      <div style={styles.cards}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Spending</p>
          <h2 style={styles.greenAmount}>
            ₹{totalSpending.toLocaleString('en-IN')}
          </h2>
          <p style={styles.cardText}>Paid bills</p>
        </div>

        <div style={styles.card}>
          <p style={styles.cardLabel}>Paid Bills</p>
          <h2 style={styles.blueAmount}>
            {paidBills.length}
          </h2>
          <p style={styles.cardText}>Completed payments</p>
        </div>

        <div style={styles.card}>
          <p style={styles.cardLabel}>Pending Bills</p>
          <h2 style={styles.orangeAmount}>
            {pendingBills.length}
          </h2>
          <p style={styles.cardText}>Bills remaining</p>
        </div>

        <div style={styles.card}>
          <p style={styles.cardLabel}>Pending Amount</p>
          <h2 style={styles.redAmount}>
            ₹{pendingAmount.toLocaleString('en-IN')}
          </h2>
          <p style={styles.cardText}>Amount to be paid</p>
        </div>
      </div>

      {/* Category Spending */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          Category-wise Spending
        </h2>

        {Object.keys(categorySpending).length === 0 ? (
          <p style={styles.noData}>
            No paid bills available for category analysis.
          </p>
        ) : (
          <div style={styles.categoryGrid}>
            {Object.entries(categorySpending).map(
              ([category, amount]) => (
                <div style={styles.categoryCard} key={category}>
                  <p style={styles.categoryName}>{category}</p>
                  <h3 style={styles.categoryAmount}>
                    ₹{amount.toLocaleString('en-IN')}
                  </h3>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Bill Status */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          Bill Status Summary
        </h2>

        <div style={styles.statusBox}>
          <div>
            <strong>Paid Bills</strong>
            <p>{paidBills.length} bills completed</p>
          </div>

          <div>
            <strong>Pending Bills</strong>
            <p>{pendingBills.length} bills remaining</p>
          </div>

          <div>
            <strong>Total Bills</strong>
            <p>{bills.length} bills recorded</p>
          </div>
        </div>
      </div>
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

  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '18px',
    marginBottom: '25px',
  },

  card: {
    backgroundColor: '#ffffff',
    padding: '22px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.06)',
  },

  cardLabel: {
    margin: 0,
    color: '#64748b',
    fontSize: '14px',
  },

  greenAmount: {
    color: '#16a34a',
    margin: '10px 0 5px',
  },

  blueAmount: {
    color: '#0284c7',
    margin: '10px 0 5px',
  },

  orangeAmount: {
    color: '#ea580c',
    margin: '10px 0 5px',
  },

  redAmount: {
    color: '#dc2626',
    margin: '10px 0 5px',
  },

  cardText: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '13px',
  },

  section: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '25px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.06)',
  },

  sectionTitle: {
    marginTop: 0,
    color: '#14213d',
    fontSize: '20px',
  },

  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
  },

  categoryCard: {
    padding: '18px',
    backgroundColor: '#f0f9ff',
    borderRadius: '10px',
    border: '1px solid #e0f2fe',
  },

  categoryName: {
    margin: 0,
    color: '#64748b',
    fontSize: '14px',
  },

  categoryAmount: {
    margin: '8px 0 0',
    color: '#0284c7',
    fontSize: '20px',
  },

  statusBox: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },

  noData: {
    color: '#64748b',
  },
};

export default Reports;