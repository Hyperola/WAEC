import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const TestTaking = () => {
  const { user } = useContext(AuthContext);
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    const fetchTest = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again.');
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/api/tests/${testId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('TestTaking - Fetched test:', res.data);
        setTest(res.data);
        setQuestions(Array.isArray(res.data.questions) ? res.data.questions : []);
        setTimeLeft(res.data.duration * 60); // Convert minutes to seconds
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
  }, [user, testId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submission) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submission]);

  const handleAnswer = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleFlag = (questionId) => {
    setFlagged(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        `http://localhost:5000/api/tests/${testId}/submit`,
        { answers, userId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('TestTaking - Submission success:', res.data);
      setSubmission(res.data); // Store submission result
    } catch (err) {
      console.error('TestTaking - Submission error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to submit test.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
        fontFamily: 'sans-serif',
        color: '#4B5320',
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

  if (submission) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8F9FA',
        padding: '20px',
        fontFamily: 'sans-serif',
      }}>
        <header style={{
          backgroundColor: '#4B5320',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '8px',
          marginBottom: '20px',
        }}>
          <img src="/images/Sanni.png" alt="Sanniville Academy Logo" style={{ width: '80px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#FFFFFF', fontSize: '16px' }}>{user.name}</span>
            <img
              src={user.profileImage || '/images/default1.png'}
              alt="Profile"
              style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #E0E0E0' }}
            />
          </div>
        </header>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#FFFFFF',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{ color: '#4B5320', fontSize: '20px', marginBottom: '20px' }}>
            Test Results: {test.title} ({test.subject} - {test.class})
          </h2>
          <p style={{ color: '#4B5320', fontSize: '16px', marginBottom: '20px' }}>
            Score: {submission.score} / {submission.totalQuestions} (
            {Math.round((submission.score / submission.totalQuestions) * 100)}%)
          </p>
          {submission.answers.map((result, index) => {
            const question = questions.find(q => q._id === result.questionId);
            return (
              <div key={index} style={{
                marginBottom: '20px',
                padding: '15px',
                border: `1px solid ${result.isCorrect ? '#4B5320' : '#B22222'}`,
                borderRadius: '4px',
                backgroundColor: result.isCorrect ? '#F8F9FA' : '#FFF3F3'
              }}>
                <h3 style={{ color: '#4B5320', fontSize: '16px', marginBottom: '10px' }}>
                  Question {index + 1}: {question?.text}
                </h3>
                <p style={{ color: '#4B5320', fontSize: '14px' }}>
                  Your Answer: {result.selectedAnswer || 'Not answered'}
                </p>
                <p style={{ color: result.isCorrect ? '#4B5320' : '#B22222', fontSize: '14px' }}>
                  Correct Answer: {question?.correctAnswer}
                </p>
                <p style={{ color: result.isCorrect ? '#4B5320' : '#B22222', fontSize: '14px' }}>
                  {result.isCorrect ? 'Correct' : 'Incorrect'}
                </p>
              </div>
            );
          })}
          <button
            onClick={() => window.location.href = '/student/tests'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#D4A017',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '20px'
            }}
          >
            Back to Tests
          </button>
        </div>
        <footer style={{
          textAlign: 'center',
          color: '#E0E0E0',
          backgroundColor: '#4B5320',
          padding: '10px',
          marginTop: '20px',
          borderRadius: '4px',
          fontSize: '12px',
        }}>
          Powered by <a href="https://devsannisystems.com" style={{ color: '#D4A017', textDecoration: 'none' }} onMouseOver={e => e.target.style.color = '#F5F5F5'} onMouseOut={e => e.target.style.color = '#D4A017'}>Devsanni Systems</a>
        </footer>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F9FA',
      padding: '20px',
      fontFamily: 'sans-serif',
    }}>
      <header style={{
        backgroundColor: '#4B5320',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <img src="/images/Sanni.png" alt="Sanniville Academy Logo" style={{ width: '80px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#FFFFFF', fontSize: '16px' }}>{user.name}</span>
          <img
            src={user.profileImage || '/images/default1.png'}
            alt="Profile"
            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #E0E0E0' }}
          />
        </div>
      </header>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ color: '#4B5320', fontSize: '20px' }}>
            {test.title} ({test.subject} - {test.class})
          </h2>
          <div style={{ color: '#4B5320', fontSize: '16px', fontWeight: 'bold' }}>
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>
        <div style={{
          height: '10px',
          backgroundColor: '#E0E0E0',
          borderRadius: '5px',
          marginBottom: '20px',
        }}>
          <div style={{
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            height: '100%',
            backgroundColor: '#D4A017',
            borderRadius: '5px',
            transition: 'width 0.3s',
          }} />
        </div>
        <p style={{ color: '#4B5320', fontSize: '16px', marginBottom: '10px' }}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#4B5320', fontSize: '18px', marginBottom: '10px' }}>
            {currentQuestion.text}
          </h3>
          {currentQuestion.image && (
            <img
              src={currentQuestion.image}
              alt="Question"
              style={{ maxWidth: '300px', marginBottom: '10px', borderRadius: '4px' }}
            />
          )}
          {currentQuestion.options.map((option, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4B5320' }}>
                <input
                  type="radio"
                  name={`question-${currentQuestion._id}`}
                  checked={answers[currentQuestion._id] === option}
                  onChange={() => handleAnswer(currentQuestion._id, option)}
                  style={{ accentColor: '#D4A017' }}
                />
                {option}
              </label>
            </div>
          ))}
          <button
            onClick={() => handleFlag(currentQuestion._id)}
            style={{
              padding: '8px 16px',
              backgroundColor: flagged[currentQuestion._id] ? '#B22222' : '#D4A017',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            {flagged[currentQuestion._id] ? 'Unflag Question' : 'Flag Question'}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            style={{
              padding: '10px 20px',
              backgroundColor: currentQuestionIndex === 0 ? '#E0E0E0' : '#D4A017',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>
          <button
            onClick={currentQuestionIndex === questions.length - 1 ? handleSubmit : handleNext}
            style={{
              padding: '10px 20px',
              backgroundColor: '#D4A017',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Submit Test' : 'Next'}
          </button>
        </div>
      </div>
      <footer style={{
        textAlign: 'center',
        color: '#E0E0E0',
        backgroundColor: '#4B5320',
        padding: '10px',
        marginTop: '20px',
        borderRadius: '4px',
        fontSize: '12px',
      }}>
        Powered by <a href="https://devsannisystems.com" style={{ color: '#D4A017', textDecoration: 'none' }} onMouseOver={e => e.target.style.color = '#F5F5F5'} onMouseOut={e => e.target.style.color = '#D4A017'}>Devsanni Systems</a>
      </footer>
    </div>
  );
};

export default TestTaking;