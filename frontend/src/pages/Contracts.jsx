import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, FileText, Clock, ArrowRight } from 'lucide-react';
import { contractsAPI } from '../api/contracts';

export default function Contracts({ user }) {
  const [contracts, setContracts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const res = await contractsAPI.list();
      setContracts(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (err) {
      console.error('Failed to load contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = Array.isArray(contracts) ? contracts.filter((contract) => {
    if (filter === 'all') return true;
    return contract.status === filter;
  }) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Contracts</h1>

        {/* Filter Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({contracts.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'pending'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({contracts.filter(c => c.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'active'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({contracts.filter(c => c.status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'completed'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({contracts.filter(c => c.status === 'completed').length})
            </button>
          </div>
        </div>

        {/* Contracts List */}
        {filteredContracts.length > 0 ? (
          <div className="space-y-4">
            {filteredContracts.map((contract) => (
              <Link
                key={contract.id}
                to={`/contracts/${contract.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-purple-600 transition">
                          {contract.project_title}
                        </h2>
                        <ArrowRight 
                          className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" 
                          size={24} 
                        />
                      </div>
                      <div className="mt-3 space-y-1.5">
                        <p className="text-gray-600 text-sm">
                          <strong>Client:</strong> {contract.client_name}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <strong>Freelancer:</strong> {contract.freelancer_name}
                        </p>
                        {contract.start_date && (
                          <p className="text-gray-600 text-sm">
                            <strong>Start Date:</strong>{' '}
                            {new Date(contract.start_date).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-gray-600 text-sm">
                          <strong>Created:</strong>{' '}
                          {new Date(contract.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`ml-4 px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${
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

                  {/* Signature Status */}
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      {contract.client_signed ? (
                        <CheckCircle className="text-green-500" size={18} />
                      ) : (
                        <Clock className="text-gray-400" size={18} />
                      )}
                      <span className="text-sm text-gray-600">
                        Client {contract.client_signed ? 'Signed' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {contract.freelancer_signed ? (
                        <CheckCircle className="text-green-500" size={18} />
                      ) : (
                        <Clock className="text-gray-400" size={18} />
                      )}
                      <span className="text-sm text-gray-600">
                        Freelancer {contract.freelancer_signed ? 'Signed' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Action Hints */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {contract.status === 'pending' &&
                      ((user.role === 'client' && !contract.client_signed) ||
                        (user.role === 'freelancer' && !contract.freelancer_signed)) && (
                        <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                          <CheckCircle size={16} />
                          <span>Click to sign this contract</span>
                        </div>
                      )}
                    {contract.status === 'active' && user.role === 'client' && (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle size={16} />
                        <span>Click to mark as completed</span>
                      </div>
                    )}
                    {contract.status === 'completed' && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <CheckCircle size={16} />
                        <span>Contract completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg mb-2">No contracts found</p>
            <p className="text-gray-500 text-sm">
              {filter !== 'all' 
                ? `No ${filter} contracts at the moment.`
                : 'Contracts will appear here once proposals are accepted.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}