import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import SummaryCards from '../components/SummaryCards';
import QuickActions from '../components/QuickActions';
import OverdueBills from '../components/OverdueBills';
import UpcomingPayments from '../components/UpcomingPayments';
import SpendingCharts from '../components/SpendingCharts';
import RecentPayments from '../components/RecentPayments';
import { fetchDashboardDataApi } from '../services/api';
import { RefreshCw, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchDashboardDataApi();
      console.log("MONTHLY DATA:", response.data.monthly_spending);
      setData(response.data);
    } catch (err) {
      console.error("Dashboard data fetch failed:", err);
      setError(err.response?.data?.error || "Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Header />

      {/* Main Content Layout with Sidebar */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Sidebar */}
        <Sidebar activeItem="Dashboard" />

        {/* Dashboard Main View Area */}
        <main style={{ flex: 1, padding: '32px 36px', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
          
          {/* Dashboard Title & Subtitle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Dashboard
              </h2>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                Manage your bills, subscriptions and payments in one place.
              </p>
            </div>

            <button
              onClick={loadDashboardData}
              disabled={loading}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                color: '#0284c7',
                backgroundColor: '#ffffff',
                border: '1px solid #bae6fd',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.05)'
              }}
            >
              <RefreshCw size={14} className={loading ? 'spinner' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 24 }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Loading Indicator State */}
          {loading && !data ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#0284c7' }}>
              <div className="spinner" style={{ width: 36, height: 36, borderColor: 'rgba(2, 132, 199, 0.2)', borderTopColor: '#0284c7', margin: '0 auto 16px' }}></div>
              <p style={{ fontSize: 14, fontWeight: 500 }}>Loading your personalized financial dashboard...</p>
            </div>
          ) : (
            <>
              {/* 1. Metric Summary Cards */}
              <SummaryCards summary={data?.summary} />

              {/* 2. Quick Actions */}
              <QuickActions />

              {/* 3. Overdue Bills (Renders conditionally if overdue bills exist) */}
              <OverdueBills overdueBills={data?.overdue_bills} />

              {/* 4. Upcoming Payments Table */}
              <UpcomingPayments upcomingBills={data?.upcoming_bills} />

              {/* 5. Monthly & Category Spending Charts */}
              <SpendingCharts
                monthlyData={data?.monthly_spending}
                categoryData={data?.category_spending}
              />

              {/* 6. Recent Payments Table */}
              <RecentPayments recentPayments={data?.recent_payments} />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
