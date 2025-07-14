import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import TeacherHome from './pages/TeacherHome';
import StudentHome from './pages/StudentHome';
import AdminHome from './pages/AdminHome';
import Register from './pages/Register';
import TestTaking from './pages/TestTaking';
import TestResults from './pages/TestResults';
import AdminResults from './pages/AdminResults';
import Analytics from './components/teacher/Analytics';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import ManageClasses from './pages/ManageClasses';
import ManageUsers from './pages/ManageUsers';
import ExamSchedules from './pages/ExamSchedules';
import DataExports from './pages/DataExports';

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          textAlign: 'center',
          color: '#4B5320',
          fontFamily: 'sans-serif',
          padding: '20px',
          backgroundColor: '#F8F9FA',
          minHeight: '100vh'
        }}>
          <h1>Something went wrong. Please try again.</h1>
        </div>
      );
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
              path="/student/*"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test/:testId"
              element={
                <ProtectedRoute requiredRole="student">
                  <TestTaking />
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
              path="/teacher/test-results/:testId"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'admin']}>
                  <TestResults />
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
              path="/admin/results/:testId"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminResults />
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
              path="/analytics"
              element={
                <ProtectedRoute requiredRoles={['teacher', 'admin']}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/unauthorized"
              element={
                <div style={{
                  textAlign: 'center',
                  color: '#4B5320',
                  fontFamily: 'sans-serif',
                  padding: '20px',
                  backgroundColor: '#F8F9FA',
                  minHeight: '100vh'
                }}>
                  Unauthorized: Access Denied
                </div>
              }
            />
            <Route
              path="*"
              element={
                <div style={{
                  textAlign: 'center',
                  color: '#4B5320',
                  fontFamily: 'sans-serif',
                  padding: '20px',
                  backgroundColor: '#F8F9FA',
                  minHeight: '100vh'
                }}>
                  404: Route not found
                </div>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;