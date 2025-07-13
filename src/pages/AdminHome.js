import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminHome = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [examSchedules, setExamSchedules] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchClasses();
      fetchUsers();
      fetchTests();
      fetchResults();
      fetchExamSchedules();
    }
  }, [user]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load classes.');
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users.');
    }
    setLoading(false);
  };

  const fetchTests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/tests/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTests(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tests.');
    }
    setLoading(false);
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/results', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load results.');
    }
    setLoading(false);
  };

  const fetchExamSchedules = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/exams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExamSchedules(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load exam schedules.');
    }
    setLoading(false);
  };

  if (!user || user.role !== 'admin') {
    return (
      <p style={{ padding: '20px', color: '#FFFFFF', backgroundColor: '#4B5320', textAlign: 'center', fontFamily: 'sans-serif', fontSize: '16px' }}>
        Access Restricted: Admins Only
      </p>
    );
  }
  if (loading) return (
    <p style={{ padding: '20px', color: '#FFFFFF', backgroundColor: '#4B5320', textAlign: 'center', fontFamily: 'sans-serif', fontSize: '16px' }}>
      Loading Dashboard...
    </p>
  );

  return (
    <div>
      {error && (
        <p style={{ backgroundColor: '#FFF3F3', color: '#B22222', borderLeft: '4px solid #B22222', padding: '15px', marginBottom: '20px', fontFamily: 'sans-serif', borderRadius: '4px', fontSize: '14px' }}>
          Error: {error}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div style={{ backgroundColor: '#4B5320', color: '#FFFFFF', padding: '30px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', border: '1px solid #000000' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'sans-serif', marginBottom: '10px', color: '#FFFFFF' }}>
            Welcome to Your Admin Dashboard
          </h2>
          <p style={{ fontSize: '16px', fontFamily: 'sans-serif', color: '#D4A017' }}>
            Streamline your academic management with powerful tools to oversee classes, exams, results, and more at Sanniville Academy.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#4B5320', fontFamily: 'sans-serif' }}>Total Classes</h3>
            <p style={{ fontSize: '24px', color: '#D4A017', fontFamily: 'sans-serif', margin: '10px 0' }}>{classes.length}</p>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#4B5320', fontFamily: 'sans-serif' }}>Total Students</h3>
            <p style={{ fontSize: '24px', color: '#D4A017', fontFamily: 'sans-serif', margin: '10px 0' }}>{users.filter(u => u.role === 'student').length}</p>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#4B5320', fontFamily: 'sans-serif' }}>Total Tests</h3>
            <p style={{ fontSize: '24px', color: '#D4A017', fontFamily: 'sans-serif', margin: '10px 0' }}>{tests.length}</p>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', textAlign: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#4B5320', fontFamily: 'sans-serif' }}>Upcoming Exams</h3>
            <p style={{ fontSize: '24px', color: '#D4A017', fontFamily: 'sans-serif', margin: '10px 0' }}>{examSchedules.length}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {[
            { title: 'User Management', desc: 'Manage teacher and student accounts.', action: '/admin/users', icon: '👥' },
            { title: 'View Results', desc: 'Review and update student exam results.', action: '/admin/results', icon: '📊' },
            { title: 'View Analytics', desc: 'Access performance analytics.', action: '/admin/analytics', icon: '🔍' },
            { title: 'Exam Scheduling', desc: 'Plan and manage upcoming exams.', action: '/admin/exams', icon: '📅' },
          ].map((item, index) => (
            <div 
              key={index} 
              style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0', transition: 'transform 0.2s' }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '28px', marginRight: '15px', color: '#4B5320' }}>{item.icon}</span>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#4B5320', fontFamily: 'sans-serif', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ color: '#000000', fontSize: '14px', fontFamily: 'sans-serif', marginBottom: '15px' }}>{item.desc}</p>
                  <button 
                    onClick={() => navigate(item.action)}
                    style={{ padding: '8px 16px', backgroundColor: '#D4A017', color: '#000000', border: '1px solid #000000', borderRadius: '6px', fontFamily: 'sans-serif', fontSize: '14px', cursor: 'pointer' }}
                  >
                    Go to {item.title}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif', backgroundColor: '#4B5320', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
            Recent Academic Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {results.slice(0, 5).map((result) => (
              <div key={result._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#F5F5F5', borderRadius: '4px', border: '1px solid #E0E0E0' }}>
                <span style={{ fontSize: '14px', color: '#000000', fontFamily: 'sans-serif' }}>
                  {result.userId ? `${result.userId.name} ${result.userId.surname}` : 'Unknown Student'} scored {result.score}% in {result.subject} ({result.testId.title})
                </span>
                <button 
                  onClick={() => result.testId?._id && navigate(`/results/${result.testId._id}`)} 
                  style={{ color: '#000000', backgroundColor: '#D4A017', fontFamily: 'sans-serif', fontSize: '12px', padding: '5px 10px', border: '1px solid #000000', borderRadius: '4px', cursor: 'pointer' }}
                >
                  View Full Results
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;