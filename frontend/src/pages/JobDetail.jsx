// frontend/src/pages/JobDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DollarSign, Clock, Calendar, MapPin, Award, Briefcase, LogIn, Trash2 } from 'lucide-react';
import { jobsAPI } from '../api/jobs';
import { jobApplicationsAPI } from '../api/jobApplications';
import JobApplicationForm from '../components/JobApplicationForm';
import { CheckCircle } from 'lucide-react';

const EXPERIENCE_MAP = {
  entry: 'Entry Level',
  intermediate: 'Intermediate',
  expert: 'Expert',
};

const LOCATION_MAP = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'Onsite',
};

export default function JobDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userApplication, setUserApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadJob();
    if (user?.role === 'freelancer') {
      checkUserApplication();
    }
  }, [id, user]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const res = await jobsAPI.get(id);
      setJob(res.data);
    } catch (err) {
      console.error('Failed to load job:', err);
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  // Check if THIS user has already applied to THIS job
  const checkUserApplication = async () => {
    try {
      const response = await jobApplicationsAPI.list();
      const list = response.data.results || response.data || [];
      // common backends use fields like applicant, freelancer, or user — check safely
      const parsedId = parseInt(id, 10);
      const myApp = list.find(
        (app) =>
          app.job === parsedId &&
          (app.applicant === user?.id ||
            app.freelancer === user?.id ||
            app.user === user?.id)
      ) || null;
      setUserApplication(myApp);
    } catch (err) {
      console.error('Failed to check application:', err);
    }
  };

  const handleDeleteJob = async () => {
    if (!window.confirm('Delete this job? This cannot be undone.')) return;
    try {
      await jobsAPI.remove(id);
      navigate('/dashboard/client');
    } catch {
      alert('Failed to delete job');
    }
  };

  const handleSubmitApplication = async (formData) => {
    try {
      setSubmitting(true);
      await jobApplicationsAPI.create(formData);
      setShowApplicationModal(false);
      await checkUserApplication();
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    if (user.role !== 'freelancer') {
      alert('Only freelancers can apply to jobs');
      return;
    }
    setShowApplicationModal(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading job details...</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Job not found</p>
        <button
          onClick={() => navigate('/jobs')}
          className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{job.title}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  Open
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold capitalize">
                  {job.job_type === 'hourly' ? 'Hourly' : 'Fixed Price'}
                </span>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                  {EXPERIENCE_MAP[job.experience_level] || job.experience_level}
                </span>
                {job.location_type && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold capitalize">
                    {LOCATION_MAP[job.location_type] || job.location_type}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Delete button for job owner */}
          {user?.id === job.client && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleDeleteJob}
                className="px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg flex items-center gap-2 text-sm"
              >
                <Trash2 size={16} /> Delete Job
              </button>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-700 mb-6 text-lg leading-relaxed">{job.description}</p>

          {/* Job Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-6 rounded-lg">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <DollarSign size={18} className="text-green-600" />
                <span className="text-sm font-medium">Payment</span>
              </div>
              <span className="text-xl font-bold text-green-600">
                {job.job_type === 'hourly' && job.hourly_min && job.hourly_max
                  ? `₹${job.hourly_min} - ₹${job.hourly_max}/hr`
                  : job.job_type === 'fixed' && job.fixed_amount
                  ? `₹${job.fixed_amount}`
                  : 'Not specified'}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {job.job_type === 'hourly' ? 'Per Hour' : 'Fixed Price'}
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Award size={18} />
                <span className="text-sm font-medium">Experience</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {EXPERIENCE_MAP[job.experience_level] || job.experience_level}
              </span>
              <span className="text-xs text-gray-500 mt-1">Required Level</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <MapPin size={18} />
                <span className="text-sm font-medium">Location</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {LOCATION_MAP[job.location_type] || job.location_type}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {job.location || 'Any Location'}
              </span>
            </div>
          </div>

          {/* Posted Date */}
          <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>by <strong>{job.client_name || 'Client'}</strong></span>
            </div>
          </div>

          {/* Attachments */}
          {Array.isArray(job.file_attachments) && job.file_attachments.length > 0 && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Attachments</h3>
              <ul className="space-y-2">
                {job.file_attachments.map((att) => (
                  <li
                    key={att.id}
                    className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50"
                  >
                    <span className="text-sm font-medium truncate">{att.original_name || 'Attachment'}</span>
                    <a
                      href={att.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      download
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions for Non-Logged-In Users */}
          {!user && job.status === 'open' && (
            <div className="mt-6 border-t pt-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                <LogIn className="mx-auto mb-3 text-blue-600" size={48} />
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  Interested in this job?
                </h3>
                <p className="text-blue-700 mb-4">
                  Sign in as a freelancer to apply
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => navigate('/signin')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-semibold"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Freelancer Actions */}
          {user?.role === 'freelancer' && job.status === 'open' && (
            <div className="mt-6 border-t pt-6">
              {!userApplication ? (
                <button
                  onClick={handleApplyClick}
                  className="w-full sm:w-auto px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 text-lg shadow-lg"
                >
                  Apply for this Job
                </button>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="text-blue-600" size={28} />
                    <span className="font-bold text-blue-900 text-lg">Application Submitted</span>
                  </div>
                  <p className="text-blue-700 mb-3 text-base">
                    Status: <span className="font-semibold capitalize">{userApplication.status}</span>
                  </p>
                  <button
                    onClick={() => navigate('/jobs')}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Browse Other Jobs →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Client viewing their own job */}
          {user?.role === 'client' && user.id !== job.client && (
            <div className="mt-6 border-t pt-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-700">This job posting is managed by another client.</p>
              </div>
            </div>
          )}
        </div>
      </div>


      {showApplicationModal && (
        <JobApplicationForm
          job={job}
          onSubmit={handleSubmitApplication}
          onClose={() => setShowApplicationModal(false)}
          isLoading={submitting}
        />
      )}
    </div>
  );
}
