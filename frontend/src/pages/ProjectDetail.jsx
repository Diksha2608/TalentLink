import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DollarSign, Clock, Calendar, X, CheckCircle, MessageCircle, Trash2, User, MapPin, Star, Briefcase, Award, FileText, LogIn } from 'lucide-react';
import { projectsAPI } from '../api/projects';
import { proposalsAPI } from '../api/proposals';
import { formatCurrency } from '../utils/currency';
import { messagesAPI } from '../api/messages';

const DURATION_MAP = {
  less_1_month: 'Less than 1 month',
  '1_3_months': '1-3 months',
  '3_6_months': '3-6 months',
  '6_plus_months': '6+ months',
};

const HOURS_MAP = {
  less_30: 'Less than 30 hrs/week',
  more_30: 'More than 30 hrs/week',
};

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

export default function ProjectDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [userProposal, setUserProposal] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    cover_letter: '',
    bid_amount: '',
    estimated_time: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
    if (user?.role === 'client') {
      loadProposals();
    } else if (user?.role === 'freelancer') {
      checkUserProposal();
    }
  }, [id, user]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const res = await projectsAPI.get(id);
      setProject(res.data);
    } catch (err) {
      console.error('Failed to load project:', err);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const loadProposals = async () => {
    try {
      const res = await projectsAPI.getProposals(id);
      setProposals(res.data);
    } catch (err) {
      console.error('Failed to load proposals:', err);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try {
      await projectsAPI.remove(id);
      navigate('/dashboard/client');
    } catch {
      alert('Failed to delete project');
    }
  };

  const handleChat = async (freelancerId) => {
    if (!user) {
      navigate('/signin');
      return;
    }
    try {
      const res = await messagesAPI.getOrCreateThreadWith(freelancerId);
      const threadId = res.data?.id || res.data?.thread?.id;
      if (threadId) {
        navigate(`/messages/${threadId}`);
      } else {
        navigate(`/messages?user=${freelancerId}`);
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
      navigate(`/messages?user=${freelancerId}`);
    }
  };

  const checkUserProposal = async () => {
    try {
      const response = await proposalsAPI.list();
      const list = response.data.results || response.data || [];
      const userProposalForProject = list.find((p) => p.project === parseInt(id)) || null;
      setUserProposal(userProposalForProject);
    } catch (err) {
      console.error('Failed to check proposal:', err);
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      alert('Please sign in to submit a proposal');
      navigate('/signin');
      return;
    }

    // Check if user is a freelancer
    if (user.role !== 'freelancer') {
      alert('Only freelancers can submit proposals');
      return;
    }

    setError('');

    try {
      await proposalsAPI.create({
        project: id,
        ...proposalForm,
      });
      setShowProposalModal(false);
      setProposalForm({ cover_letter: '', bid_amount: '', estimated_time: '' });
      checkUserProposal();
      alert('Proposal submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit proposal');
    }
  };

  const handleAcceptProposal = async (proposalId) => {
    try {
      await proposalsAPI.accept(proposalId);
      loadProposals();
      loadProject();
      alert('Proposal accepted! Contract created.');
    } catch (err) {
      alert('Failed to accept proposal');
    }
  };

  const handleRejectProposal = async (proposalId) => {
    try {
      await proposalsAPI.reject(proposalId);
      loadProposals();
      alert('Proposal rejected');
    } catch (err) {
      alert('Failed to reject proposal');
    }
  };

  const handleProposalButtonClick = () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    if (user.role !== 'freelancer') {
      alert('Only freelancers can submit proposals');
      return;
    }
    setShowProposalModal(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading project details...</p>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Project not found</p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const canSubmitProposal = user?.role === 'freelancer' && project.status === 'open' && !userProposal;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* PROJECT DETAILS CARD */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
              {project.category && (
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  {project.category}
                </span>
              )}
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                project.status === 'open'
                  ? 'bg-green-100 text-green-700'
                  : project.status === 'in_progress'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {project.status === 'open'
                ? 'Open for Proposals'
                : project.status === 'in_progress'
                ? 'In Progress'
                : project.status}
            </span>
          </div>

          {user?.id === project.client && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleDeleteProject}
                className="px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg flex items-center gap-2 text-sm"
              >
                <Trash2 size={16} /> Delete Project
              </button>
            </div>
          )}

          <p className="text-gray-700 mb-6 text-lg leading-relaxed">{project.description}</p>

          {/* Skills */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {project.skills_required?.map((skill) => (
                <span
                  key={skill.id}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium text-sm"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          {/* Project Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-6 rounded-lg">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <DollarSign size={18} />
                <span className="text-sm font-medium">Budget</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {project.job_type === 'fixed' && project.fixed_payment
                  ? formatCurrency(project.fixed_payment)
                  : project.job_type === 'hourly' && (project.hourly_min || project.hourly_max)
                  ? `${formatCurrency(project.hourly_min || 0)} - ${formatCurrency(project.hourly_max || 0)}/hr`
                  : `${formatCurrency(project.budget_min)} - ${formatCurrency(project.budget_max)}`}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {project.job_type === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock size={18} />
                <span className="text-sm font-medium">Duration</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {DURATION_MAP[project.duration] || project.duration}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {HOURS_MAP[project.hours_per_week] || project.hours_per_week}
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Award size={18} />
                <span className="text-sm font-medium">Experience</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {EXPERIENCE_MAP[project.experience_level] || project.experience_level}
              </span>
              <span className="text-xs text-gray-500 mt-1">Required Level</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <MapPin size={18} />
                <span className="text-sm font-medium">Location</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {LOCATION_MAP[project.location_type] || project.location_type}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {project.client_location || 'Any Location'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Posted: {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={16} />
              <span>{project.proposal_count || 0} Proposals</span>
            </div>
          </div>

          {/* Attachments */}
          {Array.isArray(project.file_attachments) && project.file_attachments.length > 0 && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Attachments</h3>
              <ul className="space-y-2">
                {project.file_attachments.map((att) => (
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

          {/* Actions for Non-Logged-In Users or Non-Freelancers */}
          {!user && project.status === 'open' && (
            <div className="mt-6 border-t pt-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                <LogIn className="mx-auto mb-3 text-blue-600" size={48} />
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  Interested in this project?
                </h3>
                <p className="text-blue-700 mb-4">
                  Sign in as a freelancer to submit your proposal
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
          {user?.role === 'freelancer' && (
            <div className="mt-6 border-t pt-6">
              {canSubmitProposal ? (
                <button
                  onClick={handleProposalButtonClick}
                  className="w-full sm:w-auto px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 text-lg shadow-lg"
                >
                  Submit Proposal
                </button>
              ) : userProposal ? (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="text-blue-600" size={28} />
                    <span className="font-bold text-blue-900 text-lg">Proposal Submitted</span>
                  </div>
                  <p className="text-blue-700 mb-3 text-base">
                    Status: <span className="font-semibold capitalize">{userProposal.status}</span>
                  </p>
                  <button
                    onClick={() => navigate('/projects')}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Browse Other Projects →
                  </button>
                </div>
              ) : (
                project.status !== 'open' && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                    <p className="text-yellow-800 font-semibold text-base mb-2">
                      This project is no longer accepting proposals
                    </p>
                    <button
                      onClick={() => navigate('/projects')}
                      className="text-yellow-600 hover:underline font-medium"
                    >
                      Browse Other Projects →
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {/* Client Role - Show message */}
          {user?.role === 'client' && user.id !== project.client && (
            <div className="mt-6 border-t pt-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-700">This page is for project owners and freelancers.</p>
              </div>
            </div>
          )}
        </div>

        {/* PROPOSALS FOR CLIENT */}
        {user?.role === 'client' && user.id === project.client && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Proposals Received ({proposals.length})</h2>
            </div>

            {proposals.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 text-lg">No proposals yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {proposals.map((p) => (
                  <div key={p.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-lg transition-all">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {p.freelancer?.avatar ? (
                          <img
                            src={p.freelancer.avatar}
                            alt=""
                            className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xl">
                            {(p.freelancer?.name || p.freelancer_name || 'F')[0]}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-xl text-gray-900">
                            {p.freelancer?.name || p.freelancer_name}
                          </h3>
                          <p className="text-gray-600">{p.freelancer?.title || 'Freelancer'}</p>
                        </div>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold ${
                          p.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : p.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {p.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Freelancer Info Grid */}
                    {p.freelancer && (
                      <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                            <MapPin size={16} />
                            <span className="text-xs font-medium">Location</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {p.freelancer.location || 'Not specified'}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-medium">Rating</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {p.freelancer.rating_avg?.toFixed?.(1) ?? '0.0'} / 5.0
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                            <Briefcase size={16} />
                            <span className="text-xs font-medium">Projects</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {p.freelancer.projects_completed || 0}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Proposal Details Grid */}
                    <div className="grid grid-cols-2 gap-6 mb-4 bg-purple-50 p-4 rounded-lg">
                      <div>
                        <div className="text-sm text-gray-600 mb-1 font-medium">Bid Amount</div>
                        <div className="text-2xl font-bold text-purple-700">
                          {formatCurrency(p.bid_amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1 font-medium">Estimated Time</div>
                        <div className="text-2xl font-bold text-purple-700">{p.estimated_time}</div>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Cover Letter</h4>
                      <p className="text-gray-700 leading-relaxed">{p.cover_letter}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      <button
                        onClick={() => navigate(`/proposals/${p.id}`)}
                        className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 font-medium transition-all"
                      >
                        View Full Details
                      </button>
                      <button
                        onClick={() => handleChat(p.freelancer?.id || p.freelancer_id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium transition-all"
                      >
                        <MessageCircle size={18} /> Start Chat
                      </button>
                      {p.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAcceptProposal(p.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all"
                          >
                            ✓ Accept Proposal
                          </button>
                          <button
                            onClick={() => handleRejectProposal(p.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all"
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Proposal Modal */}
        {showProposalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-8 relative max-h-screen overflow-y-auto">
              <button
                onClick={() => setShowProposalModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-6">Submit Your Proposal</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter</label>
                  <textarea
                    required
                    value={proposalForm.cover_letter}
                    onChange={(e) => setProposalForm({ ...proposalForm, cover_letter: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                    placeholder="Explain why you're the best fit for this project..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Bid Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={proposalForm.bid_amount}
                    onChange={(e) => setProposalForm({ ...proposalForm, bid_amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                    placeholder="e.g., 5000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Completion Time</label>
                  <input
                    type="text"
                    required
                    value={proposalForm.estimated_time}
                    onChange={(e) => setProposalForm({ ...proposalForm, estimated_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                    placeholder="e.g., 2 weeks"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowProposalModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Submit Proposal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}