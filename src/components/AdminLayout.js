// src/components/AdminLayout.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const tabs = ['dashboard', 'classes', 'subjects', 'users', 'tests', 'results', 'session', 'exams', 'exports', 'analytics'];

  if (!user || user.role !== 'admin') {
    return (
      <p style={{ padding: '20px', color: '#FFFFFF', backgroundColor: '#4B5320', textAlign: 'center', fontFamily: 'sans-serif', fontSize: '16px' }}>
        Access Restricted: Admins Only
      </p>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '20px' }}>
      <header style={{ backgroundColor: '#4B5320', color: '#FFFFFF', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img src="/images/sanni.png" alt="Sanniville Academy" style={{ height: '60px', border: '3px solid #D4A017', padding: '5px', backgroundColor: '#FFFFFF', borderRadius: '8px' }} />
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'sans-serif', color: '#FFFFFF' }}>
                Sanniville Academy
                <span style={{ display: 'block', fontSize: '16px', color: '#D4A017', fontFamily: 'sans-serif' }}>Empowering Education Through Seamless Administration</span>
              </h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '16px', color: '#FFFFFF', fontFamily: 'sans-serif' }}>Welcome, {user.name}</span>
            <button
              onClick={logout}
              style={{
                padding: '10px 20px',
                backgroundColor: '#D4A017',
                color: '#000000',
                border: '1px solid #000000',
                borderRadius: '6px',
                fontFamily: 'sans-serif',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s, color 0.2s',
              }}
              onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
              onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <nav style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '15px', backgroundColor: '#FFFFFF', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0' }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => navigate(`/admin/${t === 'dashboard' ? '' : t}`)}
            style={{
              padding: '10px 20px',
              backgroundColor: window.location.pathname === `/admin/${t === 'dashboard' ? '' : t}` ? '#D4A017' : '#4B5320',
              color: window.location.pathname === `/admin/${t === 'dashboard' ? '' : t}` ? '#000000' : '#FFFFFF',
              border: '1px solid #000000',
              borderRadius: '6px',
              fontFamily: 'sans-serif',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background-color 0.2s, color 0.2s',
            }}
            onMouseOver={e => e.target.style.backgroundColor = window.location.pathname === `/admin/${t === 'dashboard' ? '' : t}` ? '#FFFFFF' : '#5A6B2A'}
            onMouseOut={e => e.target.style.backgroundColor = window.location.pathname === `/admin/${t === 'dashboard' ? '' : t}` ? '#D4A017' : '#4B5320'}
          >
            {t === 'dashboard' ? 'Home' :
             t === 'classes' ? 'Manage Classes' :
             t === 'subjects' ? 'Manage Subjects' :
             t === 'users' ? 'Manage Users' :
             t === 'tests' ? 'Tests & Exams' :
             t === 'results' ? 'View Results' :
             t === 'session' ? 'Session Results' :
             t === 'exams' ? 'Exam Schedules' :
             t === 'exports' ? 'Data Exports' :
             t === 'analytics' ? 'View Analytics' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px' }}>
        {children}
      </main>

      <footer style={{ backgroundColor: '#4B5320', color: '#FFFFFF', padding: '20px', marginTop: '40px', textAlign: 'center', borderTop: '1px solid #000000' }}>
        <p style={{ fontSize: '14px', fontFamily: 'sans-serif', color: '#FFFFFF' }}>
          © {new Date().getFullYear()} Sanniville Academy. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AdminLayout;