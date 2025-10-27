// frontend/src/pages/FreelancerDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, DollarSign, FileText, TrendingUp } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import { proposalsAPI } from '../api/proposals';
import { contractsAPI } from '../api/contracts';

export default function FreelancerDashboard({ user }) {
  const [stats, setStats] = useState({
    activeJobs: 0,
    proposalsSent: 0,
    earnings: 0,
    completedProjects: 0,
  });
  const [proposals, setProposals] = useState([]);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const proposalsRes = await proposalsAPI.list();
      const contractsRes = await contractsAPI.list();
      
      setProposals(proposalsRes.data.results || proposalsRes.data);
      setContracts(contractsRes.data.results || contractsRes.data);

      setStats({
        activeJobs: contractsRes.data.filter((c) => c.status === 'active').length,
        proposalsSent: proposalsRes.data.length,
        earnings: user.freelancer_profile?.total_earnings || 0,
        completedProjects: user.freelancer_profile?.projects_completed || 0,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Freelancer Dashboard</h1>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <DashboardCard title="Active Jobs" value={stats.activeJobs} icon={Briefcase} color="purple" />
          <DashboardCard title="Proposals Sent" value={stats.proposalsSent} icon={FileText} color="blue" />
          <DashboardCard title="Total Earnings" value={stats.earnings} icon={DollarSign} color="green" isCurrency={true} />
          <DashboardCard title="Completed" value={stats.completedProjects} icon={TrendingUp} color="orange" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Recent Proposals</h2>
              <Link to="/projects" className="text-purple-600 hover:underline">
                Browse Projects
              </Link>
            </div>
            {proposals.length > 0 ? (
              <div className="space-y-4">
                {proposals.slice(0, 5).map((proposal) => (
                  <div key={proposal.id} className="border-b border-gray-200 pb-4">
                    <h3 className="font-semibold text-gray-900">{proposal.project_title}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-600">Bid: INR {proposal.bid_amount}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          proposal.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : proposal.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {proposal.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No proposals yet. Start browsing projects!</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Active Contracts</h2>
              <Link to="/contracts" className="text-purple-600 hover:underline">
                View All
              </Link>
            </div>
            {contracts.length > 0 ? (
              <div className="space-y-4">
                {contracts.filter((c) => c.status === 'active').slice(0, 5).map((contract) => (
                  <div key={contract.id} className="border-b border-gray-200 pb-4">
                    <h3 className="font-semibold text-gray-900">{contract.project_title}</h3>
                    <p className="text-sm text-gray-600 mt-1">Client: {contract.client_name}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {contract.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No active contracts yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}