import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Papa from 'papaparse';
import Chart from 'chart.js/auto';

const TeacherHome = () => {
  // Get user and login function from AuthContext
  const { user, setUser, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // State declarations
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Data fetching functions
const fetchTests = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found.');
    const res = await axios.get('http://localhost:5000/api/tests', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Fetched tests:', res.data);
    const validTests = res.data.filter(test => test._id && /^[0-9a-fA-F]{24}$/.test(test._id));
    setTests(validTests);
    if (res.data.length !== validTests.length) {
      console.warn('Invalid test IDs filtered out:', res.data.filter(test => !/^[0-9a-fA-F]{24}$/.test(test._id)));
      setError('Some tests could not be loaded due to invalid IDs.');
    }
    setError(null);
  } catch (err) {
    console.error('Fetch tests error:', err.response?.data || err.message);
    if (err.response?.status === 401) {
      setError('Session expired. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    } else {
      setError(err.response?.data?.error || 'Failed to load tests. Please try again.');
    }
  }
  setLoading(false);
};

const fetchQuestions = async () => {
  setLoading(true);
  setError(null);
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found.');
    const res = await axios.get('http://localhost:5000/api/questions', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Fetched questions:', res.data);
    if (!res.data || res.data.length === 0) {
      console.warn('No questions found');
      setError('No questions available. Please add questions to the question bank.');
    }
    setQuestions(res.data || []);
  } catch (err) {
    console.error('Fetch questions error:', err.response?.data || err.message);
    if (err.response?.status === 401) {
      setError('Session expired. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    } else {
      setError(err.response?.data?.error || 'Failed to load questions. Please check your connection or contact support.');
    }
  }
  setLoading(false);
};

const fetchResults = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found.');
    const res = await axios.get('http://localhost:5000/api/results', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setResults(res.data);
    setError(null);
  } catch (err) {
    console.error('Fetch results error:', err.response?.data || err.message);
    if (err.response?.status === 401) {
      setError('Session expired. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    } else {
      setError(err.response?.data?.error || 'Failed to load results. Please try again.');
    }
  }
  setLoading(false);
};

const fetchAnalytics = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found.');
    const res = await axios.get('http://localhost:5000/api/analytics', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAnalytics(res.data);
    setError(null);
  } catch (err) {
    console.error('Fetch analytics error:', err.response?.data || err.message);
    if (err.response?.status === 401) {
      setError('Session expired. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    } else {
      setError(err.response?.data?.error || 'Failed to load analytics. Please try again.');
    }
  }
  setLoading(false);
};

// Add this useEffect to fetch initial data
useEffect(() => {
  if (user && user.role === 'teacher') {
    console.log('User in TeacherHome:', user);
    fetchTests();
    fetchQuestions();
    fetchResults();
    fetchAnalytics();
  } else if (!user) {
    setError('Session expired. Please log in again.');
    navigate('/login');
  }
}, [user, navigate]);
  
  // Data states
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  
  // Question form state
  const [questionForm, setQuestionForm] = useState({
    subject: '',
    class: '',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    image: null,
  });
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showQuestionPreview, setShowQuestionPreview] = useState(false);
  
  // Filter states
  const [filterSubject, setFilterSubject] = useState('');
  const [filterClass, setFilterClass] = useState('');
  
  // File state
  const [csvFile, setCsvFile] = useState(null);

  // Helper functions
  const isQuestionValid = () => {
    return (
      questionForm.subject &&
      questionForm.class &&
      questionForm.text &&
      questionForm.options.every(opt => opt) &&
      questionForm.correctAnswer &&
      questionForm.options.includes(questionForm.correctAnswer)
    );
  };

  // ============= HANDLER FUNCTIONS =============
  // Test handlers
  const handleEditTest = (testId) => {
    if (!testId || !/^[0-9a-fA-F]{24}$/.test(testId)) {
      console.error('Edit test error: Invalid testId:', testId);
      setError('Invalid test ID. Please select a valid test.');
      return;
    }
    navigate(`/test-creation/${testId}`);
  };

  const handleAddQuestions = (testId) => {
    if (!testId || !/^[0-9a-fA-F]{24}$/.test(testId)) {
      console.error('Add questions error: Invalid testId:', testId);
      setError('Invalid test ID. Please select a valid test.');
      return;
    }
    navigate(`/test-creation/${testId}/questions`);
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');
      await axios.delete(`http://localhost:5000/api/tests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Test deleted successfully.');
      fetchTests();
    } catch (err) {
      console.error('Delete test error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to delete test. Please try again.');
      }
    }
    setLoading(false);
  };

  // Question handlers
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!isQuestionValid()) {
      setError('Please fill all fields and ensure correct answer matches an option.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');
      const formData = new FormData();
      formData.append('subject', questionForm.subject);
      formData.append('class', questionForm.class);
      formData.append('text', questionForm.text);
      formData.append('options', JSON.stringify(questionForm.options));
      formData.append('correctAnswer', questionForm.correctAnswer);
      if (questionForm.image) {
        formData.append('image', questionForm.image);
      }
      if (editQuestionId) {
        await axios.put(`http://localhost:5000/api/questions/${editQuestionId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Question updated successfully.');
        setEditQuestionId(null);
      } else {
        await axios.post('http://localhost:5000/api/questions', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Question added to bank successfully.');
      }
      setQuestionForm({ subject: '', class: '', text: '', options: ['', '', '', ''], correctAnswer: '', image: null });
      setImagePreview(null);
      setShowQuestionPreview(false);
      fetchQuestions();
    } catch (err) {
      console.error('Question submit error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to process question. Please check your input and try again.');
      }
    }
    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setQuestionForm({ ...questionForm, image: file });
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handlePreviewQuestion = () => {
    if (!isQuestionValid()) {
      setError('Please fill all fields to preview the question.');
      return;
    }
    setShowQuestionPreview(true);
  };

  const handleEditQuestion = (question) => {
    setEditQuestionId(question._id);
    setQuestionForm({
      subject: question.subject,
      class: question.class,
      text: question.text,
      options: question.options,
      correctAnswer: question.correctAnswer,
      image: null,
    });
    setImagePreview(question.imageUrl || null);
    setTab('add-question');
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');
      await axios.delete(`http://localhost:5000/api/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Question deleted successfully.');
      fetchQuestions();
    } catch (err) {
      console.error('Delete question error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to delete question. Please try again.');
      }
    }
    setLoading(false);
  };

  // Bulk import handlers
  const handleDownloadTemplate = () => {
    const template = 'subject,class,questionText,option1,option2,option3,option4,correctAnswer,imageUrl\nMaths,SS1,What is 2+2?,2,4,6,8,4,';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'question_template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    setSuccess('CSV template downloaded successfully.');
  };

  const handleBulkQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setError('Please select a CSV file.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      Papa.parse(csvFile, {
        complete: async (result) => {
          const questions = result.data.map(row => ({
            subject: row.subject,
            class: row.class,
            questionText: row.questionText,
            options: [row.option1, row.option2, row.option3, row.option4].filter(Boolean),
            correctAnswer: row.correctAnswer,
            imageUrl: row.imageUrl || '',
          }));
          for (const q of questions) {
            if (!q.subject || !q.class || !q.questionText || q.options.length < 2 || !q.correctAnswer) {
              throw new Error('Invalid CSV: Missing required fields.');
            }
          }
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No authentication token found.');
          const res = await axios.post('http://localhost:5000/api/questions/bulk', { questions }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSuccess(`Imported ${res.data.count} questions successfully.`);
          setCsvFile(null);
          fetchQuestions();
        },
        header: true,
        skipEmptyLines: true,
        error: (err) => {
          console.error('CSV parse error:', err.message);
          setError('Failed to parse CSV file. Ensure it follows the template format.');
          setLoading(false);
        },
      });
    } catch (err) {
      console.error('Bulk question submit error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to import questions. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleExportQuestions = () => {
    setError(null);
    setSuccess(null);
    try {
      const filteredQuestions = questions.filter(q =>
        (!filterSubject || q.subject === filterSubject) &&
        (!filterClass || q.class === filterClass)
      ).map(q => ({
        subject: q.subject,
        class: q.class,
        questionText: q.text,
        option1: q.options[0] || '',
        option2: q.options[1] || '',
        option3: q.options[2] || '',
        option4: q.options[3] || '',
        correctAnswer: q.correctAnswer,
        imageUrl: q.imageUrl || '',
      }));

      if (filteredQuestions.length === 0) {
        setError('No questions match the selected filters. Try adjusting your filters or add new questions.');
        return;
      }

      const csv = Papa.unparse(filteredQuestions, {
        quotes: true,
        delimiter: ',',
        header: true,
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `questions_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess(`Exported ${filteredQuestions.length} questions successfully.`);
    } catch (err) {
      console.error('Export questions error:', err.message);
      setError('Failed to export questions. Please try again.');
    }
  };

  // Derived state values
  const subjectOptions = [...new Set([
    ...(questions.map(q => q.subject).filter(Boolean)),
    ...(user?.subjects?.map(s => s.subject) || []),
  ])];

  const classOptions = [...new Set([
    ...(questions.map(q => q.class).filter(Boolean)),
    ...(user?.subjects?.map(s => s.class) || []),
  ])];

  if (!user || user.role !== 'teacher') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h2 style={{ color: '#4B5320', marginBottom: '20px' }}>Access Restricted</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            This dashboard is only available to authorized teachers. Please log in with a teacher account.
          </p>
          <button 
            onClick={() => navigate('/login')}
            style={{
              backgroundColor: '#4B5320',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #4B5320',
            borderTopColor: '#FFD700',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#4B5320', fontSize: '18px' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#4B5320',
        color: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/images/sanni.png" 
            alt="Sanniville Academy" 
            style={{ height: '40px', marginRight: '15px' }} 
          />
          <h1 style={{ margin: 0, fontSize: '24px' }}>Teacher Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '20px' }}>Welcome, {user.name}</span>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              navigate('/login');
            }}
            style={{
              backgroundColor: '#FFD700',
              color: '#4B5320',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        minHeight: 'calc(100vh - 80px)'
      }}>
        {/* Sidebar */}
        <aside style={{
          width: '250px',
          backgroundColor: 'white',
          padding: '20px',
          boxShadow: '2px 0 5px rgba(0,0,0,0.05)'
        }}>
          <nav>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => setTab('dashboard')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 15px',
                    backgroundColor: tab === 'dashboard' ? '#FFD700' : 'transparent',
                    color: tab === 'dashboard' ? '#4B5320' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ marginRight: '10px' }}>📊</span>
                  Dashboard
                </button>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => navigate('/test-creation')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 15px',
                    backgroundColor: 'transparent',
                    color: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ marginRight: '10px' }}>➕</span>
                  Create New Test
                </button>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => setTab('add-question')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 15px',
                    backgroundColor: tab === 'add-question' ? '#FFD700' : 'transparent',
                    color: tab === 'add-question' ? '#4B5320' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ marginRight: '10px' }}>❓</span>
                  Add Question
                </button>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => setTab('bulk-question')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 15px',
                    backgroundColor: tab === 'bulk-question' ? '#FFD700' : 'transparent',
                    color: tab === 'bulk-question' ? '#4B5320' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ marginRight: '10px' }}>📁</span>
                  Bulk Import
                </button>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => setTab('questions')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 15px',
                    backgroundColor: tab === 'questions' ? '#FFD700' : 'transparent',
                    color: tab === 'questions' ? '#4B5320' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ marginRight: '10px' }}>📝</span>
                  Manage Questions
                </button>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => setTab('tests')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 15px',
                    backgroundColor: tab === 'tests' ? '#FFD700' : 'transparent',
                    color: tab === 'tests' ? '#4B5320' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ marginRight: '10px' }}>📚</span>
                  Manage Tests
                </button>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => setTab('results')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 15px',
                    backgroundColor: tab === 'results' ? '#FFD700' : 'transparent',
                    color: tab === 'results' ? '#4B5320' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ marginRight: '10px' }}>📊</span>
                  Student Results
                </button>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => setTab('analytics')}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 15px',
                    backgroundColor: tab === 'analytics' ? '#FFD700' : 'transparent',
                    color: tab === 'analytics' ? '#4B5320' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ marginRight: '10px' }}>📈</span>
                  Analytics
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          padding: '30px',
          backgroundColor: '#f8f9fa'
        }}>
          {/* Status Messages */}
          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '15px',
              borderRadius: '4px',
              marginBottom: '20px',
              borderLeft: '4px solid #dc3545',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '10px', fontSize: '20px' }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div style={{
              backgroundColor: '#d4edda',
              color: '#155724',
              padding: '15px',
              borderRadius: '4px',
              marginBottom: '20px',
              borderLeft: '4px solid #28a745',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '10px', fontSize: '20px' }}>✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Dashboard Content */}
          {tab === 'dashboard' && (
            <div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '25px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  color: '#4B5320',
                  marginTop: '0',
                  marginBottom: '20px',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '10px' }}>👋</span>
                  Welcome, {user.name} {user.surname}
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '20px',
                  marginBottom: '30px'
                }}>
                  <div style={{
                    backgroundColor: '#FFD700',
                    color: '#4B5320',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ marginTop: '0', marginBottom: '10px' }}>Your Subjects</h3>
                    <p style={{ margin: '0' }}>
                      {(user.subjects || []).map(s => `${s.subject} (${s.class})`).join(', ') || 'No subjects assigned'}
                    </p>
                  </div>
                  
                  <div style={{
                    backgroundColor: '#4B5320',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ marginTop: '0', marginBottom: '10px' }}>Active Tests</h3>
                    <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
                      {tests.filter(t => new Date(t.availability.end) > new Date()).length}
                    </p>
                  </div>
                  
                  <div style={{
                    backgroundColor: 'white',
                    border: '2px solid #4B5320',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ marginTop: '0', marginBottom: '10px', color: '#4B5320' }}>Questions in Bank</h3>
                    <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#4B5320' }}>
                      {questions.length}
                    </p>
                  </div>
                </div>
                
                <h3 style={{ color: '#4B5320', marginBottom: '15px' }}>Quick Actions</h3>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <button 
                    onClick={() => navigate('/test-creation')}
                    style={{
                      backgroundColor: '#4B5320',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={e => e.target.backgroundColor = '#3a4418'}
                    onMouseOut={e => e.target.backgroundColor = '#4B5320'}
                  >
                    <span style={{ marginRight: '8px' }}>➕</span>
                    Create New Test
                  </button>
                  
                  <button 
                    onClick={() => setTab('add-question')}
                    style={{
                      backgroundColor: '#FFD700',
                      color: '#4B5320',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={e => e.target.backgroundColor = '#e6c200'}
                    onMouseOut={e => e.target.backgroundColor = '#FFD700'}
                  >
                    <span style={{ marginRight: '8px' }}>❓</span>
                    Add Question
                  </button>
                  
                  <button 
                    onClick={() => setTab('questions')}
                    style={{
                      backgroundColor: 'white',
                      color: '#4B5320',
                      border: '2px solid #4B5320',
                      padding: '12px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={e => {
                      e.target.backgroundColor = '#f0f0f0';
                      e.target.color = '#3a4418';
                    }}
                    onMouseOut={e => {
                      e.target.backgroundColor = 'white';
                      e.target.color = '#4B5320';
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>📝</span>
                    Manage Questions
                  </button>
                  
                  <button 
                    onClick={() => setTab('analytics')}
                    style={{
                      backgroundColor: '#4B5320',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={e => e.target.backgroundColor = '#3a4418'}
                    onMouseOut={e => e.target.backgroundColor = '#4B5320'}
                  >
                    <span style={{ marginRight: '8px' }}>📈</span>
                    View Analytics
                  </button>
                </div>
              </div>
              
              {/* Recent Activity Section */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '25px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{ color: '#4B5320', marginTop: '0', marginBottom: '20px' }}>Recent Activity</h3>
                
                {tests.slice(0, 3).map(test => (
                  <div key={test._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px 0',
                    borderBottom: '1px solid #eee'
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#4B5320' }}>{test.title}</h4>
                      <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                        {test.subject} • {test.class} • {new Date(test.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleEditTest(test._id)}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#4B5320',
                        border: '1px solid #4B5320',
                        padding: '8px 15px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                    >
                      View
                    </button>
                  </div>
                ))}
                
                {tests.length === 0 && (
                  <p style={{ color: '#666', textAlign: 'center' }}>No recent activity found</p>
                )}
              </div>
            </div>
          )}

          {/* Add Question Tab */}
          {tab === 'add-question' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{
                color: '#4B5320',
                marginTop: '0',
                marginBottom: '20px',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '10px' }}>{editQuestionId ? '✏️' : '❓'}</span>
                {editQuestionId ? 'Edit Question' : 'Add New Question'}
              </h2>
              
              <form onSubmit={handleQuestionSubmit} style={{ maxWidth: '600px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4B5320',
                    fontWeight: '600'
                  }}>
                    Subject
                  </label>
                  <select
                    value={questionForm.subject}
                    onChange={(e) => setQuestionForm({ ...questionForm, subject: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      fontSize: '16px'
                    }}
                  >
                    <option value="">Select Subject</option>
                    {(user.subjects || []).map(sub => (
                      <option key={sub._id} value={sub.subject}>{sub.subject} ({sub.class})</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4B5320',
                    fontWeight: '600'
                  }}>
                    Class
                  </label>
                  <select
                    value={questionForm.class}
                    onChange={(e) => setQuestionForm({ ...questionForm, class: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      fontSize: '16px'
                    }}
                  >
                    <option value="">Select Class</option>
                    {(user.subjects || []).map(sub => (
                      <option key={sub._id} value={sub.class}>{sub.class}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4B5320',
                    fontWeight: '600'
                  }}>
                    Question Text
                  </label>
                  <textarea
                    placeholder="Enter the question..."
                    value={questionForm.text}
                    onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      minHeight: '100px',
                      fontSize: '16px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4B5320',
                    fontWeight: '600'
                  }}>
                    Options
                  </label>
                  {questionForm.options.map((option, index) => (
                    <div key={index} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#4B5320',
                        color: 'white',
                        borderRadius: '50%',
                        textAlign: 'center',
                        lineHeight: '24px',
                        marginRight: '10px',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...questionForm.options];
                          newOptions[index] = e.target.value;
                          setQuestionForm({ ...questionForm, options: newOptions });
                        }}
                        required
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '16px'
                        }}
                      />
                    </div>
                  ))}
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4B5320',
                    fontWeight: '600'
                  }}>
                    Correct Answer
                  </label>
                  <select
                    value={questionForm.correctAnswer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      fontSize: '16px'
                    }}
                  >
                    <option value="">Select Correct Option</option>
                    {questionForm.options.map((option, index) => (
                      option ? <option key={index} value={option}>Option {index + 1}: {option}</option> : null
                    ))}
                  </select>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4B5320',
                    fontWeight: '600'
                  }}>
                    Question Image (Optional)
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px dashed #ddd',
                      borderRadius: '6px'
                    }}
                  />
                  {imagePreview && (
                    <div style={{ marginTop: '15px' }}>
                      <p style={{ marginBottom: '8px', color: '#4B5320', fontWeight: '600' }}>Image Preview:</p>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px', 
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }} 
                      />
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                  <button
                    type="submit"
                    disabled={loading || !isQuestionValid()}
                    style={{
                      backgroundColor: isQuestionValid() ? '#4B5320' : '#ccc',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      cursor: isQuestionValid() ? 'pointer' : 'not-allowed',
                      fontWeight: '600',
                      fontSize: '16px',
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    {loading ? (
                      <>
                        <span style={{ marginRight: '8px' }}>⏳</span>
                        Processing...
                      </>
                    ) : editQuestionId ? (
                      'Update Question'
                    ) : (
                      'Add to Question Bank'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handlePreviewQuestion}
                    disabled={!isQuestionValid()}
                    style={{
                      backgroundColor: isQuestionValid() ? '#FFD700' : '#ccc',
                      color: isQuestionValid() ? '#4B5320' : '#666',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      cursor: isQuestionValid() ? 'pointer' : 'not-allowed',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}
                  >
                    Preview Question
                  </button>
                  
                  {editQuestionId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditQuestionId(null);
                        setQuestionForm({ subject: '', class: '', text: '', options: ['', '', '', ''], correctAnswer: '', image: null });
                        setImagePreview(null);
                        setShowQuestionPreview(false);
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#4B5320',
                        border: '1px solid #4B5320',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              
              {showQuestionPreview && (
                <div style={{
                  marginTop: '40px',
                  backgroundColor: '#f9f9f9',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '25px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                  <h3 style={{
                    color: '#4B5320',
                    marginTop: '0',
                    marginBottom: '20px',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{ marginRight: '10px' }}>👁️</span>
                    Question Preview
                  </h3>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#4B5320',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      marginRight: '10px'
                    }}>
                      {questionForm.subject}
                    </span>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#FFD700',
                      color: '#4B5320',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      {questionForm.class}
                    </span>
                  </div>
                  
                  <p style={{
                    fontSize: '18px',
                    marginBottom: '20px',
                    paddingBottom: '15px',
                    borderBottom: '1px solid #eee'
                  }}>
                    {questionForm.text}
                  </p>
                  
                  {imagePreview && (
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                      <img 
                        src={imagePreview} 
                        alt="Question" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '300px', 
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }} 
                      />
                    </div>
                  )}
                  
                  <div style={{ marginBottom: '20px' }}>
                    {questionForm.options.map((option, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '10px',
                        padding: '12px',
                        backgroundColor: option === questionForm.correctAnswer ? '#d4edda' : 'white',
                        border: option === questionForm.correctAnswer ? '1px solid #28a745' : '1px solid #ddd',
                        borderRadius: '4px'
                      }}>
                        <input
                          type="radio"
                          checked={option === questionForm.correctAnswer}
                          readOnly
                          style={{ marginRight: '10px' }}
                        />
                        <span>{option}</span>
                        {option === questionForm.correctAnswer && (
                          <span style={{
                            marginLeft: 'auto',
                            color: '#28a745',
                            fontWeight: '600'
                          }}>
                            ✓ Correct Answer
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setShowQuestionPreview(false)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#4B5320',
                      border: '1px solid #4B5320',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '16px',
                      display: 'block',
                      marginLeft: 'auto'
                    }}
                  >
                    Close Preview
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bulk Import Tab */}
          {tab === 'bulk-question' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{
                color: '#4B5320',
                marginTop: '0',
                marginBottom: '20px',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ marginRight: '10px' }}>📁</span>
                Bulk Import Questions
              </h2>
              
              <div style={{ marginBottom: '30px' }}>
                <p style={{ marginBottom: '15px' }}>
                  Upload a CSV file with questions in the following format:
                </p>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '15px',
                  marginBottom: '20px',
                  overflowX: 'auto'
                }}>
                  <pre style={{ margin: '0', fontFamily: 'monospace' }}>
                    subject,class,questionText,option1,option2,option3,option4,correctAnswer,imageUrl\n
                    Maths,SS1,What is 2+2?,2,4,6,8,4,\n
                    English,JS2,What is a noun?,Person,Action,Color,None of the above,Person,https://example.com/noun.jpg
                  </pre>
                </div>
                
                <button 
                  onClick={handleDownloadTemplate}
                  style={{
                    backgroundColor: '#4B5320',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <span style={{ marginRight: '8px' }}>⬇️</span>
                  Download CSV Template
                </button>
              </div>
              
              <form onSubmit={handleBulkQuestionSubmit} style={{ maxWidth: '600px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#4B5320',
                    fontWeight: '600'
                  }}>
                    Select CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px dashed #ddd',
                      borderRadius: '6px',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? '#ccc' : '#4B5320',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{ marginRight: '8px' }}>⏳</span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <span style={{ marginRight: '8px' }}>📤</span>
                      Upload and Import Questions
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Manage Questions Tab */}
          {tab === 'questions' && (
            <div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '25px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  color: '#4B5320',
                  marginTop: '0',
                  marginBottom: '20px',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '10px' }}>📝</span>
                  Manage Questions
                </h2>
                
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      color: '#4B5320',
                      fontWeight: '600'
                    }}>
                      Filter by Subject
                    </label>
                    <select
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">All Subjects</option>
                      {subjectOptions.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      color: '#4B5320',
                      fontWeight: '600'
                    }}>
                      Filter by Class
                    </label>
                    <select
                      value={filterClass}
                      onChange={(e) => setFilterClass(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">All Classes</option>
                      {classOptions.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ alignSelf: 'flex-end' }}>
                    <button
                      onClick={handleExportQuestions}
                      disabled={questions.length === 0}
                      style={{
                        backgroundColor: questions.length === 0 ? '#ccc' : '#4B5320',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: questions.length === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ marginRight: '8px' }}>📥</span>
                      Export Questions
                    </button>
                  </div>
                </div>
                
                {questions.length === 0 ? (
                  <div style={{
                    backgroundColor: '#fff8e1',
                    borderLeft: '4px solid #FFD700',
                    padding: '20px',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: '0', color: '#4B5320' }}>
                      No questions found in the question bank. Add questions using the "Add Question" or "Bulk Import" tabs.
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      marginTop: '20px'
                    }}>
                      <thead>
                        <tr style={{
                          backgroundColor: '#4B5320',
                          color: 'white'
                        }}>
                          <th style={{ padding: '12px 15px', textAlign: 'left' }}>Question</th>
                          <th style={{ padding: '12px 15px', textAlign: 'left' }}>Subject</th>
                          <th style={{ padding: '12px 15px', textAlign: 'left' }}>Class</th>
                          <th style={{ padding: '12px 15px', textAlign: 'left' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questions
                          .filter(q => (!filterSubject || q.subject === filterSubject) && (!filterClass || q.class === filterClass))
                          .map(question => (
                            <tr key={question._id} style={{
                              borderBottom: '1px solid #eee',
                              ':hover': {
                                backgroundColor: '#f9f9f9'
                              }
                            }}>
                              <td style={{ padding: '12px 15px', maxWidth: '300px', wordBreak: 'break-word' }}>
                                {question.text}
                              </td>
                              <td style={{ padding: '12px 15px' }}>
                                <span style={{
                                  backgroundColor: '#e8f5e9',
                                  color: '#4B5320',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '14px'
                                }}>
                                  {question.subject}
                                </span>
                              </td>
                              <td style={{ padding: '12px 15px' }}>
                                <span style={{
                                  backgroundColor: '#fff8e1',
                                  color: '#4B5320',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '14px'
                                }}>
                                  {question.class}
                                </span>
                              </td>
                              <td style={{ padding: '12px 15px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button
                                    onClick={() => handleEditQuestion(question)}
                                    style={{
                                      backgroundColor: '#FFD700',
                                      color: '#4B5320',
                                      border: 'none',
                                      padding: '8px 12px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      fontSize: '14px',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <span style={{ marginRight: '5px' }}>✏️</span>
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuestion(question._id)}
                                    style={{
                                      backgroundColor: '#ff6b6b',
                                      color: 'white',
                                      border: 'none',
                                      padding: '8px 12px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      fontSize: '14px',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <span style={{ marginRight: '5px' }}>🗑️</span>
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {questions.length > 0 && (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0', color: '#4B5320' }}>
                    Showing {questions.filter(q => (!filterSubject || q.subject === filterSubject) && (!filterClass || q.class === filterClass)).length} of {questions.length} questions
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Manage Tests Tab */}
          {tab === 'tests' && (
            <div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '25px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  color: '#4B5320',
                  marginTop: '0',
                  marginBottom: '20px',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '10px' }}>📚</span>
                  Manage Tests
                </h2>
                
                {tests.length === 0 ? (
                  <div style={{
                    backgroundColor: '#fff8e1',
                    borderLeft: '4px solid #FFD700',
                    padding: '20px',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: '0', color: '#4B5320' }}>
                      No tests found. Create a new test using the "Create Test" button in the sidebar.
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      marginTop: '20px'
                    }}>
                      <thead>
                        <tr style={{
                          backgroundColor: '#4B5320',
                          color: 'white'
                        }}>
                          <th style={{ padding: '12px 15px', textAlign: 'left' }}>Test Title</th>
                          <th style={{ padding: '12px 15px', textAlign: 'left' }}>Subject</th>
                          <th style={{ padding: '12px 15px', textAlign: 'left' }}>Class</th>
                          <th style={{ padding: '12px 15px', textAlign: 'left' }}>Status</th>
                          <th style={{ padding: '12px 15px', textAlign: 'left' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tests.map(test => {
                          const now = new Date();
                          const startDate = new Date(test.availability.start);
                          const endDate = test.availability.end ? new Date(test.availability.end) : null;
                          let status = 'Draft';
                          let statusColor = '#666';
                          
                          if (now >= startDate && (!endDate || now <= endDate)) {
                            status = 'Active';
                            statusColor = '#28a745';
                          } else if (endDate && now > endDate) {
                            status = 'Completed';
                            statusColor = '#6c757d';
                          } else if (now < startDate) {
                            status = 'Scheduled';
                            statusColor = '#17a2b8';
                          }
                          
                          return (
                            <tr key={test._id} style={{
                              borderBottom: '1px solid #eee',
                              ':hover': {
                                backgroundColor: '#f9f9f9'
                              }
                            }}>
                              <td style={{ padding: '12px 15px', fontWeight: '600' }}>
                                {test.title}
                              </td>
                              <td style={{ padding: '12px 15px' }}>
                                <span style={{
                                  backgroundColor: '#e8f5e9',
                                  color: '#4B5320',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '14px'
                                }}>
                                  {test.subject}
                                </span>
                              </td>
                              <td style={{ padding: '12px 15px' }}>
                                <span style={{
                                  backgroundColor: '#fff8e1',
                                  color: '#4B5320',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '14px'
                                }}>
                                  {test.class}
                                </span>
                              </td>
                              <td style={{ padding: '12px 15px' }}>
                                <span style={{
                                  color: statusColor,
                                  fontWeight: '600'
                                }}>
                                  {status}
                                </span>
                              </td>
                              <td style={{ padding: '12px 15px' }}>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                  <button
                                    onClick={() => handleEditTest(test._id)}
                                    style={{
                                      backgroundColor: '#4B5320',
                                      color: 'white',
                                      border: 'none',
                                      padding: '8px 12px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      fontSize: '14px',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <span style={{ marginRight: '5px' }}>✏️</span>
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleAddQuestions(test._id)}
                                    style={{
                                      backgroundColor: '#FFD700',
                                      color: '#4B5320',
                                      border: 'none',
                                      padding: '8px 12px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      fontSize: '14px',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <span style={{ marginRight: '5px' }}>❓</span>
                                    Questions
                                  </button>
                                  <button
                                    onClick={() => navigate(`/test-preview/${test._id}`)}
                                    style={{
                                      backgroundColor: '#17a2b8',
                                      color: 'white',
                                      border: 'none',
                                      padding: '8px 12px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      fontSize: '14px',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <span style={{ marginRight: '5px' }}>👁️</span>
                                    Preview
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTest(test._id)}
                                    style={{
                                      backgroundColor: '#ff6b6b',
                                      color: 'white',
                                      border: 'none',
                                      padding: '8px 12px',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      fontSize: '14px',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <span style={{ marginRight: '5px' }}>🗑️</span>
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {tests.length > 0 && (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0', color: '#4B5320' }}>
                    Showing {tests.length} tests
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Student Results Tab */}
          {tab === 'results' && (
            <div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '25px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  color: '#4B5320',
                  marginTop: '0',
                  marginBottom: '20px',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '10px' }}>📊</span>
                  Student Results
                </h2>
                
                {results.length === 0 ? (
                  <div style={{
                    backgroundColor: '#fff8e1',
                    borderLeft: '4px solid #FFD700',
                    padding: '20px',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: '0', color: '#4B5320' }}>
                      No results found. Students need to complete tests for results to appear here.
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      marginTop: '20px'
                    }}>
                      <thead>
                        <tr style={{
                          backgroundColor: '#4B5320',
                          color: 'white'
                        }}>
                          <th style={{ padding: '12px 15px', textAlign: 'left' }}>Student</th>
                          <th style={{ padding: '12px 15px', textAlign: 'left' }}>Test</th>
                          <th style={{ padding: '12px 15px', textAlign: 'left' }}>Score</th>
                          <th style={{ padding: '12px 15px', textAlign: 'left' }}>Date</th>
                          <th style={{ padding: '12px 15px', textAlign: 'left' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map(result => (
                          <tr key={result._id} style={{
                            borderBottom: '1px solid #eee',
                            ':hover': {
                              backgroundColor: '#f9f9f9'
                            }
                          }}>
                            <td style={{ padding: '12px 15px' }}>
                              {result.userId?.name} {result.userId?.surname}
                            </td>
                            <td style={{ padding: '12px 15px' }}>
                              {result.testId?.title}
                            </td>
                            <td style={{ padding: '12px 15px', fontWeight: '600' }}>
                              <span style={{
                                color: result.score >= 50 ? '#28a745' : '#dc3545'
                              }}>
                                {result.score}%
                              </span>
                            </td>
                            <td style={{ padding: '12px 15px' }}>
                              {new Date(result.submittedAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '12px 15px' }}>
                              <span style={{
                                backgroundColor: result.score >= 50 ? '#d4edda' : '#f8d7da',
                                color: result.score >= 50 ? '#155724' : '#721c24',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '14px'
                              }}>
                                {result.score >= 50 ? 'Passed' : 'Failed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {results.length > 0 && (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0', color: '#4B5320' }}>
                    Showing {results.length} results
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {tab === 'analytics' && (
            <div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '25px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  color: '#4B5320',
                  marginTop: '0',
                  marginBottom: '20px',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '10px' }}>📈</span>
                  Test Analytics
                </h2>
                
                {analytics.length === 0 ? (
                  <div style={{
                    backgroundColor: '#fff8e1',
                    borderLeft: '4px solid #FFD700',
                    padding: '20px',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: '0', color: '#4B5320' }}>
                      No analytics data available yet. Students need to complete tests for analytics to appear.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '30px' }}>
                      <canvas id="testChart" style={{ maxWidth: '100%', height: '400px' }}></canvas>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                      gap: '20px'
                    }}>
                      {analytics.map(analytic => (
                        <div key={analytic.testId} style={{
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          padding: '20px'
                        }}>
                          <h3 style={{
                            color: '#4B5320',
                            marginTop: '0',
                            marginBottom: '15px'
                          }}>
                            {analytic.testTitle}
                          </h3>
                          
                          <div style={{ marginBottom: '15px' }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: '5px'
                            }}>
                              <span>Average Score:</span>
                              <span style={{ fontWeight: '600' }}>{analytic.averageScore}%</span>
                            </div>
                            <div style={{
                              height: '10px',
                              backgroundColor: '#e9ecef',
                              borderRadius: '5px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${analytic.averageScore}%`,
                                height: '100%',
                                backgroundColor: '#4B5320'
                              }}></div>
                            </div>
                          </div>
                          
                          <div style={{ marginBottom: '15px' }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: '5px'
                            }}>
                              <span>Highest Score:</span>
                              <span style={{ fontWeight: '600', color: '#28a745' }}>{analytic.highestScore}%</span>
                            </div>
                            <div style={{
                              height: '10px',
                              backgroundColor: '#e9ecef',
                              borderRadius: '5px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${analytic.highestScore}%`,
                                height: '100%',
                                backgroundColor: '#28a745'
                              }}></div>
                            </div>
                          </div>
                          
                          <div style={{ marginBottom: '15px' }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: '5px'
                            }}>
                              <span>Lowest Score:</span>
                              <span style={{ fontWeight: '600', color: '#dc3545' }}>{analytic.lowestScore}%</span>
                            </div>
                            <div style={{
                              height: '10px',
                              backgroundColor: '#e9ecef',
                              borderRadius: '5px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${analytic.lowestScore}%`,
                                height: '100%',
                                backgroundColor: '#dc3545'
                              }}></div>
                            </div>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '5px'
                          }}>
                            <span>Total Attempts:</span>
                            <span style={{ fontWeight: '600' }}>{analytic.attemptCount}</span>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}>
                            <span>Pass Rate:</span>
                            <span style={{ fontWeight: '600' }}>
                              {Math.round((analytic.passCount / analytic.attemptCount) * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherHome;