import React from 'react';
import { Receipt, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const SummaryCards = ({ summary }) => {
  const cards = [
    {
      title: 'Total Bills',
      value: summary?.total_bills ?? 0,
      isCurrency: false,
      subtitle: 'Active tracked bills',
      icon: Receipt,
      iconBg: '#e0f2fe',
      iconColor: '#0284c7',
      borderColor: '#bae6fd'
    },
    {
      title: 'Paid',
      value: summary?.paid_amount ?? 0,
      isCurrency: true,
      subtitle: 'Successfully settled',
      icon: CheckCircle2,
      iconBg: '#dcfce7',
      iconColor: '#16a34a',
      borderColor: '#bbf7d0'
    },
    {
      title: 'Pending',
      value: summary?.pending_amount ?? 0,
      isCurrency: true,
      subtitle: 'Upcoming due bills',
      icon: Clock,
      iconBg: '#fef3c7',
      iconColor: '#d97706',
      borderColor: '#fde68a'
    },
    {
      title: 'Overdue',
      value: summary?.overdue_amount ?? 0,
      isCurrency: true,
      subtitle: `${summary?.overdue_count ?? 0} bills past due date`,
      icon: AlertTriangle,
      iconBg: '#fee2e2',
      iconColor: '#dc2626',
      borderColor: '#fecaca'
    }
  ];

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '20px',
      marginBottom: 28
    }}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              padding: '20px 22px',
              border: `1px solid ${card.borderColor}`,
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>{card.title}</span>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0' }}>
                {card.isCurrency ? formatCurrency(card.value) : card.value}
              </h3>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{card.subtitle}</span>
            </div>

            <div style={{
              width: 48,
              height: 48,
              backgroundColor: card.iconBg,
              color: card.iconColor,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
