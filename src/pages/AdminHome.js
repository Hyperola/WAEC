import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Chart from 'chart.js/auto';

const AdminHome = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [examSchedules, setExamSchedules] = useState([]);
  const [classForm, setClassForm] = useState({ name: '' });
  const [editClass, setEditClass] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ className: '', subject: '' });
  const [editSubject, setEditSubject] = useState(null);
  const [sessionForm, setSessionForm] = useState({ studentId: '', session: '' });
  const [examForm, setExamForm] = useState({ title: '', subject: '', class: '', date: '', time: '', duration: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const sessions = ['2025/2026 Semester 1', '2025/2026 Semester 2'];

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

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (editClass) {
        await axios.put(`http://localhost:5000/api/classes/${editClass._id}`, classForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Class updated successfully.');
        setEditClass(null);
      } else {
        await axios.post('http://localhost:5000/api/classes', classForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Class created successfully.');
      }
      fetchClasses();
      setClassForm({ name: '' });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process class.');
    }
    setLoading(false);
  };

  const handleClassDelete = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Class deleted successfully.');
      fetchClasses();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete class.');
    }
    setLoading(false);
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (editSubject) {
        await axios.put(`http://localhost:5000/api/classes/subject/${editSubject.classId}`, {
          oldSubject: editSubject.subject,
          newSubject: subjectForm.subject,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Subject updated successfully.');
        setEditSubject(null);
      } else {
        await axios.post('http://localhost:5000/api/classes/subject', subjectForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Subject added successfully.');
      }
      fetchClasses();
      setSubjectForm({ className: '', subject: '' });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process subject.');
    }
    setLoading(false);
  };

  const handleSubjectDelete = async (classId, subject) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/classes/subject/${classId}/${subject}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Subject deleted successfully.');
      fetchClasses();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete subject.');
    }
    setLoading(false);
  };

  const handleTestEdit = async (testId, updatedData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/tests/${testId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Test updated successfully.');
      fetchTests();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update test.');
    }
    setLoading(false);
  };

  const handleResultEdit = async (resultId, updatedData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/results/${resultId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Result updated successfully.');
      fetchResults();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update result.');
    }
    setLoading(false);
  };

  const handleExamScheduleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: examForm.title,
        subject: examForm.subject,
        class: examForm.class,
        date: new Date(`${examForm.date}T${examForm.time}`),
        duration: parseInt(examForm.duration) || 60,
      };
      await axios.post('http://localhost:5000/api/exams', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Exam scheduled successfully.');
      fetchExamSchedules();
      setExamForm({ title: '', subject: '', class: '', date: '', time: '', duration: '' });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to schedule exam.');
    }
    setLoading(false);
  };

  const handleExamScheduleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam schedule?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Exam schedule deleted successfully.');
      fetchExamSchedules();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete exam schedule.');
    }
    setLoading(false);
  };

  const handleSessionResultDownload = async (e, format = 'pdf') => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { studentId, session } = sessionForm;
      const res = await axios.get(`http://localhost:5000/api/results/export/student/${studentId}/session/${session}?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const filename = `result_${studentId}_${session.replace(/\//g, '-')}.${format}`;
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess(`Downloaded ${format.toUpperCase()} successfully.`);
      setSessionForm({ studentId: '', session: '' });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to download ${format.toUpperCase()}.`);
    }
    setLoading(false);
  };

  const handleExportStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/export/students', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess('Students exported successfully.');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to export students.');
    }
    setLoading(false);
  };

  const handleExportResults = async (className, subject, format = 'pdf') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/results/export/class/${className}/subject/${subject}?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `results_${className}_${subject}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess(`Results exported as ${format.toUpperCase()} successfully.`);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to export ${format.toUpperCase()} results.`);
    }
    setLoading(false);
  };

  const handleExportSubjectReport = async (className, subject, format = 'pdf') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/results/export/report/${className}/${subject}?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${className}_${subject}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess(`Performance report exported as ${format.toUpperCase()} successfully.`);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to export ${format.toUpperCase()} report.`);
    }
    setLoading(false);
  };

  const handleReviewAnswers = async (resultId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/results/details/${resultId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { answers, test } = res.data;
      const review = answers.map((answer, index) => ({
        question: test.questions[index]?.questionText || 'Unknown',
        selectedOption: answer.selectedOption,
        correctOption: test.questions[index]?.correctOption || 'Unknown',
        isCorrect: answer.selectedOption === test.questions[index]?.correctOption,
      }));
      alert(JSON.stringify(review, null, 2));
      setSuccess('Answer review loaded successfully.');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load answer review.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (tab === 'analytics') {
      const ctx = document.getElementById('subjectChart')?.getContext('2d');
      if (ctx) {
        const subjectData = classes.flatMap(cls =>
          cls.subjects.map(sub => {
            const classResults = results.filter(r => r.class === cls.name && r.subject === sub);
            const avgScore = classResults.length ? (classResults.reduce((sum, r) => sum + r.score, 0) / classResults.length).toFixed(2) : 0;
            return { subject: sub, className: cls.name, avgScore };
          })
        );
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: subjectData.map(s => `${s.subject} (${s.className})`),
            datasets: [{
              label: 'Average Score',
              data: subjectData.map(s => s.avgScore),
              backgroundColor: '#D4A017', // Yellow for bars
              borderColor: '#000000', // Black border
              borderWidth: 1,
            }],
          },
          options: {
            scales: {
              y: { beginAtZero: true, max: 100, grid: { color: '#E0E0E0' } },
              x: { grid: { display: false } }
            },
            plugins: {
              legend: { labels: { color: '#000000', font: { family: 'sans-serif' } } }
            }
          },
        });
      }
    }
  }, [tab, classes, results]);

  if (!user || user.role !== 'admin') {
    return (
      <p style={{ padding: '20px', color: '#FFFFFF', backgroundColor: '#4B5320', textAlign: 'center', fontFamily: 'sans-serif', fontSize: '16px' }}>
        Access Restricted: Admins Only
      </p>
    );
  }
  if (loading) return (
    <p style={{ padding: '20px', color: '#FFFFFF', backgroundColor: '#4B5320', textAlign: 'center', fontFamily:'Potatoes', fontSize: '16px' }}>
      Loading Dashboard...
    </p>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '20px' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#4B5320', color: '#FFFFFF', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img 
              src="/images/sanni.png" 
              alt="Sanniville Academy" 
              style={{ height: '60px', border: '3px solid #D4A017', padding: '5px', backgroundColor: '#FFFFFF', borderRadius: '8px' }}
            />
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
              style={{ padding: '10px 20px', backgroundColor: '#D4A017', color: '#000000', border: '1px solid #000000', borderRadius: '6px', fontFamily: 'sans-serif', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s' }}
              onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
              onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px' }}>
        {error && (
          <p style={{ backgroundColor: '#FFF3F3', color: '#B22222', borderLeft: '4px solid #B22222', padding: '15px', marginBottom: '20px', fontFamily: 'sans-serif', borderRadius: '4px', fontSize: '14px' }}>
            Error: {error}
          </p>
        )}
        {success && (
          <p style={{ backgroundColor: '#E6FFE6', color: '#228B22', borderLeft: '4px solid #228B22', padding: '15px', marginBottom: '20px', fontFamily: 'sans-serif', borderRadius: '4px', fontSize: '14px' }}>
            Success: {success}
          </p>
        )}

        {/* Navigation tabs */}
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '30px', backgroundColor: '#FFFFFF', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0' }}>
          {['dashboard', 'classes', 'subjects', 'users', 'tests', 'results', 'session', 'exams', 'exports', 'analytics'].map(t => (
            <button
              key={t}
              onClick={() => {
                try {
                  if (t === 'users') navigate('/users');
                  else if (t === 'analytics') navigate('/analytics');
                  else if (t === 'results') navigate('/results');
                  else setTab(t);
                } catch (err) {
                  setError('Failed to navigate to ' + t.charAt(0).toUpperCase() + t.slice(1));
                }
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: tab === t ? '#D4A017' : '#4B5320',
                color: tab === t ? '#000000' : '#FFFFFF',
                border: '1px solid #000000',
                borderRadius: '6px',
                fontFamily: 'sans-serif',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s, color 0.2s',
              }}
              onMouseOver={e => e.target.style.backgroundColor = tab === t ? '#FFFFFF' : '#5A6B2A'}
              onMouseOut={e => e.target.style.backgroundColor = tab === t ? '#D4A017' : '#4B5320'}
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

        {/* Dashboard Section */}
        {tab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Welcome Banner */}
            <div style={{ backgroundColor: '#4B5320', color: '#FFFFFF', padding: '30px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', border: '1px solid #000000' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'sans-serif', marginBottom: '10px', color: '#FFFFFF' }}>
                Welcome to Your Admin Dashboard
              </h2>
              <p style={{ fontSize: '16px', fontFamily: 'sans-serif', color: '#D4A017' }}>
                Streamline your academic management with powerful tools to oversee classes, exams, results, and more at Sanniville Academy.
              </p>
            </div>

            {/* Quick Stats */}
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

            {/* Management Modules */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {[
                { 
                  title: 'User Management', 
                  desc: 'Effortlessly manage teacher and student accounts, including bulk registrations.', 
                  action: 'users',
                  icon: '👥'
                },
                { 
                  title: 'View Results', 
                  desc: 'Review and update student exam results with detailed insights.', 
                  action: 'results',
                  icon: '📊'
                },
                { 
                  title: 'View Analytics', 
                  desc: 'Unlock actionable insights with comprehensive performance analytics.', 
                  action: 'analytics',
                  icon: '🔍'
                },
                { 
                  title: 'Exam Scheduling', 
                  desc: 'Plan and manage upcoming exams with ease and precision.', 
                  action: 'exams',
                  icon: '📅'
                },
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
                        onClick={() => {
                          try {
                            if (item.action === 'users') navigate('/users');
                            else if (item.action === 'analytics') navigate('/analytics');
                            else if (item.action === 'results') navigate('/results');
                            else setTab(item.action);
                          } catch (err) {
                            setError(`Failed to navigate to ${item.title}`);
                          }
                        }}
                        style={{ padding: '8px 16px', backgroundColor: '#D4A017', color: '#000000', border: '1px solid #000000', borderRadius: '6px', fontFamily: 'sans-serif', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s' }}
                        onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
                        onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
                      >
                        Go to {item.title}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
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
                      onClick={() => {
                        if (result.testId?._id) {
                          navigate(`/results/${result.testId._id}`);
                        } else {
                          setError('Invalid test ID');
                        }
                      }} 
                      style={{ color: '#000000', backgroundColor: '#D4A017', fontFamily: 'sans-serif', fontSize: '12px', padding: '5px 10px', border: '1px solid #000000', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s' }}
                      onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
                      onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
                    >
                      View Full Results
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Classes Section */}
        {tab === 'classes' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif', backgroundColor: '#4B5320', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
              {editClass ? 'Edit Class Details' : 'Create a New Class'}
            </h3>
            <form onSubmit={handleClassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', color: '#4B5320', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '5px' }}>Class Name</label>
                <input
                  type="text"
                  placeholder="e.g., SS1 Silver"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  required
                  style={{ padding: '8px', border: '1px solid #000000', borderRadius: '4px', width: '100%', fontFamily: 'sans-serif', fontSize: '14px', backgroundColor: '#F5F5F5', color: '#000000' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ padding: '8px 16px', backgroundColor: '#D4A017', color: '#000000', border: '1px solid #000000', borderRadius: '6px', fontFamily: 'sans-serif', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'background-color 0.2s, color 0.2s' }}
                  onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
                  onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
                >
                  {editClass ? 'Update Class' : 'Create Class'}
                </button>
                {editClass && (
                  <button 
                    type="button" 
                    onClick={() => setEditClass(null)} 
                    style={{ padding: '8px 16px', backgroundColor: '#FFFFFF', color: '#000000', border: '1px solid #000000', borderRadius: '6px', fontFamily: 'sans-serif', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s' }}
                    onMouseOver={e => e.target.style.backgroundColor = '#D4A017'}
                    onMouseOut={e => e.target.style.backgroundColor = '#FFFFFF'}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif', backgroundColor: '#4B5320', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
              All Classes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {classes.map((cls) => (
                <div key={cls._id} style={{ border: '1px solid #E0E0E0', padding: '15px', backgroundColor: '#F5F5F5', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#4B5320', fontFamily: 'sans-serif' }}>{cls.name}</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => { setEditClass(cls); setClassForm({ name: cls.name }); }} 
                        style={{ color: '#000000', backgroundColor: '#D4A017', fontFamily: 'sans-serif', fontSize: '12px', padding: '5px 10px', border: '1px solid #000000', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s' }}
                        onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
                        onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleClassDelete(cls._id)} 
                        style={{ color: '#FFFFFF', backgroundColor: '#B22222', fontFamily: 'sans-serif', fontSize: '12px', padding: '5px 10px', border: '1px solid #000000', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseOver={e => e.target.style.backgroundColor = '#A52A2A'}
                        onMouseOut={e => e.target.style.backgroundColor = '#B22222'}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p style={{ color: '#000000', fontSize: '14px', marginBottom: '10px', fontFamily: 'sans-serif' }}>
                    <span style={{ fontWeight: 'bold' }}>Subjects:</span> {cls.subjects.join(', ') || 'No subjects assigned'}
                  </p>
                  <h5 style={{ color: '#4B5320', fontSize: '14px', fontFamily: 'sans-serif', marginBottom: '10px' }}>Enrolled Students</h5>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #E0E0E0' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#4B5320', color: '#FFFFFF', fontFamily: 'sans-serif', fontSize: '12px' }}>
                          <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>ID</th>
                          <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Name</th>
                          <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Surname</th>
                          <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Subjects</th>
                          <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Records</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users
                          .filter((u) => u.class === cls.name && u.role === 'student')
                          .map((student) => (
                            <tr key={student._id} style={{ color: '#000000', fontFamily: 'sans-serif', fontSize: '12px' }}>
                              <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{student.username}</td>
                              <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{student.name}</td>
                              <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{student.surname}</td>
                              <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>
                                {student.enrolledSubjects?.map((s) => s.subject).join(', ') || 'No subjects enrolled'}
                              </td>
                              <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>
                                <button 
                                  onClick={() => {
                                    if (student._id) {
                                      navigate(`/results/student/${student._id}`);
                                    } else {
                                      setError('Invalid student ID');
                                    }
                                  }} 
                                  style={{ color: '#000000', backgroundColor: '#D4A017', fontFamily: 'sans-serif', fontSize: '12px', padding: '5px 10px', border: '1px solid #000000', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s' }}
                                  onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
                                  onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
                                >
                                  View Records
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subjects Section */}
        {tab === 'subjects' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif', backgroundColor: '#4B5320', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
              {editSubject ? 'Edit Subject Details' : 'Add a New Subject'}
            </h3>
            <form onSubmit={handleSubjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', color: '#4B5320', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '5px' }}>Class</label>
                <select
                  value={subjectForm.className}
                  onChange={(e) => setSubjectForm({ ...subjectForm, className: e.target.value })}
                  required
                  style={{ padding: '8px', border: '1px solid #000000', borderRadius: '4px', width: '100%', fontFamily: 'sans-serif', fontSize: '14px', backgroundColor: '#F5F5F5', color: '#000000' }}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#4B5320', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '5px' }}>Subject</label>
                <input
                  type="text"
                  placeholder="e.g., Biology"
                  value={subjectForm.subject}
                  onChange={(e) => setSubjectForm({ ...subjectForm, subject: e.target.value })}
                  required
                  style={{ padding: '8px', border: '1px solid #000000', borderRadius: '4px', width: '100%', fontFamily: 'sans-serif', fontSize: '14px', backgroundColor: '#F5F5F5', color: '#000000' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ padding: '8px 16px', backgroundColor: '#D4A017', color: '#000000', border: '1px solid #000000', borderRadius: '6px', fontFamily: 'sans-serif', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'background-color 0.2s, color 0.2s' }}
                  onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
                  onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
                >
                  {editSubject ? 'Update Subject' : 'Add Subject'}
                </button>
                {editSubject && (
                  <button 
                    type="button" 
                    onClick={() => setEditSubject(null)} 
                    style={{ padding: '8px 16px', backgroundColor: '#FFFFFF', color: '#000000', border: '1px solid #000000', borderRadius: '6px', fontFamily: 'sans-serif', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s' }}
                    onMouseOver={e => e.target.style.backgroundColor = '#D4A017'}
                    onMouseOut={e => e.target.style.backgroundColor = '#FFFFFF'}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif', backgroundColor: '#4B5320', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
              All Subjects
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {classes.map((cls) => (
                <div key={cls._id} style={{ border: '1px solid #E0E0E0', padding: '15px', backgroundColor: '#F5F5F5', borderRadius: '4px' }}>
                  <h4 style={{ fontSize: '16px', color: '#4B5320', fontFamily: 'sans-serif', marginBottom: '10px' }}>{cls.name}</h4>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {cls.subjects.map((subject) => (
                      <li key={subject} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '8px', borderRadius: '4px', border: '1px solid #E0E0E0' }}>
                        <span style={{ color: '#000000', fontFamily: 'sans-serif', fontSize: '14px' }}>{subject}</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            onClick={() => { setEditSubject({ classId: cls._id, subject }); setSubjectForm({ className: cls.name, subject }); }} 
                            style={{ color: '#000000', backgroundColor: '#D4A017', fontFamily: 'sans-serif', fontSize: '12px', padding: '5px 10px', border: '1px solid #000000', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s' }}
                            onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
                            onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleSubjectDelete(cls._id, subject)} 
                            style={{ color: '#FFFFFF', backgroundColor: '#B22222', fontFamily: 'sans-serif', fontSize: '12px', padding: '5px 10px', border: '1px solid #000000', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                            onMouseOver={e => e.target.style.backgroundColor = '#A52A2A'}
                            onMouseOut={e => e.target.style.backgroundColor = '#B22222'}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Section */}
        {tab === 'users' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif', backgroundColor: '#4B5320', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
              Manage Users
            </h3>
            <p style={{ color: '#000000', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '15px' }}>
              Oversee student and teacher accounts, including single and bulk registrations, with full control and ease.
            </p>
            <button 
              onClick={() => navigate('/users')} 
              style={{ padding: '8px 16px', backgroundColor: '#D4A017', color: '#000000', border: '1px solid #000000', borderRadius: '6px', fontFamily: 'sans-serif', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s' }}
              onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
              onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
            >
              Go to User Management
            </button>
          </div>
        )}

        {/* Tests Section */}
        {tab === 'tests' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif', backgroundColor: '#4B5320', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
              Manage Tests & Exams
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #E0E0E0' }}>
                <thead>
                  <tr style={{ backgroundColor: '#4B5320', color: '#FFFFFF', fontFamily: 'sans-serif', fontSize: '12px' }}>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Test ID</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Title</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Subject</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Class</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Session</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Questions</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => (
                    <tr key={test._id} style={{ color: '#000000', fontFamily: 'sans-serif', fontSize: '12px' }}>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{test._id}</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{test.title}</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{test.subject}</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{test.class}</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{test.session}</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{test.questions.length}</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>
                        <button 
                          onClick={() => handleTestEdit(test._id, { ...test, title: prompt('New title:', test.title) })} 
                          style={{ color: '#000000', backgroundColor: '#D4A017', fontFamily: 'sans-serif', fontSize: '12px', padding: '5px 10px', border: '1px solid #000000', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s', marginRight: '5px' }}
                          onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
                          onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results Section */}
        {tab === 'results' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif', backgroundColor: '#4B5320', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
              View Results
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #E0E0E0' }}>
                <thead>
                  <tr style={{ backgroundColor: '#4B5320', color: '#FFFFFF', fontFamily: 'sans-serif', fontSize: '12px' }}>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Student</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Test</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Subject</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Class</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Session</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Score</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result._id} style={{ color: '#000000', fontFamily: 'sans-serif', fontSize: '12px' }}>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{result.userId ? `${result.userId.name} ${result.userId.surname}` : 'Unknown'}</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{result.testId.title}</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{result.subject}</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{result.class}</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{result.session}</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{result.score}%</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>
                        <button 
                          onClick={() => {
                            if (result.testId?._id) {
                              navigate(`/results/${result.testId._id}`);
                            } else {
                              setError('Invalid test ID');
                            }
                          }} 
                          style={{ color: '#000000', backgroundColor: '#D4A017', fontFamily: 'sans-serif', fontSize: '12px', padding: '5px 10px', border: '1px solid #000000', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s', marginRight: '5px' }}
                          onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
                          onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
                        >
                          View Results
                        </button>
                        <button 
                          onClick={() => handleResultEdit(result._id, { score: parseInt(prompt('New score:', result.score)) })} 
                          style={{ color: '#000000', backgroundColor: '#D4A017', fontFamily: 'sans-serif', fontSize: '12px', padding: '5px 10px', border: '1px solid #000000', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s, color 0.2s', marginRight: '5px' }}
                          onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
                          onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleReviewAnswers(result._id)} 
                          style={{ color: '#FFFFFF', backgroundColor: '#4B5320', fontFamily: 'sans-serif', fontSize: '12px', padding: '5px 10px', border: '1px solid #000000', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                          onMouseOver={e => e.target.style.backgroundColor = '#5A6B2A'}
                          onMouseOut={e => e.target.style.backgroundColor = '#4B5320'}
                        >
                          Review Answers
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Session Results Section */}
        {tab === 'session' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif', backgroundColor: '#4B5320', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
              Download Session Results
            </h3>
            <form onSubmit={(e) => handleSessionResultDownload(e)} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#4B5320', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '5px' }}>Student</label>
                <select
                  value={sessionForm.studentId}
                  onChange={(e) => setSessionForm({ ...sessionForm, studentId: e.target.value })}
                  required
                  style={{ padding: '8px', border: '1px solid #000000', borderRadius: '4px', width: '100%', fontFamily: 'sans-serif', fontSize: '14px', backgroundColor: '#F5F5F5', color: '#000000' }}
                >
                  <option value="">Select Student</option>
                  {users.filter(u => u.role === 'student').map((student) => (
                    <option key={student._id} value={student._id}>{student.name} {student.surname}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#4B5320', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '5px' }}>Session</label>
                <select
                  value={sessionForm.session}
                  onChange={(e) => setSessionForm({ ...sessionForm, session: e.target.value })}
                  required
                  style={{ padding: '8px', border: '1px solid #000000', borderRadius: '4px', width: '100%', fontFamily: 'sans-serif', fontSize: '14px', backgroundColor: '#F5F5F5', color: '#000000' }}
                >
                  <option value="">Select Session</option>
                  {sessions.map((session) => (
                    <option key={session} value={session}>{session}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ padding: '8px 16px', backgroundColor: '#D4A017', color: '#000000', border: '1px solid #000000', borderRadius: '6px', fontFamily: 'sans-serif', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'background-color 0.2s, color 0.2s' }}
                  onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
                  onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
                >
                  Download PDF
                </button>
                <button 
                  type="button" 
                  onClick={(e) => handleSessionResultDownload(e, 'csv')} 
                  disabled={loading} 
                  style={{ padding: '8px 16px', backgroundColor: '#4B5320', color: '#FFFFFF', border: '1px solid #000000', borderRadius: '6px', fontFamily: 'sans-serif', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'background-color 0.2s' }}
                  onMouseOver={e => e.target.style.backgroundColor = '#5A6B2A'}
                  onMouseOut={e => e.target.style.backgroundColor = '#4B5320'}
                >
                  Download CSV
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Exam Schedules Section */}
        {tab === 'exams' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif', backgroundColor: '#4B5320', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
              Schedule a New Exam
            </h3>
            <form onSubmit={handleExamScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', color: '#4B5320', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '5px' }}>Title</label>
                <input
                  type="text"
                  placeholder="e.g., Mid-Term Exam"
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  required
                  style={{ padding: '8px', border: '1px solid #000000', borderRadius: '4px', width: '100%', fontFamily: 'sans-serif', fontSize: '14px', backgroundColor: '#F5F5F5', color: '#000000' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#4B5320', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '5px' }}>Subject</label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics"
                  value={examForm.subject}
                  onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                  required
                  style={{ padding: '8px', border: '1px solid #000000', borderRadius: '4px', width: '100%', fontFamily: 'sans-serif', fontSize: '14px', backgroundColor: '#F5F5F5', color: '#000000' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#4B5320', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '5px' }}>Class</label>
                <select
                  value={examForm.class}
                  onChange={(e) => setExamForm({ ...examForm, class: e.target.value })}
                  required
                  style={{ padding: '8px', border: '1px solid #000000', borderRadius: '4px', width: '100%', fontFamily: 'sans-serif', fontSize: '14px', backgroundColor: '#F5F5F5', color: '#000000' }}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#4B5320', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '5px' }}>Date</label>
                <input
                  type="date"
                  value={examForm.date}
                  onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                  required
                  style={{ padding: '8px', border: '1px solid #000000', borderRadius: '4px', width: '100%', fontFamily: 'sans-serif', fontSize: '14px', backgroundColor: '#F5F5F5', color: '#000000' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#4B5320', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '5px' }}>Time</label>
                <input
                  type="time"
                  value={examForm.time}
                  onChange={(e) => setExamForm({ ...examForm, time: e.target.value })}
                  required
                  style={{ padding: '8px', border: '1px solid #000000', borderRadius: '4px', width: '100%', fontFamily: 'sans-serif', fontSize: '14px', backgroundColor: '#F5F5F5', color: '#000000' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#4B5320', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '5px' }}>Duration (minutes)</label>
                <input
                  type="number"
                  placeholder="e.g., 60"
                  value={examForm.duration}
                  onChange={(e) => setExamForm({ ...examForm, duration: e.target.value })}
                  required
                  style={{ padding: '8px', border: '1px solid #000000', borderRadius: '4px', width: '100%', fontFamily: 'sans-serif', fontSize: '14px', backgroundColor: '#F5F5F5', color: '#000000' }}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                style={{ padding: '8px 16px', backgroundColor: '#D4A017', color: '#000000', border: '1px solid #000000', borderRadius: '6px', fontFamily: 'sans-serif', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'background-color 0.2s, color 0.2s' }}
                onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
                onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
              >
                Schedule Exam
              </button>
            </form>

            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif', backgroundColor: '#4B5320', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
              All Exam Schedules
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #E0E0E0' }}>
                <thead>
                  <tr style={{ backgroundColor: '#4B5320', color: '#FFFFFF', fontFamily: 'sans-serif', fontSize: '12px' }}>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Title</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Subject</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Class</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Date</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Time</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Duration</th>
                    <th style={{ border: '1px solid #E0E0E0', padding: '8px' }}>Actions</th>
                  </tr>
                </thead>
                 <tbody>
                  {examSchedules.map((exam) => (
                    <tr key={exam._id} style={{ color: '#000000', fontFamily: 'sans-serif', fontSize: '12px' }}>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{exam.title}</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{exam.subject}</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{exam.class}</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{new Date(exam.date).toLocaleDateString()}</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{new Date(exam.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>{exam.duration} mins</td>
                      <td style={{ border: '1px solid #E0E0E0', padding: '8px' }}>
                        <button
                          onClick={() => handleExamScheduleDelete(exam._id)}
                          style={{
                            color: '#FFFFFF',
                            backgroundColor: '#B22222',
                            fontFamily: 'sans-serif',
                            fontSize: '12px',
                            padding: '5px 10px',
                            border: '1px solid #000000',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={e => e.target.style.backgroundColor = '#A52A2A'}
                          onMouseOut={e => e.target.style.backgroundColor = '#B22222'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Exports Section */}
        {tab === 'exports' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif', backgroundColor: '#4B5320', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
              Export Data
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#4B5320', fontFamily: 'sans-serif', marginBottom: '10px' }}>
                  Export All Students
                </h4>
                <button
                  onClick={handleExportStudents}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#D4A017',
                    color: '#000000',
                    border: '1px solid #000000',
                    borderRadius: '6px',
                    fontFamily: 'sans-serif',
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                    transition: 'background-color 0.2s, color 0.2s'
                  }}
                  onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
                  onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
                >
                  Export Students (CSV)
                </button>
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#4B5320', fontFamily: 'sans-serif', marginBottom: '10px' }}>
                  Export Class Results
                </h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const className = e.target.elements.className.value;
                    const subject = e.target.elements.subject.value;
                    handleExportResults(className, subject, 'pdf');
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
                >
                  <div>
                    <label style={{ display: 'block', color: '#4B5320', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '5px' }}>
                      Class
                    </label>
                    <select
                      name="className"
                      required
                      style={{
                        padding: '8px',
                        border: '1px solid #000000',
                        borderRadius: '4px',
                        width: '100%',
                        fontFamily: 'sans-serif',
                        fontSize: '14px',
                        backgroundColor: '#F5F5F5',
                        color: '#000000'
                      }}
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls.name}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#4B5320', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '5px' }}>
                      Subject
                    </label>
                    <select
                      name="subject"
                      required
                      style={{
                        padding: '8px',
                        border: '1px solid #000000',
                        borderRadius: '4px',
                        width: '100%',
                        fontFamily: 'sans-serif',
                        fontSize: '14px',
                        backgroundColor: '#F5F5F5',
                        color: '#000000'
                      }}
                    >
                      <option value="">Select Subject</option>
                      {classes.flatMap(cls => cls.subjects).filter((v, i, a) => a.indexOf(v) === i).map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#D4A017',
                        color: '#000000',
                        border: '1px solid #000000',
                        borderRadius: '6px',
                        fontFamily: 'sans-serif',
                        fontSize: '14px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        transition: 'background-color 0.2s, color 0.2s'
                      }}
                      onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
                      onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
                    >
                      Export PDF
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        const className = e.target.parentElement.parentElement.elements.className.value;
                        const subject = e.target.parentElement.parentElement.elements.subject.value;
                        if (className && subject) handleExportResults(className, subject, 'csv');
                        else setError('Please select class and subject.');
                      }}
                      disabled={loading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#4B5320',
                        color: '#FFFFFF',
                        border: '1px solid #000000',
                        borderRadius: '6px',
                        fontFamily: 'sans-serif',
                        fontSize: '14px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={e => e.target.style.backgroundColor = '#5A6B2A'}
                      onMouseOut={e => e.target.style.backgroundColor = '#4B5320'}
                    >
                      Export CSV
                    </button>
                  </div>
                </form>
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#4B5320', fontFamily: 'sans-serif', marginBottom: '10px' }}>
                  Export Performance Report
                </h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const className = e.target.elements.className.value;
                    const subject = e.target.elements.subject.value;
                    handleExportSubjectReport(className, subject, 'pdf');
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
                >
                  <div>
                    <label style={{ display: 'block', color: '#4B5320', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '5px' }}>
                      Class
                    </label>
                    <select
                      name="className"
                      required
                      style={{
                        padding: '8px',
                        border: '1px solid #000000',
                        borderRadius: '4px',
                        width: '100%',
                        fontFamily: 'sans-serif',
                        fontSize: '14px',
                        backgroundColor: '#F5F5F5',
                        color: '#000000'
                      }}
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls.name}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#4B5320', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '5px' }}>
                      Subject
                    </label>
                    <select
                      name="subject"
                      required
                      style={{
                        padding: '8px',
                        border: '1px solid #000000',
                        borderRadius: '4px',
                        width: '100%',
                        fontFamily: 'sans-serif',
                        fontSize: '14px',
                        backgroundColor: '#F5F5F5',
                        color: '#000000'
                      }}
                    >
                      <option value="">Select Subject</option>
                      {classes.flatMap(cls => cls.subjects).filter((v, i, a) => a.indexOf(v) === i).map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#D4A017',
                        color: '#000000',
                        border: '1px solid #000000',
                        borderRadius: '6px',
                        fontFamily: 'sans-serif',
                        fontSize: '14px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        transition: 'background-color 0.2s, color 0.2s'
                      }}
                      onMouseOver={e => e.target.style.backgroundColor = '#FFFFFF'}
                      onMouseOut={e => e.target.style.backgroundColor = '#D4A017'}
                    >
                      Export PDF Report
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        const className = e.target.parentElement.parentElement.elements.className.value;
                        const subject = e.target.parentElement.parentElement.elements.subject.value;
                        if (className && subject) handleExportSubjectReport(className, subject, 'csv');
                        else setError('Please select class and subject.');
                      }}
                      disabled={loading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#4B5320',
                        color: '#FFFFFF',
                        border: '1px solid #000000',
                        borderRadius: '6px',
                        fontFamily: 'sans-serif',
                        fontSize: '14px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={e => e.target.style.backgroundColor = '#5A6B2A'}
                      onMouseOut={e => e.target.style.backgroundColor = '#4B5320'}
                    >
                      Export CSV Report
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Section */}
        {tab === 'analytics' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #E0E0E0' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif', backgroundColor: '#4B5320', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
              Performance Analytics
            </h3>
            <p style={{ color: '#000000', fontFamily: 'sans-serif', fontSize: '14px', marginBottom: '15px' }}>
              Visualize student performance across subjects and classes.
            </p>
            <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
              <canvas id="subjectChart" style={{ maxHeight: '400px' }}></canvas>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#4B5320', color: '#FFFFFF', padding: '20px', marginTop: '40px', textAlign: 'center', borderTop: '1px solid #000000' }}>
        <p style={{ fontSize: '14px', fontFamily: 'sans-serif', color: '#FFFFFF' }}>
          &copy; {new Date().getFullYear()} Sanniville Academy. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AdminHome;