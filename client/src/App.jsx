import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

// Components
import LoadingSpinner from './components/Common/LoadingSpinner';
import VirtualClass from './components/VirtualClass';
import TeacherVirtualClass from './components/TeacherVirtualClass';
import StudentVirtualClass from './components/StudentVirtualClass';
import AttendanceManager from './components/AttendanceManager';

// Styles
import './App.css';
import './i18n';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />} 
      />
      
      <Route 
        path="/signup" 
        element={user ? <Navigate to={`/${user.role}`} replace /> : <SignUp />} 
      />
      
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/teacher/*" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/student/*" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/virtual-class/:classId" 
        element={
          <ProtectedRoute allowedRoles={['teacher', 'student']}>
            <VirtualClass />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/teacher-virtual-classes" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherVirtualClass />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/student-virtual-classes" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentVirtualClass />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/virtual-class/:classId/attendance" 
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <AttendanceManager />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to={`/${user.role}`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      <Route 
        path="/unauthorized" 
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Unauthorized Access
              </h1>
              <p className="text-gray-600 mb-4">
                You don't have permission to access this page.
              </p>
              <button 
                onClick={() => window.history.back()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        } 
      />
      
      <Route 
        path="*" 
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Page Not Found
              </h1>
              <p className="text-gray-600 mb-4">
                The page you're looking for doesn't exist.
              </p>
              <button 
                onClick={() => window.history.back()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;