// frontend/src/pages/ProposalDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DollarSign, Clock, Calendar, MessageCircle, ArrowLeft, User, MapPin, Star, Briefcase, Award } from 'lucide-react';
import { proposalsAPI } from '../api/proposals';
import { formatCurrency } from '../utils/currency';
import { messagesAPI } from '../api/messages';
import FreelancerCard from '../components/FreelancerCard';

export default function ProposalDetail({ user }) {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFreelancerModal, setShowFreelancerModal] = useState(false);

  useEffect(() => {
    loadProposal();
  }, [proposalId]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      const res = await proposalsAPI.get(proposalId);
      setProposal(res.data);
    } catch (err) {
      console.error('Failed to load proposal:', err);
      setError('Failed to load proposal details');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = (freelancerId) => {
    if (!user) {
      navigate('/signin');
      return;
    }
    navigate(`/messages?user=${freelancerId}`);
  };

  const handleAccept = async () => {
    try {
      await proposalsAPI.accept(proposalId);
      alert('Proposal accepted! Contract created.');
      navigate(`/projects/${proposal.project_id}`);
    } catch (err) {
      alert('Failed to accept proposal');
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this proposal?')) return;
    try {
      await proposalsAPI.reject(proposalId);
      alert('Proposal rejected');
      navigate(`/projects/${proposal.project_id}`);
    } catch (err) {
      alert('Failed to reject proposal');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading proposal details...</p>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error || 'Proposal not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const freelancer = proposal.freelancer || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Project
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 pb-6 border-b">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Proposal Details</h1>
              <p className="text-gray-600">
                For project: <span className="font-semibold">{proposal.project_title}</span>
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-bold ${
                proposal.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : proposal.status === 'accepted'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {proposal.status.toUpperCase()}
            </span>
          </div>

          {/* Freelancer Section */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Freelancer Information</h2>
            <div className="flex items-start gap-4 mb-4">
              {freelancer.avatar ? (
                <img
                  src={freelancer.avatar}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover border-2 border-purple-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-2xl border-2 border-purple-200">
                  {(freelancer.name || proposal.freelancer_name || 'F')[0]}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {freelancer.name || proposal.freelancer_name}
                  </h3>
                  {freelancer.is_top_rated && (
                    <Award size={20} className="text-yellow-500" title="Top Rated" />
                  )}
                </div>
                {freelancer.title && (
                  <p className="text-gray-600 mb-3">{freelancer.title}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {freelancer.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{freelancer.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{freelancer.rating_avg?.toFixed?.(1) ?? '0.0'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase size={16} />
                    <span>{freelancer.projects_completed || 0} projects</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowFreelancerModal(true)}
                className="px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium"
              >
                View Full Profile
              </button>
            </div>
          </div>

          {/* Proposal Details */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Proposal Details</h2>
            <div className="grid grid-cols-2 gap-6 mb-6 bg-purple-50 p-6 rounded-lg">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <DollarSign size={20} />
                  <span className="text-sm font-medium">Bid Amount</span>
                </div>
                <div className="text-3xl font-bold text-purple-700">
                  {formatCurrency(proposal.bid_amount)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Clock size={20} />
                  <span className="text-sm font-medium">Estimated Time</span>
                </div>
                <div className="text-3xl font-bold text-purple-700">{proposal.estimated_time}</div>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-xl font-semibold mb-4">Cover Letter</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{proposal.cover_letter}</p>
          </div>

          {/* Submission Date */}
          <div className="mb-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Submitted: {new Date(proposal.created_at).toLocaleString()}</span>
            </div>
            {proposal.updated_at !== proposal.created_at && (
              <div className="flex items-center gap-2 mt-2">
                <Calendar size={16} />
                <span>Last updated: {new Date(proposal.updated_at).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {user?.role === 'client' && proposal.status === 'pending' && (
            <div className="flex gap-3 pt-6 border-t">
              <button
                onClick={handleChat}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
              >
                <MessageCircle size={20} />
                Start Chat
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                ✓ Accept Proposal
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                ✗ Reject Proposal
              </button>
            </div>
          )}

          {user?.role === 'freelancer' && (
            <div className="pt-6 border-t">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-800 font-medium">
                  This is your proposal. The client will review and respond soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Freelancer Card Modal */}
      {showFreelancerModal && freelancer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFreelancerModal(false)}
        >
          <div className="bg-transparent max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <FreelancerCard 
              freelancer={{ 
                ...freelancer, 
                user: freelancer 
              }} 
              showChatButton={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}