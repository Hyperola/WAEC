import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useTeacherData from '../../hooks/useTeacherData';
import axios from 'axios';
import { FiSave, FiX, FiAlertTriangle, FiCheckCircle, FiImage } from 'react-icons/fi';

const AddQuestion = () => {
  const { user, questions, fetchQuestions, error, success, setError, setSuccess } = useTeacherData();
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questionForm, setQuestionForm] = useState({
    subject: '',
    class: '',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    image: null,
    saveToBank: true,
  });
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showQuestionPreview, setShowQuestionPreview] = useState(false);
  const [loading, setLoading] = useState(false);

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
      if (testId) {
        formData.append('testId', testId);
      }
      console.log('Submitting question:', { testId, subject: questionForm.subject, class: questionForm.class });
      let res;
      if (editQuestionId) {
        res = await axios.put(`http://localhost:5000/api/questions/${editQuestionId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Question updated successfully.');
        setEditQuestionId(null);
      } else {
        res = await axios.post('http://localhost:5000/api/questions', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        setSuccess(testId ? 'Question added to test and bank successfully.' : 'Question added to bank successfully.');
      }
      setQuestionForm({ subject: '', class: '', text: '', options: ['', '', '', ''], correctAnswer: '', image: null, saveToBank: true });
      setImagePreview(null);
      setShowQuestionPreview(false);
      fetchQuestions();
      if (testId) {
        navigate(`/teacher/test-creation/${testId}/questions`);
      } else {
        navigate('/teacher/questions');
      }
    } catch (err) {
      console.error('Question submit error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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

  if (!user || user.role !== 'teacher') {
    return (
      <div style={styles.accessDenied}>
        <h2>Access Restricted</h2>
        <p>This page is only available to authorized teachers.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>{editQuestionId ? 'Edit Question' : 'Add New Question'}</h2>
        <p style={styles.headerSubtitle}>
          {testId ? `Add question to test (ID: ${testId})` : 'Add question to your question bank'}
        </p>
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
        <form onSubmit={handleQuestionSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Subject*</label>
            <select
              value={questionForm.subject}
              onChange={(e) => setQuestionForm({ ...questionForm, subject: e.target.value })}
              required
              style={styles.select}
            >
              <option value="">Select Subject</option>
              {(user.subjects || []).map(sub => (
                <option key={sub._id} value={sub.subject}>{sub.subject} ({sub.class})</option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Class*</label>
            <select
              value={questionForm.class}
              onChange={(e) => setQuestionForm({ ...questionForm, class: e.target.value })}
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
            <label style={styles.label}>Question Text*</label>
            <textarea
              placeholder="Enter the question..."
              value={questionForm.text}
              onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
              required
              style={styles.textarea}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Options*</label>
            {questionForm.options.map((option, index) => (
              <div key={index} style={styles.optionGroup}>
                <span style={styles.optionNumber}>{index + 1}</span>
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
                  style={styles.input}
                />
              </div>
            ))}
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Correct Answer*</label>
            <select
              value={questionForm.correctAnswer}
              onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
              required
              style={styles.select}
            >
              <option value="">Select Correct Option</option>
              {questionForm.options.map((option, index) => (
                option ? <option key={index} value={option}>Option {index + 1}: {option}</option> : null
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Question Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={styles.fileInput}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
            )}
          </div>
          {!editQuestionId && (
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="saveToBank"
                checked={questionForm.saveToBank}
                onChange={(e) => setQuestionForm({ ...questionForm, saveToBank: e.target.checked })}
                style={styles.checkbox}
              />
              <label htmlFor="saveToBank" style={styles.checkboxLabel}>Save to Question Bank</label>
            </div>
          )}
          <div style={styles.formActions}>
            <button
              type="button"
              onClick={() => {
                setEditQuestionId(null);
                setQuestionForm({ subject: '', class: '', text: '', options: ['', '', '', ''], correctAnswer: '', image: null, saveToBank: true });
                setImagePreview(null);
                setShowQuestionPreview(false);
                navigate(testId ? `/teacher/test-creation/${testId}/questions` : '/teacher/questions');
              }}
              style={styles.cancelButton}
            >
              <FiX style={styles.buttonIcon} />
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePreviewQuestion}
              disabled={!isQuestionValid()}
              style={isQuestionValid() ? styles.previewButton : { ...styles.previewButton, backgroundColor: '#ccc', cursor: 'not-allowed' }}
            >
              <FiImage style={styles.buttonIcon} />
              Preview Question
            </button>
            <button
              type="submit"
              disabled={loading || !isQuestionValid()}
              style={isQuestionValid() ? styles.submitButton : { ...styles.submitButton, backgroundColor: '#ccc', cursor: 'not-allowed' }}
            >
              <FiSave style={styles.buttonIcon} />
              {editQuestionId ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>

      {showQuestionPreview && (
        <div style={styles.previewSection}>
          <h3 style={styles.sectionTitle}>Question Preview</h3>
          <div style={styles.previewContent}>
            <div style={styles.previewTags}>
              <span style={styles.subjectTag}>{questionForm.subject}</span>
              <span style={styles.classTag}>{questionForm.class}</span>
            </div>
            <p style={styles.previewText}>{questionForm.text}</p>
            {imagePreview && (
              <img src={imagePreview} alt="Question" style={styles.previewImage} />
            )}
            {questionForm.options.map((option, index) => (
              <div key={index} style={option === questionForm.correctAnswer ? styles.correctOption : styles.option}>
                <input
                  type="radio"
                  checked={option === questionForm.correctAnswer}
                  readOnly
                  style={styles.radio}
                />
                <span>{option}</span>
                {option === questionForm.correctAnswer && (
                  <span style={styles.correctLabel}>✓ Correct Answer</span>
                )}
              </div>
            ))}
            <button
              onClick={() => setShowQuestionPreview(false)}
              style={styles.closePreviewButton}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'sans-serif',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    maxWidth: '1000px',
    margin: '0 auto',
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
    marginBottom: '25px',
  },
  form: {
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    color: '#4B5320',
    fontWeight: '600',
    fontSize: '14px',
  },
  input: {
    padding: '12px',
    border: '1px solid #E0E0E0',
    borderRadius: '6px',
    fontSize: '16px',
  },
  textarea: {
    padding: '12px',
    border: '1px solid #E0E0E0',
    borderRadius: '6px',
    minHeight: '100px',
    fontSize: '16px',
    resize: 'vertical',
  },
  select: {
    padding: '12px',
    border: '1px solid #E0E0E0',
    borderRadius: '6px',
    fontSize: '16px',
    backgroundColor: 'white',
  },
  fileInput: {
    padding: '10px',
    border: '1px dashed #E0E0E0',
    borderRadius: '6px',
  },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '200px',
    border: '1px solid #E0E0E0',
    borderRadius: '4px',
    marginTop: '15px',
  },
  optionGroup: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  optionNumber: {
    display: 'inline-block',
    width: '24px',
    height: '24px',
    backgroundColor: '#4B5320',
    color: 'white',
    borderRadius: '50%',
    textAlign: 'center',
    lineHeight: '24px',
    marginRight: '10px',
    fontWeight: 'bold',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#4B5320',
  },
  checkboxLabel: {
    color: '#4B5320',
    fontSize: '14px',
  },
  formActions: {
    display: 'flex',
    gap: '15px',
    marginTop: '30px',
    justifyContent: 'flex-end',
  },
  submitButton: {
    backgroundColor: '#4B5320',
    color: '#FFFFFF',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  previewButton: {
    backgroundColor: '#D4A017',
    color: '#4B5320',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    color: '#4B5320',
    border: '1px solid #4B5320',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  buttonIcon: {
    fontSize: '18px',
  },
  previewSection: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #E0E0E0',
    borderRadius: '8px',
    padding: '25px',
    marginTop: '40px',
  },
  sectionTitle: {
    color: '#4B5320',
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 20px 0',
  },
  previewContent: {
    padding: '15px',
  },
  previewTags: {
    marginBottom: '15px',
  },
  subjectTag: {
    backgroundColor: '#4B5320',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '14px',
    marginRight: '10px',
  },
  classTag: {
    backgroundColor: '#D4A017',
    color: '#4B5320',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '14px',
  },
  previewText: {
    fontSize: '18px',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #E0E0E0',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '300px',
    border: '1px solid #E0E0E0',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
    padding: '12px',
    backgroundColor: 'white',
    border: '1px solid #E0E0E0',
    borderRadius: '4px',
  },
  correctOption: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
    padding: '12px',
    backgroundColor: '#d4edda',
    border: '1px solid #28a745',
    borderRadius: '4px',
  },
  radio: {
    marginRight: '10px',
  },
  correctLabel: {
    marginLeft: 'auto',
    color: '#28a745',
    fontWeight: '600',
  },
  closePreviewButton: {
    backgroundColor: 'transparent',
    color: '#4B5320',
    border: '1px solid #4B5320',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
    display: 'block',
    marginLeft: 'auto',
  },
  accessDenied: {
    textAlign: 'center',
    padding: '4rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '2rem auto',
  },
};

export default AddQuestion;