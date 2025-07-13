import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Dashboard from '../components/teacher/Dashboard';
import AddQuestion from '../components/teacher/AddQuestion';
import BulkImport from '../components/teacher/BulkImport';
import ManageQuestions from '../components/teacher/ManageQuestions';
import ManageTests from '../components/teacher/ManageTests';
import Results from '../components/teacher/Results';
import Analytics from '../components/teacher/Analytics';
import TestCreation from '../pages/TestCreation';
import { FiHome, FiPlusSquare, FiUpload, FiEdit, FiBook, FiBarChart2, FiAward, FiLogOut, FiUser } from 'react-icons/fi';

const TeacherHome = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!user || user.role !== 'teacher') {
    return (
      <p style={{ padding: '20px', color: '#FFFFFF', backgroundColor: '#4B5320', textAlign: 'center', fontFamily: 'sans-serif', fontSize: '16px' }}>
        Access Restricted: Teachers Only
      </p>
    );
  }

  if (loading) return (
    <p style={{ padding: '20px', color: '#FFFFFF', backgroundColor: '#4B5320', textAlign: 'center', fontFamily: 'sans-serif', fontSize: '16px' }}>
      Loading Dashboard...
    </p>
  );

  // Navigation items with relative paths
  const navItems = [
    { path: 'dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: 'test-creation', icon: <FiPlusSquare />, label: 'Create New Test' },
    { path: 'add-question', icon: <FiPlusSquare />, label: 'Add Question' },
    { path: 'bulk-import', icon: <FiUpload />, label: 'Bulk Import' },
    { path: 'questions', icon: <FiEdit />, label: 'Manage Questions' },
    { path: 'tests', icon: <FiBook />, label: 'Manage Tests' },
    { path: 'results', icon: <FiAward />, label: 'Student Results' },
    { path: 'analytics', icon: <FiBarChart2 />, label: 'Analytics' },
  ];

  const handleNavigation = (path) => {
    console.log(`Navigating to: /teacher/${path}`);
    navigate(`/teacher/${path}`);
  };

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {error && (
        <p style={{ 
          backgroundColor: '#FFF3F3', 
          color: '#B22222', 
          borderLeft: '4px solid #B22222', 
          padding: '15px', 
          marginBottom: '20px', 
          borderRadius: '4px', 
          fontSize: '14px' 
        }}>
          Error: {error}
        </p>
      )}

      {/* Header */}
      <div style={{ 
        backgroundColor: '#4B5320', 
        color: '#FFFFFF', 
        padding: '15px 30px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        borderBottom: '1px solid #000000'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img 
            src="/images/sanni.png" 
            alt="Sanniville Academy" 
            style={{ height: '40px' }} 
          />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Teacher Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FiUser /> {user.name}
          </span>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              navigate('/login');
            }}
            style={{
              backgroundColor: '#D4A017',
              color: '#000000',
              border: '1px solid #000000',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        {/* Sidebar */}
        <div style={{ 
          width: '250px', 
          backgroundColor: '#FFFFFF', 
          padding: '20px 0',
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
          borderRight: '1px solid #E0E0E0'
        }}>
          <nav>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {navItems.map((item) => (
                <li key={item.path} style={{ marginBottom: '5px' }}>
                  <button 
                    onClick={() => handleNavigation(item.path)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 20px',
                      backgroundColor: location.pathname === `/teacher/${item.path}` ? '#D4A017' : 'transparent',
                      color: location.pathname === `/teacher/${item.path}` ? '#000000' : '#4B5320',
                      border: 'none',
                      borderRadius: '0',
                      cursor: 'pointer',
                      fontWeight: location.pathname === `/teacher/${item.path}` ? 'bold' : 'normal',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.2s',
                      borderLeft: location.pathname === `/teacher/${item.path}` ? '4px solid #4B5320' : '4px solid transparent'
                    }}
                    onMouseOver={e => {
                      if (location.pathname !== `/teacher/${item.path}`) {
                        e.currentTarget.style.backgroundColor = '#F5F5F5';
                      }
                    }}
                    onMouseOut={e => {
                      if (location.pathname !== `/teacher/${item.path}`) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <main style={{ 
          flex: 1, 
          padding: '30px',
          backgroundColor: '#F8F9FA'
        }}>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="test-creation" element={<TestCreation />} />
            <Route path="add-question" element={<AddQuestion />} />
            <Route path="bulk-import" element={<BulkImport />} />
            <Route path="questions" element={<ManageQuestions />} />
            <Route path="tests" element={<ManageTests />} />
            <Route path="results" element={<Results />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default TeacherHome;