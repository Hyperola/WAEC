import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Tests = () => {
  const { user } = useContext(AuthContext);
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tests', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTests(res.data);
      } catch (error) {
        console.error('Tests - Error:', error.response?.data);
      }
    };
    fetchTests();
  }, []);

  if (!user || user.role !== 'student') {
    return <p>Access restricted to students.</p>;
  }

  return (
    <div>
      <h2>Available Tests</h2>
      {tests.length === 0 ? (
        <p>No tests available</p>
      ) : (
        <ul>
          {tests.map((test) => (
            <li key={test._id}>
              {test.title} ({test.subject}/{test.class})
              <button onClick={() => navigate(`/test/${test._id}`)}>Take Test</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Tests;