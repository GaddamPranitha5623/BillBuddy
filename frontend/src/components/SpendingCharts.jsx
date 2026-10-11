import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#0284c7', '#38bdf8', '#0ea5e9', '#2563eb', '#60a5fa', '#818cf8', '#a5b4fc', '#bae6fd'];

const SpendingCharts = ({ monthlyData = [], categoryData = [] }) => {
  const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      gap: 24,
      marginBottom: 28
    }}>
      {/* 1. Monthly Spending Chart */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        border: '1px solid #bae6fd',
        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.04)'
      }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Monthly Spending</h3>
          <p style={{ fontSize: 13, color: '#64748b' }}>12-Month bill expenditure trend</p>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Spending']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: 10, borderColor: '#bae6fd', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorMonthly)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Category-Wise Spending Chart */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        border: '1px solid #bae6fd',
        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.04)'
      }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Category-Wise Spending</h3>
          <p style={{ fontSize: 13, color: '#64748b' }}>Distribution across bill categories</p>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Amount']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: 10, borderColor: '#bae6fd' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: 12, color: '#475569' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SpendingCharts;
