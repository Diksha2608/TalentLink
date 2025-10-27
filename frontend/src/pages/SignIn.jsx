import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/auth';

export default function SignIn({ setUser }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');
    setLoading(true);

    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Email:', formData.email);
      
      setDebugInfo('Attempting login...');
      
      const response = await authAPI.login(formData.email, formData.password);
      console.log('Login response:', response);
      
      setDebugInfo('Login successful, storing tokens...');
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      setDebugInfo('Fetching user data...');
      const userResponse = await authAPI.me();
      console.log('User data:', userResponse.data);
      
      setUser(userResponse.data);
      setDebugInfo('Redirecting...');
      
      // Check if profile is complete for freelancers
      if (userResponse.data.role === 'freelancer') {
        if (!userResponse.data.profile_complete) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard/freelancer');
        }
      } else {
        navigate('/dashboard/client');
      }
    } catch (err) {
      console.error('=== LOGIN ERROR ===');
      console.error('Full error:', err);
      console.error('Error response:', err.response);
      
      let errorMsg = 'Login failed. ';
      let debugMsg = '';
      
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        errorMsg = 'Cannot connect to server. Is the backend running on http://127.0.0.1:8000?';
        debugMsg = 'Network error - backend might be down';
      } else if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        debugMsg = `Status: ${status}, Data: ${JSON.stringify(data)}`;
        
        if (status === 401 || status === 400) {
          // Handle different error message formats
          if (typeof data.detail === 'string') {
            errorMsg = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMsg = data.detail[0];
          } else if (data.detail) {
            errorMsg = JSON.stringify(data.detail);
          } else {
            errorMsg = 'Invalid email or password.';
          }
        } else if (status === 500) {
          errorMsg = 'Server error. Please try again later.';
        } else {
          errorMsg = `Error ${status}: ${err.response.statusText}`;
        }
      } else {
        errorMsg = err.message || 'Unknown error occurred';
      }
      
      setError(errorMsg);
      setDebugInfo(debugMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2 text-lg">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
              <p className="font-medium">Login Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {debugInfo && !error && (
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 px-4 py-3 rounded">
              <p className="text-sm">{debugInfo}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
              placeholder="your.email@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="text-center">
            <p className="text-gray-600 mb-3">
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-600 hover:underline font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}