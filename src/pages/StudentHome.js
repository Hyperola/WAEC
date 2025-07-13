import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { FiHome, FiBook, FiUser, FiLogOut } from 'react-icons/fi';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import Tests from './Tests';
import Profile from './Profile';

const StudentHome = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!user || user.role !== 'student') {
    return (
      <div style={{
        padding: '20px',
        color: '#FFFFFF',
        backgroundColor: '#4B5320',
        textAlign: 'center',
        fontSize: '16px',
        minHeight: '100vh',
        fontFamily: 'sans-serif'
      }}>
        <p>Access Restricted: Students Only</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        color: '#FFFFFF',
        backgroundColor: '#4B5320',
        textAlign: 'center',
        fontSize: '16px',
        minHeight: '100vh',
        fontFamily: 'sans-serif'
      }}>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  const navItems = [
    { path: 'dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: 'tests', icon: <FiBook />, label: 'Tests' },
    { path: 'profile', icon: <FiUser />, label: 'Profile' },
  ];

  const handleNavigation = (path) => {
    navigate(`/student/${path}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div style={{
      fontFamily: 'sans-serif',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {error && (
        <div style={{
          backgroundColor: '#FFF3F3',
          color: '#B22222',
          borderLeft: '4px solid #B22222',
          padding: '15px',
          margin: '20px 30px',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <p>Error: {error}</p>
        </div>
      )}
      <Header user={user} onLogout={handleLogout} />
      <div style={{
        display: 'flex',
        marginTop: '60px',
        minHeight: 'calc(100vh - 60px)'
      }}>
        <Sidebar navItems={navItems} location={location} onNavigate={handleNavigation} />
        <main style={{
          flex: 1,
          marginLeft: '250px',
          padding: '30px',
          backgroundColor: '#F8F9FA',
          overflowY: 'auto',
          minHeight: 'calc(100vh - 60px)'
        }}>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tests" element={<Tests />} />
            <Route path="profile" element={<Profile />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default StudentHome;