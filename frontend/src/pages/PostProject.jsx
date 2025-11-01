import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SkillSelector from '../components/SkillSelector';
import { projectsAPI } from '../api/projects';

export default function PostProject({ user }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: [],
    budget_min: '',
    budget_max: '',
    duration_estimate: '1_month',
    visibility: 'public',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.skills.length === 0) {
      setError('Please select at least one skill');
      setLoading(false);
      return;
    }

    if (parseFloat(formData.budget_min) >= parseFloat(formData.budget_max)) {
      setError('Maximum budget must be greater than minimum budget');
      setLoading(false);
      return;
    }

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        skill_ids: formData.skills.map((s) => s.id),
        budget_min: formData.budget_min,
        budget_max: formData.budget_max,
        duration_estimate: formData.duration_estimate,
        visibility: formData.visibility,
      };

      await projectsAPI.create(projectData);
      navigate('/dashboard/client');
    } catch (err) {
      console.error('Project creation error:', err);
      setError(err.response?.data?.detail || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const token = localStorage.getItem('access_token');

  if (!mounted || (!user && !token)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }


  if (user.role === 'freelancer') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">This page is for clients only</h2>
          <button
            onClick={() => navigate('/dashboard/freelancer')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Post a New Project</h1>
          <p className="text-gray-600 mt-2">Find the perfect freelancer for your project</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
              placeholder="e.g., Build a responsive website for my business"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
              placeholder="Describe your project in detail. Include requirements, deliverables, and any specific expectations..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills *
            </label>
            <SkillSelector
              selectedSkills={formData.skills}
              setSelectedSkills={(skills) => setFormData({ ...formData, skills })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Budget (₹) *
              </label>
              <input
                type="number"
                required
                min="100"
                step="100"
                value={formData.budget_min}
                onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                placeholder="5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Budget (₹) *
              </label>
              <input
                type="number"
                required
                min="100"
                step="100"
                value={formData.budget_max}
                onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                placeholder="10000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Duration *
            </label>
            <select
              required
              value={formData.duration_estimate}
              onChange={(e) => setFormData({ ...formData, duration_estimate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
            >
              <option value="1_week">Less than 1 week</option>
              <option value="1_month">1 month</option>
              <option value="3_months">3 months</option>
              <option value="6_months">6+ months</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={formData.visibility === 'public'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className="mr-2 w-4 h-4 text-purple-600"
                />
                <span>Public (visible to all freelancers)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={formData.visibility === 'private'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className="mr-2 w-4 h-4 text-purple-600"
                />
                <span>Private (invite only)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/client')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting Project...' : 'Post Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}