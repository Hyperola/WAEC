import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AnalyticsPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load analytics.');
        setLoading(false);
      }
    };

    if (user && (user.role === 'teacher' || user.role === 'admin')) {
      fetchAnalytics();
    } else {
      setError('Access restricted to teachers and admins.');
      setLoading(false);
    }
  }, [user]);

  if (loading) return <p style={{ padding: '20px', color: '#D4A017', backgroundColor: '#4B5320', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading...</p>;
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) return <p style={{ padding: '20px', color: '#D4A017', backgroundColor: '#4B5320', textAlign: 'center', fontFamily: 'sans-serif' }}>Access restricted to teachers and admins.</p>;
  if (error) return <p style={{ backgroundColor: '#FFE6E6', color: '#B22222', borderLeft: '4px solid #B22222', padding: '10px', margin: '20px', fontFamily: 'sans-serif' }}>Error: {error}</p>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F5', padding: '20px' }}>
      <header style={{ backgroundColor: '#4B5320', color: '#D4A017', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img 
              src="/images/sanni.png" 
              alt="Sanniville Academy" 
              style={{ height: '48px', border: '2px solid #D4A017', padding: '4px', backgroundColor: '#FFFFFF', borderRadius: '4px' }}
            />
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>Sanniville Academy</h1>
              <span style={{ fontSize: '14px', fontFamily: 'sans-serif', color: '#F0E68C' }}>Test Analytics</span>
            </div>
          </div>
          <button 
            onClick={() => navigate(user.role === 'admin' ? '/admin' : '/teacher')} 
            style={{ padding: '8px 16px', backgroundColor: '#D4A017', color: '#4B5320', border: 'none', borderRadius: '4px', fontFamily: 'sans-serif', fontSize: '14px', cursor: 'pointer' }}
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#4B5320', fontFamily: 'sans-serif', marginBottom: '20px' }}>Test Analytics</h2>
        {analytics.length === 0 ? (
          <p style={{ color: '#4B5320', fontFamily: 'sans-serif' }}>No analytics available.</p>
        ) : (
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #D3D3D3' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #D3D3D3' }}>
              <thead>
                <tr style={{ backgroundColor: '#4B5320', color: '#D4A017', fontFamily: 'sans-serif', fontSize: '14px' }}>
                  <th style={{ border: '1px solid #D3D3D3', padding: '8px' }}>Test Title</th>
                  <th style={{ border: '1px solid #D3D3D3', padding: '8px' }}>Subject</th>
                  <th style={{ border: '1px solid #D3D3D3', padding: '8px' }}>Class</th>
                  <th style={{ border: '1px solid #D3D3D3', padding: '8px' }}>Average Score</th>
                  <th style={{ border: '1px solid #D3D3D3', padding: '8px' }}>Completion Rate</th>
                  <th style={{ border: '1px solid #D3D3D3', padding: '8px' }}>Top Student</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((data) => (
                  <tr key={data.testId} style={{ color: '#333', fontFamily: 'sans-serif', fontSize: '14px' }}>
                    <td style={{ border: '1px solid #D3D3D3', padding: '8px' }}>{data.testTitle}</td>
                    <td style={{ border: '1px solid #D3D3D3', padding: '8px' }}>{data.subject}</td>
                    <td style={{ border: '1px solid #D3D3D3', padding: '8px' }}>{data.class}</td>
                    <td style={{ border: '1px solid #D3D3D3', padding: '8px' }}>{data.averageScore}%</td>
                    <td style={{ border: '1px solid #D3D3D3', padding: '8px' }}>{data.completionRate}%</td>
                    <td style={{ border: '1px solid #D3D3D3', padding: '8px' }}>{data.topStudent || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;