import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TestCreation = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { testId } = useParams();
  const [testForm, setTestForm] = useState({
    title: '',
    subject: '',
    class: '',
    session: '',
    startDate: '',
    endDate: '',
    duration: '',
    questionCount: '',
    randomize: false,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (testId) {
      const fetchTest = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No authentication token found.');
          const res = await axios.get(`http://localhost:5000/api/tests/${testId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Fetched test for edit:', res.data);
          setTestForm({
            title: res.data.title,
            subject: res.data.subject,
            class: res.data.class,
            session: res.data.session,
            startDate: res.data.startDate.slice(0, 16),
            endDate: res.data.endDate.slice(0, 16),
            duration: res.data.duration,
            questionCount: res.data.questionCount,
            randomize: res.data.randomize,
          });
          setError(null);
        } catch (err) {
          console.error('Fetch test error:', err.response?.data || err.message);
          setError(err.response?.data?.error || 'Failed to load test. Please try again.');
        }
        setLoading(false);
      };
      fetchTest();
    }
  }, [testId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!testForm.title || !testForm.subject || !testForm.class || !testForm.session || !testForm.startDate || !testForm.endDate || !testForm.duration || !testForm.questionCount) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');
      const payload = {
        ...testForm,
        startDate: new Date(testForm.startDate).toISOString(),
        endDate: new Date(testForm.endDate).toISOString(),
      };
      let res;
      if (testId) {
        res = await axios.put(`http://localhost:5000/api/tests/${testId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Test updated:', res.data);
        setSuccess('Test updated successfully.');
      } else {
        res = await axios.post('http://localhost:5000/api/tests', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Test created:', res.data);
        setSuccess('Test created successfully.');
      }
      navigate('/teacher');
    } catch (err) {
      console.error('Test submit error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to save test. Please try again.');
      }
    }
    setLoading(false);
  };

  if (!user || user.role !== 'teacher') return <p style={{ padding: '20px', color: 'red' }}>Access restricted to teachers.</p>;
  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>{testId ? 'Edit Test' : 'Create Test'}</h2>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        <input
          type="text"
          placeholder="Test Title"
          value={testForm.title}
          onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
          required
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <select
          value={testForm.subject}
          onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })}
          required
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">Select Subject</option>
          {(user.subjects || []).map(sub => (
            <option key={sub._id} value={sub.subject}>{sub.subject}</option>
          ))}
        </select>
        <select
          value={testForm.class}
          onChange={(e) => setTestForm({ ...testForm, class: e.target.value })}
          required
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">Select Class</option>
          {(user.subjects || []).map(sub => (
            <option key={sub._id} value={sub.class}>{sub.class}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Session (e.g., 2023/2024)"
          value={testForm.session}
          onChange={(e) => setTestForm({ ...testForm, session: e.target.value })}
          required
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="datetime-local"
          value={testForm.startDate}
          onChange={(e) => setTestForm({ ...testForm, startDate: e.target.value })}
          required
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="datetime-local"
          value={testForm.endDate}
          onChange={(e) => setTestForm({ ...testForm, endDate: e.target.value })}
          required
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="number"
          placeholder="Duration (minutes)"
          value={testForm.duration}
          onChange={(e) => setTestForm({ ...testForm, duration: e.target.value })}
          required
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="number"
          placeholder="Number of Questions"
          value={testForm.questionCount}
          onChange={(e) => setTestForm({ ...testForm, questionCount: e.target.value })}
          required
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={testForm.randomize}
            onChange={(e) => setTestForm({ ...testForm, randomize: e.target.checked })}
          />
          Randomize Questions
        </label>
        <button type="submit" disabled={loading} style={{ padding: '8px', background: loading ? '#ccc' : '#4bc0c0', color: 'white', border: 'none', borderRadius: '4px' }}>
          {testId ? 'Update Test' : 'Create Test'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/teacher')}
          style={{ padding: '8px', background: '#ccc', color: 'black', border: 'none', borderRadius: '4px', marginTop: '10px' }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default TestCreation;