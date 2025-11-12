import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Calendar,
  DollarSign,
  ArrowLeft
} from 'lucide-react';
import { contractsAPI } from '../api/contracts';

export default function ContractDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadContract();
  }, [id]);

  const loadContract = async () => {
    try {
      setLoading(true);
      const res = await contractsAPI.get(id);
      setContract(res.data);
    } catch (err) {
      setError('Failed to load contract details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = async () => {
    try {
      setActionLoading(true);
      await contractsAPI.sign(id);
      await loadContract();
      alert('Contract signed successfully!');
    } catch (err) {
      alert('Failed to sign contract');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteContract = async () => {
    if (!window.confirm('Are you sure you want to mark this contract as completed?')) return;

    try {
      setActionLoading(true);
      await contractsAPI.complete(id);
      await loadContract();
      alert('Contract marked as completed!');
    } catch (err) {
      alert('Failed to complete contract');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <p className="text-red-700 text-lg font-semibold">{error || 'Contract not found'}</p>
            <button
              onClick={() => navigate('/contracts')}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Back to Contracts
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canSign =
    contract.status === 'pending' &&
    ((user.role === 'client' && !contract.client_signed) ||
      (user.role === 'freelancer' && !contract.freelancer_signed));

  const canComplete = contract.status === 'active' && user.role === 'client';

  // ✅ Unified title for both job and project contracts
  const title = contract.job_title || contract.project_title || `Contract #${contract.id}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/contracts')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Contracts
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 pb-6 border-b">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              <p className="text-gray-600">Contract ID: #{contract.id}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                contract.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : contract.status === 'active'
                  ? 'bg-blue-100 text-blue-700'
                  : contract.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
            </span>
          </div>

          {/* Parties */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User size={20} className="text-purple-600" />
                <h3 className="font-semibold text-purple-900">Client</h3>
              </div>
              <p className="text-gray-900 font-medium">{contract.client_name}</p>
              <div className="flex items-center gap-2 mt-3">
                {contract.client_signed ? (
                  <>
                    <CheckCircle className="text-green-500" size={18} />
                    <span className="text-sm text-green-700 font-medium">Signed</span>
                  </>
                ) : (
                  <>
                    <Clock className="text-yellow-500" size={18} />
                    <span className="text-sm text-yellow-700 font-medium">Pending Signature</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User size={20} className="text-blue-600" />
                <h3 className="font-semibold text-blue-900">Freelancer</h3>
              </div>
              <p className="text-gray-900 font-medium">{contract.freelancer_name}</p>
              <div className="flex items-center gap-2 mt-3">
                {contract.freelancer_signed ? (
                  <>
                    <CheckCircle className="text-green-500" size={18} />
                    <span className="text-sm text-green-700 font-medium">Signed</span>
                  </>
                ) : (
                  <>
                    <Clock className="text-yellow-500" size={18} />
                    <span className="text-sm text-yellow-700 font-medium">Pending Signature</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          {contract.start_date && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar size={20} />
                Timeline
              </h3>
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="text-gray-600">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(contract.start_date).toLocaleDateString()}
                  </p>
                </div>
                {contract.end_date && (
                  <div>
                    <p className="text-gray-600">End Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(contract.end_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(contract.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Terms */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={20} />
              Contract Terms
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{contract.terms}</p>
            </div>
          </div>

          {/* Payment Terms */}
          {contract.payment_terms && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign size={20} />
                Payment Terms
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{contract.payment_terms}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t">
            {canSign && (
              <button
                onClick={handleSignContract}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={20} />
                {actionLoading ? 'Signing...' : 'Sign Contract'}
              </button>
            )}

            {canComplete && (
              <button
                onClick={handleCompleteContract}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={20} />
                {actionLoading ? 'Processing...' : 'Mark as Completed'}
              </button>
            )}

            {contract.status === 'completed' && (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle size={24} />
                <span className="font-semibold">This contract has been completed</span>
              </div>
            )}
          </div>
        </div>

        {/* Related Links */}
        {(contract.proposal?.project || contract.job_application?.job) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Related Work</h3>
            {contract.proposal?.project ? (
              <Link
                to={`/projects/${contract.proposal.project}`}
                className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
              >
                View Project Details →
              </Link>
            ) : (
              <Link
                to={`/jobs/${contract.job_application.job}`}
                className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
              >
                View Job Details →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
