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
import Results from './components/teacher/Results';
import Analytics from './components/teacher/Analytics';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import ManageClasses from './pages/ManageClasses';
import ManageUsers from './pages/ManageUsers';
import EditResults from './pages/EditResults';
import ExamSchedules from './pages/ExamSchedules';
import DataExports from './pages/DataExports';

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
            <Route path="/" element={<Login />} />
            <Route
              path="/welcome"
              element={
                <ProtectedRoute requiredRole="student">
                  <Welcome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/*"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminHome />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ManageClasses />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subjects"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ManageClasses />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ManageUsers />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tests"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <EditResults />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/results"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <EditResults />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/session"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <DataExports />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exams"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ExamSchedules />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exports"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <DataExports />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <Analytics />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Register />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:testId"
              element={
                <ProtectedRoute requiredRole={['admin', 'teacher']}>
                  <Results />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/student/:studentId"
              element={
                <ProtectedRoute requiredRole={['admin', 'teacher']}>
                  <Results />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute requiredRole={['teacher', 'admin']}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-creation"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TestCreation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-creation/:testId"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TestCreation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-creation/:testId/questions"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TestQuestions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-preview/:testId"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TestPreview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/unauthorized"
              element={<div style={{ textAlign: 'center', color: '#4B5320', fontFamily: 'sans-serif', padding: '20px' }}>Unauthorized: Access Denied</div>}
            />
            <Route path="*" element={<div style={{ textAlign: 'center', color: '#4B5320', fontFamily: 'sans-serif', padding: '20px' }}>404: Route not found</div>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;