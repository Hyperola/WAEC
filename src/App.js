import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import TeacherHome from './pages/TeacherHome';
import StudentHome from './pages/StudentHome';
import TestCreation from './pages/TestCreation';
import TestQuestions from './pages/TestQuestions';
import TestPreview from './pages/TestPreview';
import Welcome from './pages/Welcome';
import AdminHome from './pages/AdminHome';
import Register from './pages/Register';
import Results from './pages/Results';
import AnalyticsPage from './pages/AnalyticsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <h1 style={{ textAlign: 'center', color: '#4B5320', fontFamily: 'sans-serif', padding: '20px' }}>Something went wrong. Please try again.</h1>;
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/welcome"
              element={
                <ProtectedRoute role="student">
                  <Welcome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student"
              element={
                <ProtectedRoute role="student">
                  <StudentHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute role="admin">
                  <Register />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:testId"
              element={
                <ProtectedRoute role={['admin', 'teacher']}>
                  <Results />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/student/:studentId"
              element={
                <ProtectedRoute role={['admin', 'teacher']}>
                  <Results />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute role={['teacher', 'admin']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-creation"
              element={
                <ProtectedRoute role="teacher">
                  <TestCreation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-creation/:testId"
              element={
                <ProtectedRoute role="teacher">
                  <TestCreation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-creation/:testId/questions"
              element={
                <ProtectedRoute role="teacher">
                  <TestQuestions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-preview/:testId"
              element={
                <ProtectedRoute role="teacher">
                  <TestPreview />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Login />} />
            <Route path="*" element={<div style={{ textAlign: 'center', color: '#4B5320', fontFamily: 'sans-serif', padding: '20px' }}>404: Route not found</div>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;