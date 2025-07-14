import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useTeacherData from '../../hooks/useTeacherData';
import axios from 'axios';
import { FiEdit2, FiPlusCircle, FiTrash2, FiBook, FiAlertTriangle, FiCheckCircle, FiAward } from 'react-icons/fi';

const ManageTests = () => {
  const { tests, fetchTests, error, success, setError, setSuccess, navigate } = useTeacherData();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleEditTest = (testId) => {
    if (!testId || !/^[0-9a-fA-F]{24}$/.test(testId)) {
      console.error('Edit test error: Invalid testId:', testId);
      setError('Invalid test ID. Please select a valid test.');
      return;
    }
    navigate(`/teacher/test-creation/${testId}`);
  };

  const handleAddQuestions = (testId) => {
    if (!testId || !/^[0-9a-fA-F]{24}$/.test(testId)) {
      console.error('Add questions error: Invalid testId:', testId);
      setError('Invalid test ID. Please select a valid test.');
      return;
    }
    navigate(`/teacher/test-creation/${testId}/add-questions`);
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) return;
    setDeletingId(id);
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
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Failed to delete test. Please try again.');
      }
    } finally {
      setLoading(false);
      setDeletingId(null);
    }
  };

  const getStatusBadge = (endDate) => {
    const isActive = new Date(endDate) > new Date();
    return {
      text: isActive ? 'Active' : 'Completed',
      color: isActive ? '#28a745' : '#718096',
      bgColor: isActive ? '#d4edda' : '#EDF2F7',
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Manage Tests</h2>
        <p style={styles.headerSubtitle}>View and manage all your created tests</p>
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

      <div style={styles.section}>
        {tests.length === 0 ? (
          <div style={styles.emptyState}>
            <FiBook style={styles.emptyIcon} />
            <h3 style={styles.emptyTitle}>No Tests Found</h3>
            <p style={styles.emptyText}>Create your first test to get started</p>
            <button onClick={() => navigate('/teacher/test-creation')} style={styles.createButton}>
              <FiPlusCircle style={styles.buttonIcon} />
              Create New Test
            </button>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Test Title</th>
                  <th style={styles.tableHeader}>Subject</th>
                  <th style={styles.tableHeader}>Class</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Dates</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(test => {
                  const status = getStatusBadge(test.availability?.end);
                  const startDate = new Date(test.availability?.start).toLocaleDateString();
                  const endDate = new Date(test.availability?.end).toLocaleDateString();
                  return (
                    <tr key={test._id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <div style={styles.testTitle}>{test.title}</div>
                        <div style={styles.testSession}>{test.session}</div>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.subjectBadge}>{test.subject}</span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.classBadge}>{test.class}</span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{ ...styles.statusBadge, backgroundColor: status.bgColor, color: status.color }}>
                          {status.text}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.dateRange}>
                          <div style={styles.dateLabel}>Start:</div>
                          <div>{startDate}</div>
                          <div style={{ ...styles.dateLabel, marginTop: '4px' }}>End:</div>
                          <div>{endDate}</div>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.actionButtons}>
                          <button onClick={() => handleEditTest(test._id)} style={styles.editButton}>
                            <FiEdit2 style={styles.buttonIcon} />
                            Edit
                          </button>
                          <button onClick={() => handleAddQuestions(test._id)} style={styles.questionsButton}>
                            <FiPlusCircle style={styles.buttonIcon} />
                            Questions
                          </button>
                          <Link
                            to={`/teacher/test-results/${test._id}`}
                            style={styles.resultsButton}
                          >
                            <FiAward style={styles.buttonIcon} />
                            View Results
                          </Link>
                          <button
                            onClick={() => handleDeleteTest(test._id)}
                            disabled={loading && deletingId === test._id}
                            style={{ ...styles.deleteButton, opacity: loading && deletingId === test._id ? 0.7 : 1 }}
                          >
                            <FiTrash2 style={styles.buttonIcon} />
                            {loading && deletingId === test._id ? 'Deleting...' : 'Delete'}
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
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'sans-serif',
    backgroundColor: '#f8f9fa',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    backgroundColor: '#4B5320',
    color: '#FFFFFF',
    padding: '25px',
    borderRadius: '8px',
    marginBottom: '25px',
    border: '1px solid #000000',
    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
  },
  headerSubtitle: {
    fontSize: '16px',
    margin: '0',
    color: '#D4A017',
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
    gap: '10px',
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
    gap: '10px',
  },
  alertIcon: {
    fontSize: '20px',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '25px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #E0E0E0',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
  },
  emptyIcon: {
    fontSize: '3rem',
    color: '#D4A017',
    marginBottom: '1rem',
  },
  emptyTitle: {
    color: '#4B5320',
    fontSize: '1.5rem',
    margin: '0 0 0.5rem',
  },
  emptyText: {
    color: '#666',
    fontSize: '1rem',
    margin: '0 0 1.5rem',
  },
  createButton: {
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
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#4B5320',
    color: '#FFFFFF',
    padding: '12px',
    textAlign: 'left',
    fontWeight: '600',
  },
  tableRow: {
    borderBottom: '1px solid #E0E0E0',
  },
  tableCell: {
    padding: '12px',
    verticalAlign: 'top',
  },
  testTitle: {
    fontWeight: '600',
    color: '#4B5320',
    marginBottom: '4px',
  },
  testSession: {
    fontSize: '14px',
    color: '#718096',
  },
  subjectBadge: {
    backgroundColor: '#E6FFFA',
    color: '#234E52',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
  },
  classBadge: {
    backgroundColor: '#EBF8FF',
    color: '#2C5282',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'inline-block',
  },
  dateRange: {
    fontSize: '14px',
  },
  dateLabel: {
    color: '#718096',
    fontSize: '12px',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    backgroundColor: '#D4A017',
    color: '#4B5320',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  questionsButton: {
    backgroundColor: '#4B5320',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  resultsButton: {
    backgroundColor: '#28a745',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    textDecoration: 'none',
  },
  deleteButton: {
    backgroundColor: '#B22222',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  buttonIcon: {
    fontSize: '16px',
  },
};

export default ManageTests;