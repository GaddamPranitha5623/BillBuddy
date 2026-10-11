import React from 'react';
import { User, Mail, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userName = user?.name || 'User';
  const userEmail = user?.email || 'Not available';

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 71px)',
        backgroundColor: '#f8fafc',
        padding: '32px'
      }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1
          style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 700,
            color: '#0f172a'
          }}
        >
          My Profile
        </h1>

        <p
          style={{
            marginTop: '8px',
            marginBottom: 0,
            color: '#64748b',
            fontSize: '14px'
          }}
        >
          Manage your BillBuddy account information
        </p>
      </div>

      {/* Main Profile Card */}
      <div
        style={{
          maxWidth: '850px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(15, 23, 42, 0.05)'
        }}
      >
        {/* Profile Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #e0f2fe, #f0f9ff)',
            padding: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '22px',
            borderBottom: '1px solid #bae6fd'
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '82px',
              height: '82px',
              borderRadius: '50%',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 700,
                color: '#0f172a'
              }}
            >
              {userName}
            </h2>

            <p
              style={{
                margin: '6px 0 0',
                color: '#475569',
                fontSize: '14px'
              }}
            >
              BillBuddy User
            </p>
          </div>
        </div>

        {/* Account Information */}
        <div style={{ padding: '30px 32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '22px'
            }}
          >
            <ShieldCheck size={20} color="#0284c7" />

            <h3
              style={{
                margin: 0,
                fontSize: '17px',
                fontWeight: 650,
                color: '#0f172a'
              }}
            >
              Account Information
            </h3>
          </div>

          {/* Name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '18px 0',
              borderBottom: '1px solid #f1f5f9'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={20} color="#0284c7" />
            </div>

            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#94a3b8',
                  fontWeight: 600
                }}
              >
                FULL NAME
              </p>

              <p
                style={{
                  margin: '5px 0 0',
                  fontSize: '15px',
                  color: '#334155',
                  fontWeight: 600
                }}
              >
                {userName}
              </p>
            </div>
          </div>

          {/* Email */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '18px 0'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Mail size={20} color="#0284c7" />
            </div>

            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#94a3b8',
                  fontWeight: 600
                }}
              >
                EMAIL ADDRESS
              </p>

              <p
                style={{
                  margin: '5px 0 0',
                  fontSize: '15px',
                  color: '#334155',
                  fontWeight: 600
                }}
              >
                {userEmail}
              </p>
            </div>
          </div>

          {/* Logout */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '22px',
              borderTop: '1px solid #e2e8f0'
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '9px',
                width: '100%',
                padding: '12px 18px',
                borderRadius: '10px',
                border: '1px solid #fecaca',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;