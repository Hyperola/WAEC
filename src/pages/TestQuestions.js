import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TestQuestions = () => {
  const { user } = useContext(AuthContext);
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    subject: '',
    class: '',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    image: null,
    saveToBank: false,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (testId) {
      fetchTest();
      fetchQuestions();
    }
  }, [testId]);

  const fetchTest = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTest(res.data);
      setSelectedQuestions(res.data.questions || []);
      setNewQuestion({ ...newQuestion, subject: res.data.subject, class: res.data.class });
      setError(null);
    } catch (err) {
      console.error('Fetch test error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Test not found. Please create a new test.');
    }
    setLoading(false);
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/questions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(res.data);
      setError(null);
    } catch (err) {
      console.error('Fetch questions error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to load questions. Please try again.');
    }
    setLoading(false);
  };

  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  const handleNewQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.text || newQuestion.options.some(opt => !opt) || !newQuestion.correctAnswer || !newQuestion.options.includes(newQuestion.correctAnswer)) {
      setError('Please fill all fields and ensure correct answer matches an option.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('subject', newQuestion.subject);
      formData.append('class', newQuestion.class);
      formData.append('text', newQuestion.text);
      formData.append('options', JSON.stringify(newQuestion.options));
      formData.append('correctAnswer', newQuestion.correctAnswer);
      if (newQuestion.image) {
        formData.append('image', newQuestion.image);
      }
      const res = await axios.post('http://localhost:5000/api/questions', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Question added successfully.');
      if (newQuestion.saveToBank) {
        setQuestions([...questions, res.data]);
      }
      setSelectedQuestions([...selectedQuestions, res.data._id]);
      setNewQuestion({ subject: test.subject, class: test.class, text: '', options: ['', '', '', ''], correctAnswer: '', image: null, saveToBank: false });
      setImagePreview(null);
    } catch (err) {
      console.error('New question error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to add question. Please try again.');
    }
    setLoading(false);
  };

  const handleSaveQuestions = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/tests/${testId}`, { questions: selectedQuestions }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Questions saved to test successfully.');
    } catch (err) {
      console.error('Save questions error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to save questions. Please try again.');
    }
    setLoading(false);
  };

  const handleDone = () => {
    navigate('/teacher-home');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewQuestion({ ...newQuestion, image: file });
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  if (!user || user.role !== 'teacher') return <p style={{ padding: '20px', color: 'red' }}>Access restricted to teachers.</p>;
  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;
  if (!test) return <p style={{ padding: '20px', color: 'red' }}>{error || 'Test not found.'}</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Add Questions to Test: {test.title}</h2>
      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>}
      <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Select Existing Questions</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Select</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Question Text</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Options</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Correct Answer</th>
          </tr>
        </thead>
        <tbody>
          {questions
            .filter(q => q.subject === test.subject && q.class === test.class)
            .map(q => (
              <tr key={q._id}>
                <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(q._id)}
                    onChange={() => handleQuestionToggle(q._id)}
                  />
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{q.text}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{q.options.join(', ')}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{q.correctAnswer}</td>
              </tr>
            ))}
        </tbody>
      </table>
      {questions.filter(q => q.subject === test.subject && q.class === test.class).length === 0 && (
        <p style={{ color: '#999', marginBottom: '20px' }}>No questions available for {test.subject} ({test.class}). Create new questions below.</p>
      )}
      <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Create New Question</h3>
      <form onSubmit={handleNewQuestionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        <input
          type="text"
          placeholder="Question Text"
          value={newQuestion.text}
          onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
          required
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        {newQuestion.options.map((opt, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            value={opt}
            onChange={(e) => {
              const newOptions = [...newQuestion.options];
              newOptions[index] = e.target.value;
              setNewQuestion({ ...newQuestion, options: newOptions });
            }}
            required
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        ))}
        <input
          type="text"
          placeholder="Correct Answer (e.g., Option 1 text)"
          value={newQuestion.correctAnswer}
          onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
          required
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px' }} />
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={newQuestion.saveToBank}
            onChange={(e) => setNewQuestion({ ...newQuestion, saveToBank: e.target.checked })}
          />
          Save to Question Bank
        </label>
        <button type="submit" disabled={loading} style={{ padding: '8px', background: loading ? '#ccc' : '#4bc0c0', color: 'white', border: 'none', borderRadius: '4px' }}>
          Add Question to Test
        </button>
      </form>
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={handleSaveQuestions} disabled={loading || selectedQuestions.length === 0} style={{ padding: '8px', background: loading || selectedQuestions.length === 0 ? '#ccc' : '#4bc0c0', color: 'white', border: 'none', borderRadius: '4px' }}>
          Save Questions
        </button>
        <button onClick={handleDone} style={{ padding: '8px', background: '#ccc', color: 'black', border: 'none', borderRadius: '4px' }}>
          Done
        </button>
      </div>
    </div>
  );
};

export default TestQuestions;