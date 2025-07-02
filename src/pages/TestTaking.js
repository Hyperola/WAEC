import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const TestTaking = () => {
  const { user } = useContext(AuthContext);
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [user, testId, navigate]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
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
  }, [timeLeft]);

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
      navigate('/results');
    } catch (err) {
      console.error('TestTaking - Submission error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to submit test.');
    }
  };

  if (!user || user.role !== 'student') {
    return <p style={{ padding: '20px', color: '#FF6B6B', fontFamily: 'Poppins, sans-serif' }}>Access restricted to students.</p>;
  }

  if (loading) {
    return <div style={{ padding: '20px', fontFamily: 'Poppins, sans-serif', color: '#4B7043' }}>Loading test...</div>;
  }

  if (error) {
    return <p style={{ padding: '20px', color: '#FF6B6B', fontFamily: 'Poppins, sans-serif' }}>{error}</p>;
  }

  if (!test || questions.length === 0) {
    return <p style={{ padding: '20px', color: '#333333', fontFamily: 'Poppins, sans-serif' }}>No questions available for this test.</p>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#A8B5A2',
      backgroundImage: `url('/images/Sanni.png')`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'contain',
      backgroundOpacity: 0.1,
      padding: '20px',
      fontFamily: 'Poppins, sans-serif',
    }}>
      <header style={{
        backgroundColor: '#4B7043',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <img src="/images/Sanni.png" alt="Sanniville Academy Logo" style={{ width: '80px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'white', fontSize: '16px' }}>{user.name}</span>
          <img
            src={user.profileImage || '/images/default1.png'}
            alt="Profile"
            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #A8B5A2' }}
          />
        </div>
      </header>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ color: '#4B7043', fontSize: '20px' }}>
            {test.title} ({test.subject} - {test.class})
          </h2>
          <div style={{ color: '#4B7043', fontSize: '16px', fontWeight: 'bold' }}>
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>
        <div style={{
          height: '10px',
          backgroundColor: '#F4F4F4',
          borderRadius: '5px',
          marginBottom: '20px',
        }}>
          <div style={{
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            height: '100%',
            backgroundColor: '#4B7043',
            borderRadius: '5px',
            transition: 'width 0.3s',
          }} />
        </div>
        <p style={{ color: '#333333', fontSize: '16px', marginBottom: '10px' }}>
          You’ve got this, {user.name}! Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#333333', fontSize: '18px', marginBottom: '10px' }}>
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
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#333333' }}>
                <input
                  type="radio"
                  name={`question-${currentQuestion._id}`}
                  checked={answers[currentQuestion._id] === option}
                  onChange={() => handleAnswer(currentQuestion._id, option)}
                  style={{ accentColor: '#4B7043' }}
                />
                {option}
              </label>
            </div>
          ))}
          <button
            onClick={() => handleFlag(currentQuestion._id)}
            style={{
              padding: '8px 16px',
              backgroundColor: flagged[currentQuestion._id] ? '#FF6B6B' : '#4B7043',
              color: 'white',
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
              backgroundColor: currentQuestionIndex === 0 ? '#A8B5A2' : '#4B7043',
              color: 'white',
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
              backgroundColor: '#4B7043',
              color: 'white',
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
        color: '#A8B5A2',
        backgroundColor: '#333333',
        padding: '10px',
        marginTop: '20px',
        borderRadius: '4px',
        fontSize: '12px',
      }}>
        Powered by <a href="https://devsannisystems.com" style={{ color: '#A8B5A2', textDecoration: 'none' }} onMouseOver={e => e.target.style.color = '#4B7043'} onMouseOut={e => e.target.style.color = '#A8B5A2'}>Devsanni Systems</a>
      </footer>
    </div>
  );
};

export default TestTaking;