import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiSave, FiX, FiAlertTriangle, FiCheckCircle, FiClock, FiFileText } from 'react-icons/fi';

const TestCreation = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { testId } = useParams();
  const [testForm, setTestForm] = useState({
    title: '',
    subject: '',
    class: '',
    session: '2025/2026 Semester 1',
    startDate: '',
    endDate: '',
    duration: '',
    questionCount: '',
    randomize: false,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showQuestionPrompt, setShowQuestionPrompt] = useState(false);

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
          setTestForm({
            title: res.data.title,
            subject: res.data.subject,
            class: res.data.class,
            session: res.data.session,
            startDate: res.data.availability?.start?.slice(0, 16) || '',
            endDate: res.data.availability?.end?.slice(0, 16) || '',
            duration: res.data.duration,
            questionCount: res.data.questions?.length || '',
            randomize: res.data.randomize,
          });
          setError(null);
        } catch (err) {
          console.error('Fetch test error:', {
            error: err.message,
            status: err.response?.status,
            data: err.response?.data,
          });
          setError(err.response?.data?.error || 'Failed to load test. Please try again.');
        }
        setLoading(false);
      };
      fetchTest();
    }
  }, [testId]);

  const validateForm = () => {
    if (!testForm.title || !testForm.subject || !testForm.class || !testForm.session ||
        !testForm.startDate || !testForm.endDate || !testForm.duration || !testForm.questionCount) {
      setError('Please fill all required fields.');
      return false;
    }
    const startDate = new Date(testForm.startDate);
    const endDate = new Date(testForm.endDate);
    if (isNaN(startDate) || isNaN(endDate)) {
      setError('Invalid start or end date.');
      return false;
    }
    if (endDate <= startDate) {
      setError('End date must be after start date.');
      return false;
    }
    if (testForm.duration <= 0 || testForm.questionCount <= 0) {
      setError('Duration and question count must be positive numbers.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowQuestionPrompt(true);
  };

  const handleAddQuestions = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');
      const payload = {
        title: testForm.title,
        subject: testForm.subject,
        class: testForm.class,
        session: testForm.session,
        availability: {
          start: new Date(testForm.startDate).toISOString(),
          end: new Date(testForm.endDate).toISOString(),
        },
        duration: Number(testForm.duration),
        randomize: testForm.randomize,
      };
      console.log('Submitting test payload:', JSON.stringify(payload, null, 2));
      let res;
      if (testId) {
        res = await axios.put(`http://localhost:5000/api/tests/${testId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Test updated successfully.');
      } else {
        res = await axios.post('http://localhost:5000/api/tests', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Test created successfully.');
      }
      console.log('Backend response:', JSON.stringify(res.data, null, 2));
      const newTestId = testId || res.data.testId;
      if (!newTestId) throw new Error('Test ID not returned in response');
      setShowQuestionPrompt(false);
      navigate(`/teacher/test-creation/${newTestId}/questions`, { state: { testForm } });
    } catch (err) {
      console.error('Test submit error:', {
        error: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.response?.data?.error || 'Failed to save test. Please try again.');
    }
    setLoading(false);
  };

  const handleSaveWithoutQuestions = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');
      const payload = {
        title: testForm.title,
        subject: testForm.subject,
        class: testForm.class,
        session: testForm.session,
        availability: {
          start: new Date(testForm.startDate).toISOString(),
          end: new Date(testForm.endDate).toISOString(),
        },
        duration: Number(testForm.duration),
        randomize: testForm.randomize,
      };
      console.log('Submitting test payload:', JSON.stringify(payload, null, 2));
      let res;
      if (testId) {
        res = await axios.put(`http://localhost:5000/api/tests/${testId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Test updated successfully.');
      } else {
        res = await axios.post('http://localhost:5000/api/tests', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess('Test created successfully.');
      }
      console.log('Backend response:', JSON.stringify(res.data, null, 2));
      const newTestId = testId || res.data.testId;
      if (!newTestId) throw new Error('Test ID not returned in response');
      setShowQuestionPrompt(false);
      navigate('/teacher/dashboard');
    } catch (err) {
      console.error('Test submit error:', {
        error: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.response?.data?.error || 'Failed to save test. Please try again.');
    }
    setLoading(false);
  };

  if (!user || user.role !== 'teacher') {
    return (
      <div style={styles.accessDenied}>
        <h2>Access Restricted</h2>
        <p>This page is only available to authorized teachers.</p>
      </div>
    );
  }

  if (loading) return <div style={styles.loading}>Loading Test Details...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>{testId ? 'Edit Test' : 'Create New Test'}</h2>
        <p style={styles.headerSubtitle}>Configure test details and availability</p>
      </div>

      {error && (
        <div style={styles.alertError}>
          <FiAlertTriangle style={styles.alertIcon} />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div style={styles.alertSuccess}>
          <FiCheckCircle style={styles.alertIcon} />
          <span>{success}</span>
        </div>
      )}

      {showQuestionPrompt && (
        <div style={styles.prompt}>
          <h3 style={styles.promptTitle}>Add Questions Now?</h3>
          <p style={styles.promptText}>
            Would you like to add questions to your test now? You need to add {testForm.questionCount} questions.
          </p>
          <div style={styles.promptActions}>
            <button
              onClick={handleAddQuestions}
              style={styles.promptButton}
            >
              <FiFileText style={styles.buttonIcon} />
              Add Questions
            </button>
            <button
              onClick={handleSaveWithoutQuestions}
              style={styles.promptCancelButton}
            >
              <FiSave style={styles.buttonIcon} />
              Save Without Questions
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          <div style={styles.formColumn}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Test Title*</label>
              <input
                type="text"
                value={testForm.title}
                onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                required
                style={styles.input}
                placeholder="Midterm Examination"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Subject*</label>
              <select
                value={testForm.subject}
                onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })}
                required
                style={styles.select}
              >
                <option value="">Select Subject</option>
                {(user.subjects || []).map(sub => (
                  <option key={sub._id} value={sub.subject}>{sub.subject}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Class*</label>
              <select
                value={testForm.class}
                onChange={(e) => setTestForm({ ...testForm, class: e.target.value })}
                required
                style={styles.select}
              >
                <option value="">Select Class</option>
                {(user.subjects || []).map(sub => (
                  <option key={sub._id} value={sub.class}>{sub.class}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Academic Session*</label>
              <input
                type="text"
                value={testForm.session}
                onChange={(e) => setTestForm({ ...testForm, session: e.target.value })}
                required
                style={styles.input}
                placeholder="2025/2026 Semester 1"
              />
            </div>
          </div>

          <div style={styles.formColumn}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Start Date & Time*</label>
              <input
                type="datetime-local"
                value={testForm.startDate}
                onChange={(e) => setTestForm({ ...testForm, startDate: e.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>End Date & Time*</label>
              <input
                type="datetime-local"
                value={testForm.endDate}
                onChange={(e) => setTestForm({ ...testForm, endDate: e.target.value })}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Duration (minutes)*</label>
              <input
                type="number"
                value={testForm.duration}
                onChange={(e) => setTestForm({ ...testForm, duration: e.target.value })}
                required
                style={styles.input}
                min="1"
                placeholder="60"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Number of Questions*</label>
              <input
                type="number"
                value={testForm.questionCount}
                onChange={(e) => setTestForm({ ...testForm, questionCount: e.target.value })}
                required
                style={styles.input}
                min="1"
                placeholder="20"
              />
            </div>

            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="randomize"
                checked={testForm.randomize}
                onChange={(e) => setTestForm({ ...testForm, randomize: e.target.checked })}
                style={styles.checkbox}
              />
              <label htmlFor="randomize" style={styles.checkboxLabel}>
                Randomize Question Order
              </label>
            </div>
          </div>
        </div>

        <div style={styles.formActions}>
          <button
            type="button"
            onClick={() => navigate('/teacher/dashboard')}
            style={styles.cancelButton}
          >
            <FiX style={styles.buttonIcon} />
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={styles.submitButton}
          >
            {loading ? (
              <>
                <FiClock style={styles.buttonIcon} />
                Processing...
              </>
            ) : (
              <>
                <FiSave style={styles.buttonIcon} />
                {testId ? 'Update Test' : 'Create Test'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'sans-serif',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  header: {
    backgroundColor: '#4B5320',
    color: '#FFFFFF',
    padding: '25px',
    borderRadius: '8px',
    marginBottom: '25px',
    border: '1px solid #000000',
    boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 10px 0'
  },
  headerSubtitle: {
    fontSize: '16px',
    margin: '0',
    color: '#D4A017'
  },
  alertError: {
    backgroundColor: '#FFF3F3',
    color: '#B22222',
    borderLeft: '4px solid #B22222',
    padding: '15px',
    marginBottom: '25px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  alertSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
    borderLeft: '4px solid #28a745',
    padding: '15px',
    marginBottom: '25px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  alertIcon: {
    fontSize: '20px'
  },
  prompt: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '25px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  promptTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#4B5320',
    margin: '0 0 10px 0'
  },
  promptText: {
    fontSize: '14px',
    color: '#4B5320',
    margin: '0 0 20px 0'
  },
  promptActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px'
  },
  promptButton: {
    backgroundColor: '#4B5320',
    color: '#FFFFFF',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  promptCancelButton: {
    backgroundColor: 'transparent',
    color: '#4B5320',
    border: '1px solid #4B5320',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '25px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #E0E0E0'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '25px'
  },
  formColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    color: '#4B5320',
    fontWeight: '600',
    fontSize: '14px'
  },
  input: {
    padding: '12px',
    border: '1px solid #E0E0E0',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  select: {
    padding: '12px',
    border: '1px solid #E0E0E0',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    transition: 'all 0.2s'
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#4B5320'
  },
  checkboxLabel: {
    color: '#4B5320',
    fontSize: '14px'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '20px'
  },
  cancelButton: {
    backgroundColor: 'transparent',
    color: '#4B5320',
    border: '1px solid #4B5320',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  submitButton: {
    backgroundColor: '#4B5320',
    color: '#FFFFFF',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  buttonIcon: {
    fontSize: '18px'
  },
  accessDenied: {
    textAlign: 'center',
    padding: '4rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '2rem auto'
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '2rem auto'
  }
};

export default TestCreation;