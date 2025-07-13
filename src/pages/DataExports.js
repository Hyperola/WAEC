import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

const DataExports = () => {
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchResults();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users.');
    }
    setLoading(false);
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/results', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load results.');
    }
    setLoading(false);
  };

  const exportStudents = () => {
    const data = users.map(user => ({
      username: user.username,
      name: user.name,
      surname: user.surname,
      role: user.role,
      class: user.class || 'N/A',
      subjects: user.role === 'teacher' ? user.subjects.map(s => s.subject).join(';') : user.enrolledSubjects.map(s => s.subject).join(';'),
    }));
    const csv = Papa.unparse(data);
    downloadCSV(csv, 'students_export.csv');
  };

  const exportResults = () => {
    const data = results.map(result => ({
      student: result.userId ? `${result.userId.name} ${result.userId.surname}` : 'Unknown',
      testId: result.testId._id,
      testTitle: result.testId.title,
      subject: result.subject,
      class: result.class,
      session: result.session,
      score: result.score,
    }));
    const csv = Papa.unparse(data);
    downloadCSV(csv, 'results_export.csv');
  };

  const exportReport = () => {
    const reportData = results.reduce((acc, result) => {
      const studentKey = result.userId ? `${result.userId.name} ${result.userId.surname}` : 'Unknown';
      if (!acc[studentKey]) {
        acc[studentKey] = {
          student: studentKey,
          class: result.class,
          subjects: {},
        };
      }
      acc[studentKey].subjects[result.subject] = result.score;
      return acc;
    }, {});
    const data = Object.values(reportData).map(student => ({
      student: student.student,
      class: student.class,
      ...student.subjects,
    }));
    const csv = Papa.unparse(data);
    downloadCSV(csv, 'report_export.csv');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) return <p style={{ padding: '20px', color: '#FFFFFF', backgroundColor: '#4B5320', textAlign: 'center', fontFamily: 'sans-serif', fontSize: '16px' }}>Loading...</p>;

  return (
    <div>
      {error && <p style={{ backgroundColor: '#FFF3F3', color: '#B22222', borderLeft: '4px solid #B22222', padding: '15px', marginBottom: '20px', fontFamily: 'sans-serif', borderRadius: '4px', fontSize: '14px' }}>Error: {error}</p>}
      {success && <p style={{ backgroundColor: '#E6FFE6', color: '#228B22', borderLeft: '4px solid #228B22', padding: '15px', marginBottom: '20px', fontFamily: 'sans-serif', borderRadius: '4px', fontSize: '14px' }}>Success: {success}</p>}

      <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'sans-serif', backgroundColor: '#4B5320', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
        Data Exports
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
        <button
          onClick={exportStudents}
          style={{
            padding: '8px 16px',
            backgroundColor: '#D4A017',
            color: '#000000',
            border: '1px solid #000000',
            borderRadius: '6px',
            fontFamily: 'sans-serif',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Export Students
        </button>
        <button
          onClick={exportResults}
          style={{
            padding: '8px 16px',
            backgroundColor: '#D4A017',
            color: '#000000',
            border: '1px solid #000000',
            borderRadius: '6px',
            fontFamily: 'sans-serif',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Export Results
        </button>
        <button
          onClick={exportReport}
          style={{
            padding: '8px 16px',
            backgroundColor: '#D4A017',
            color: '#000000',
            border: '1px solid #000000',
            borderRadius: '6px',
            fontFamily: 'sans-serif',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Export Report
        </button>
      </div>
    </div>
  );
};

export default DataExports;