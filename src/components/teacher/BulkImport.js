import React, { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import useTeacherData from '../../hooks/useTeacherData';
import { FiDownload, FiUpload, FiAlertTriangle, FiCheckCircle, FiClock } from 'react-icons/fi';

const BulkImport = () => {
  const { fetchQuestions, error, success, setError, setSuccess, navigate } = useTeacherData();
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDownloadTemplate = () => {
    const template = 'subject,class,questionText,option1,option2,option3,option4,correctAnswer,imageUrl\nMaths,SS1,What is 2+2?,2,4,6,8,4,\nEnglish,JS2,What is a noun?,Person,Action,Color,None of the above,Person,';
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
          setSuccess(`Successfully imported ${res.data.count} questions.`);
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

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Bulk Question Import</h2>
        <p style={styles.headerSubtitle}>Quickly add multiple questions using a CSV file</p>
      </div>

      {/* Alerts */}
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

      {/* Instructions */}
      <div style={styles.instructionCard}>
        <h3 style={styles.instructionTitle}>How to Import Questions</h3>
        <ol style={styles.instructionSteps}>
          <li>Download our CSV template file</li>
          <li>Fill it with your questions following the format</li>
          <li>Upload the completed file below</li>
        </ol>
        
        <button 
          onClick={handleDownloadTemplate}
          style={styles.downloadButton}
        >
          <FiDownload style={styles.buttonIcon} />
          Download CSV Template
        </button>
      </div>

      {/* CSV Format Example */}
      <div style={styles.formatExample}>
        <h3 style={styles.exampleTitle}>CSV Format Example</h3>
        <div style={styles.codeBlock}>
          <pre style={styles.codePre}>
            subject,class,questionText,option1,option2,option3,option4,correctAnswer,imageUrl{"\n"}
            Maths,SS1,What is 2+2?,2,4,6,8,4,{"\n"}
            English,JS2,What is a noun?,Person,Action,Color,None of the above,Person,https://example.com/noun.jpg
          </pre>
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleBulkQuestionSubmit} style={styles.uploadForm}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Select your CSV file</label>
          <div style={styles.fileUpload}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              required
              style={styles.fileInput}
            />
            <div style={styles.filePreview}>
              {csvFile ? (
                <span style={styles.fileName}>{csvFile.name}</span>
              ) : (
                <span style={styles.filePlaceholder}>Drag & drop your file here or click to browse</span>
              )}
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            ...styles.submitButton,
            backgroundColor: loading ? '#E0E0E0' : '#4B5320'
          }}
        >
          {loading ? (
            <>
              <FiClock style={styles.buttonIcon} />
              Processing...
            </>
          ) : (
            <>
              <FiUpload style={styles.buttonIcon} />
              Import Questions
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// Styles
const styles = {
  container: {
    fontFamily: 'sans-serif',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    maxWidth: '800px',
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
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '25px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #E0E0E0',
    marginBottom: '25px'
  },
  instructionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#4B5320',
    margin: '0 0 15px 0'
  },
  instructionSteps: {
    paddingLeft: '25px',
    margin: '0 0 20px 0',
    color: '#4B5320',
    lineHeight: '1.6'
  },
  instructionStepsLi: {
    marginBottom: '8px'
  },
  downloadButton: {
    backgroundColor: '#4B5320',
    color: '#FFFFFF',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s'
  },
  buttonIcon: {
    fontSize: '18px'
  },
  formatExample: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '25px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #E0E0E0',
    marginBottom: '25px'
  },
  exampleTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#4B5320',
    margin: '0 0 15px 0'
  },
  codeBlock: {
    backgroundColor: '#2D3748',
    color: '#E2E8F0',
    borderRadius: '6px',
    padding: '15px',
    overflowX: 'auto',
    fontFamily: 'monospace',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  codePre: {
    margin: '0'
  },
  uploadForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '25px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #E0E0E0'
  },
  formGroup: {
    marginBottom: '20px'
  },
  formLabel: {
    display: 'block',
    marginBottom: '10px',
    color: '#4B5320',
    fontWeight: '600'
  },
  fileUpload: {
    position: 'relative'
  },
  fileInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: '0',
    cursor: 'pointer'
  },
  filePreview: {
    border: '2px dashed #CBD5E0',
    borderRadius: '6px',
    padding: '30px',
    textAlign: 'center',
    backgroundColor: '#F8FAFC',
    transition: 'all 0.2s'
  },
  fileName: {
    color: '#4B5320',
    fontWeight: '500'
  },
  filePlaceholder: {
    color: '#718096'
  },
  submitButton: {
    width: '100%',
    color: '#FFFFFF',
    border: 'none',
    padding: '15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s'
  }
};

export default BulkImport;