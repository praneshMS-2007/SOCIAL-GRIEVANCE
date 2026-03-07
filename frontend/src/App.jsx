import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FileGrievance from './pages/FileGrievance';
import TrackGrievance from './pages/TrackGrievance';
import Whistleblower from './pages/Whistleblower';
import LawyerBot from './pages/LawyerBot';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Login from './pages/Login';
import DeptDashboard from './pages/DeptDashboard';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes({ lang, setLang }) {
  return (
    <>
      <Navbar lang={lang} setLang={setLang} />
      <Routes>
        <Route path="/" element={<Home lang={lang} />} />
        <Route path="/file" element={<FileGrievance lang={lang} />} />
        <Route path="/track" element={<TrackGrievance lang={lang} />} />
        <Route path="/whistleblower" element={<Whistleblower lang={lang} />} />
        <Route path="/lawyer-bot" element={<LawyerBot lang={lang} />} />
        <Route path="/dashboard" element={<Dashboard lang={lang} />} />
        <Route path="/login" element={<Login lang={lang} />} />
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <Admin lang={lang} />
          </ProtectedRoute>
        } />
        <Route path="/dept-dashboard" element={
          <ProtectedRoute role="department">
            <DeptDashboard lang={lang} />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  const [lang, setLang] = useState('en');

  return (
    <AuthProvider>
      <Router>
        <AppRoutes lang={lang} setLang={setLang} />
      </Router>
    </AuthProvider>
  );
}

export default App;
