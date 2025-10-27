// frontend/src/App.jsx 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import OnboardingWizard from './pages/OnboardingWizard';
import ProjectFeed from './pages/ProjectFeed';
import ProjectDetail from './pages/ProjectDetail';
import ClientDashboard from './pages/ClientDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import Messages from './pages/Messages';
import Contracts from './pages/Contracts';
import TestAPI from './pages/TestAPI';
import ProtectedRoute from './components/ProtectedRoute';
import { authAPI } from './api/auth';
import PostProject from './pages/PostProject';
import FreelancerProfile from './pages/FreelancerProfile';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authAPI
        .me()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar user={user} setUser={setUser} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing user={user} />} />
            <Route path="/signup" element={<SignUp setUser={setUser} />} />
            <Route path="/signin" element={<SignIn setUser={setUser} />} />
            <Route
              path="/onboarding"
              element={<ProtectedRoute user={user}><OnboardingWizard user={user} setUser={setUser} /></ProtectedRoute>}
            />
            <Route path="/projects" element={<ProjectFeed user={user} />} />
            <Route
              path="/projects/:id"
              element={<ProtectedRoute user={user}><ProjectDetail user={user} /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/client"
              element={<ProtectedRoute user={user}><ClientDashboard user={user} /></ProtectedRoute>}
            />
            <Route
              path="/dashboard/freelancer"
              element={<ProtectedRoute user={user}><FreelancerDashboard user={user} /></ProtectedRoute>}
            />
            <Route
              path="/messages"
              element={<ProtectedRoute user={user}><Messages user={user} /></ProtectedRoute>}
            />
            <Route
              path="/contracts"
              element={<ProtectedRoute user={user}><Contracts user={user} /></ProtectedRoute>}
            />
            <Route path="/test-api" element={<TestAPI />} />
            <Route path="/projects/create" element={<ProtectedRoute user={user}><PostProject user={user} /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute user={user}><FreelancerProfile user={user} setUser={setUser} /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer user={user} />
      </div>
    </Router>
  );
}
export default App;