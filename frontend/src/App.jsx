// frontend/src/App.jsx 
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import OnboardingWizard from './pages/OnboardingWizard';
import ProjectFeed from './pages/ProjectFeed';
import ProjectDetail from './pages/ProjectDetail';
import EditProject from './pages/EditProject';
import ClientDashboard from './pages/ClientDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import Messages from './pages/Messages';
import Contracts from './pages/Contracts';
import TestAPI from './pages/TestAPI';
import ProtectedRoute from './components/ProtectedRoute';
import { authAPI } from './api/auth';
import PostProject from './pages/PostProject';
import FreelancerProfile from './pages/FreelancerProfile';
import ClientProfile from './pages/ClientProfile';
import ContractDetail from './pages/ContractDetail';
import ContractReview from './pages/ContractReview';
import ProposalDetail from './pages/ProposalDetail';
import Talent from './pages/Talent';
import Jobs from './pages/Jobs';
import Clients from './pages/Clients';
import Notifications from './pages/Notifications';
import AccountSettings from './pages/AccountSettings';
import Earnings from './pages/Earnings';
import Payments from './pages/Payments';
import Invoices from './pages/Invoices';
import PostJob from './pages/PostJob';
import JobDetail from './pages/JobDetail';
import EditJob from './pages/EditJob';
import ExternalReviewForm from './components/ExternalReviewForm';
import ReviewsPage from './pages/ReviewsPage';
import SavedItemsPage from './pages/SavedItemsPage';
import Workspace from './pages/Workspace';
import WorkspaceDetail from './pages/WorkspaceDetail';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authAPI
        .me()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <AppLayout user={user} setUser={setUser} loading={loading} />
    </Router>
  );
}

function AppLayout({ user, setUser, loading }) {
  const location = useLocation();


  const hideChrome =
    location.pathname === '/onboarding' ||
    location.pathname === '/submit-review';

  return (
    <div className="flex flex-col min-h-screen">
      {!hideChrome && (
        <Navbar user={user} setUser={setUser} loading={loading} />
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing user={user} />} />
          <Route path="/signup" element={<SignUp setUser={setUser} />} />
          <Route path="/signin" element={<SignIn setUser={setUser} />} />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute user={user}>
                <OnboardingWizard user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />

          <Route path="/talent" element={<Talent user={user} />} />
          <Route path="/projects" element={<ProjectFeed user={user} />} />
          <Route path="/projects/:id/edit" element={<EditProject user={user} />} />
          <Route path="/jobs" element={<Jobs user={user} />} />
          <Route path="/clients" element={<Clients user={user} />} />

          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute user={user}>
                <ProjectDetail user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/client"
            element={
              <ProtectedRoute user={user}>
                <ClientDashboard user={user} />
              </ProtectedRoute>
            }
          />

          <Route path="/contracts" element={<Contracts user={user} />} />
          <Route path="/contracts/:id" element={<ContractDetail user={user} />} />
          <Route path="/contracts/:id/review" element={<ContractReview user={user} />} />
          <Route path="/workspace" element={
            <ProtectedRoute user={user}>
              <Workspace user={user} />
            </ProtectedRoute>
          } />
          <Route path="/workspace/:id" element={
            <ProtectedRoute user={user}>
              <WorkspaceDetail user={user} />
            </ProtectedRoute>
          } />
          <Route
            path="/dashboard/freelancer"
            element={
              <ProtectedRoute user={user}>
                <FreelancerDashboard user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute user={user}>
                <Messages user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:threadId"
            element={
              <ProtectedRoute user={user}>
                <Messages user={user} />
              </ProtectedRoute>
            }
          />


          <Route
            path="/notifications"
            element={
              <ProtectedRoute user={user}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute user={user}>
                <AccountSettings user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/earnings"
            element={
              <ProtectedRoute user={user}>
                <Earnings user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute user={user}>
                <Payments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices"
            element={
              <ProtectedRoute user={user}>
                <Invoices />
              </ProtectedRoute>
            }
          />

          <Route
            path="/proposals/:proposalId"
            element={
              <ProtectedRoute user={user}>
                <ProposalDetail user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="/reviews" element={<ReviewsPage user={user} />} />
          <Route path="/saved" element={<SavedItemsPage />} />
          <Route path="/test-api" element={<TestAPI />} />
          <Route path="/jobs/create" element={<PostJob user={user} />} />
          <Route path="/jobs/:id" element={<JobDetail user={user} />} />
          <Route path="/jobs/:id/edit" element={<EditJob user={user} />} />  
          <Route path="/submit-review" element={<ExternalReviewForm />} />
          <Route
            path="/projects/create"
            element={
              <ProtectedRoute user={user}>
                <PostProject user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                {user?.role === 'freelancer' ? (
                  <FreelancerProfile user={user} setUser={setUser} />
                ) : (
                  <ClientProfile user={user} setUser={setUser} />
                )}
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {!hideChrome && <Footer user={user} />}
    </div>
  );
}

export default App;
