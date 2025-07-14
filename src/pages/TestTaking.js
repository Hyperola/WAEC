import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const TestTaking = () => {
  const { testId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again.');
        navigate('/login');
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/api/tests/${testId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('TestTaking - Fetched test:', res.data);
        setTest(res.data);
        setQuestions(res.data.questions || []);
        setTimeLeft(res.data.duration * 60);
        setLoading(false);
      } catch (err) {
        console.error('TestTaking - Error:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load test.');
        setLoading(false);
      }
    };

    if (user && user.role === 'student') {
      fetchTest();
    }
  }, [testId, user, navigate]);

  useEffect(() => {
    if (timeLeft === null || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleFlag = (questionId) => {
    setFlaggedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `http://localhost:5000/api/tests/${testId}/submit`,
        { answers, userId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('TestTaking - Submission success');
      setIsSubmitted(true);
    } catch (err) {
      console.error('TestTaking - Submission error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to submit test.');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!user || user.role !== 'student') {
    return (
      <div style={{
        padding: '20px',
        color: '#B22222',
        fontFamily: 'sans-serif',
        backgroundColor: '#FFF3F3',
        minHeight: '100vh',
        textAlign: 'center'
      }}>
        Access restricted to students.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        color: '#4B5320',
        fontFamily: 'sans-serif',
        backgroundColor: '#F8F9FA',
        minHeight: '100vh',
        textAlign: 'center'
      }}>
        Loading test...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        color: '#B22222',
        fontFamily: 'sans-serif',
        backgroundColor: '#FFF3F3',
        minHeight: '100vh',
        textAlign: 'center'
      }}>
        Error: {error}
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div style={{
        padding: '20px',
        color: '#4B5320',
        fontFamily: 'sans-serif',
        backgroundColor: '#F8F9FA',
        minHeight: '100vh',
        textAlign: 'center'
      }}>
        No questions available for this test.
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F9FA',
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      <h2 style={{ color: '#4B5320', fontSize: '24px', marginBottom: '20px' }}>
        {test.title} - {test.subject} ({test.class})
      </h2>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#FFFFFF',
        borderRadius: '6px',
        border: '1px solid #E0E0E0'
      }}>
        <div>Time Left: {formatTime(timeLeft)}</div>
        <div>Question {currentQuestionIndex + 1} of {questions.length}</div>
      </div>
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '20px',
        borderRadius: '6px',
        border: '1px solid #E0E0E0',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: '#4B5320', fontSize: '18px', marginBottom: '10px' }}>
          {currentQuestion.text}
        </h3>
        {currentQuestion.imageUrl && (
          <img
            src={currentQuestion.imageUrl}
            alt="Question"
            style={{ maxWidth: '100%', marginBottom: '10px' }}
          />
        )}
        {currentQuestion.options.map((option, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', color: '#4B5320' }}>
              <input
                type="radio"
                name={`question-${currentQuestion._id}`}
                value={option}
                checked={answers[currentQuestion._id] === option}
                onChange={() => handleAnswer(currentQuestion._id, option)}
                disabled={isSubmitted}
                style={{ marginRight: '10px' }}
              />
              {option}
            </label>
          </div>
        ))}
        <button
          onClick={() => handleFlag(currentQuestion._id)}
          style={{
            padding: '10px',
            backgroundColor: flaggedQuestions.includes(currentQuestion._id) ? '#B22222' : '#D4A017',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          {flaggedQuestions.includes(currentQuestion._id) ? 'Unflag' : 'Flag'}
        </button>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0 || isSubmitted}
          style={{
            padding: '10px 20px',
            backgroundColor: currentQuestionIndex === 0 || isSubmitted ? '#E0E0E0' : '#D4A017',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            cursor: currentQuestionIndex === 0 || isSubmitted ? 'not-allowed' : 'pointer'
          }}
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
          disabled={currentQuestionIndex === questions.length - 1 || isSubmitted}
          style={{
            padding: '10px 20px',
            backgroundColor: currentQuestionIndex === questions.length - 1 || isSubmitted ? '#E0E0E0' : '#D4A017',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            cursor: currentQuestionIndex === questions.length - 1 || isSubmitted ? 'not-allowed' : 'pointer'
          }}
        >
          Next
        </button>
      </div>
      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          style={{
            padding: '10px 20px',
            backgroundColor: Object.keys(answers).length < questions.length ? '#E0E0E0' : '#D4A017',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            cursor: Object.keys(answers).length < questions.length ? 'not-allowed' : 'pointer'
          }}
        >
          Submit Test
        </button>
      )}
      {isSubmitted && (
        <div style={{
          marginTop: '20px',
          backgroundColor: '#FFFFFF',
          padding: '20px',
          borderRadius: '6px',
          border: '1px solid #E0E0E0',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#4B5320', fontSize: '18px', marginBottom: '10px' }}>
            Test submitted successfully!
          </h3>
        </div>
      )}
    </div>
  );
};

export default TestTaking;