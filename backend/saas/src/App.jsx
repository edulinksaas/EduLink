import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AcademyProvider } from './contexts/AcademyContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import TodayStatus from './pages/TodayStatus';
import Academies from './pages/Academies';
import Subjects from './pages/Subjects';
import Classrooms from './pages/Classrooms';
import Classes from './pages/Classes';
import Teachers from './pages/Teachers';
import TeacherDetail from './pages/TeacherDetail';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Enrollments from './pages/Enrollments';
import Settings from './pages/Settings';
import ParentChildren from './pages/ParentChildren';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AcademyProvider>
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* 보호된 라우트 */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/today-status"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TodayStatus />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/academies"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Academies />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/subjects"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Subjects />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/classrooms"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Classrooms />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Classes />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Teachers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teachers/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TeacherDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Students />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StudentDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enrollments"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Enrollments />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/:parentId/children"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ParentChildren />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* 기본 리다이렉트 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AcademyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

