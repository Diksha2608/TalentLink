import { useState, useEffect } from 'react';
import { CheckCircle, FileText, Clock } from 'lucide-react';
import { contractsAPI } from '../api/contracts';

export default function Contracts({ user }) {
  const [contracts, setContracts] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = () => {
    contractsAPI.list().then((res) => setContracts(res.data.results || res.data));
  };

  const handleSignContract = async (contractId) => {
    try {
      await contractsAPI.sign(contractId);
      loadContracts();
      alert('Contract signed successfully!');
    } catch (err) {
      alert('Failed to sign contract');
    }
  };

  const handleCompleteContract = async (contractId) => {
    try {
      await contractsAPI.complete(contractId);
      loadContracts();
      alert('Contract marked as completed!');
    } catch (err) {
      alert('Failed to complete contract');
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    if (filter === 'all') return true;
    return contract.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Contracts</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'pending'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'active'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'completed'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {filteredContracts.length > 0 ? (
          <div className="space-y-6">
            {filteredContracts.map((contract) => (
              <div key={contract.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{contract.project_title}</h2>
                    <div className="mt-2 space-y-1">
                      <p className="text-gray-600">
                        <strong>Client:</strong> {contract.client_name}
                      </p>
                      <p className="text-gray-600">
                        <strong>Freelancer:</strong> {contract.freelancer_name}
                      </p>
                      {contract.start_date && (
                        <p className="text-gray-600">
                          <strong>Start Date:</strong> {new Date(contract.start_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      contract.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : contract.status === 'active'
                        ? 'bg-blue-100 text-blue-700'
                        : contract.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {contract.status}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h3 className="font-semibold mb-2">Contract Terms</h3>
                  <p className="text-gray-700">{contract.terms}</p>
                </div>

                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    {contract.client_signed ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <Clock className="text-gray-400" size={20} />
                    )}
                    <span className="text-sm text-gray-600">Client Signature</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {contract.freelancer_signed ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <Clock className="text-gray-400" size={20} />
                    )}
                    <span className="text-sm text-gray-600">Freelancer Signature</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  {contract.status === 'pending' &&
                    ((user.role === 'client' && !contract.client_signed) ||
                      (user.role === 'freelancer' && !contract.freelancer_signed)) && (
                      <button
                        onClick={() => handleSignContract(contract.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Sign Contract
                      </button>
                    )}
                  {contract.status === 'active' && user.role === 'client' && (
                    <button
                      onClick={() => handleCompleteContract(contract.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No contracts found</p>
          </div>
        )}
      </div>
    </div>
  );
}