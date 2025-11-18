import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, IndianRupee, FileText, TrendingUp, User, CheckCircle, AlertCircle, Edit, Edit2, Layers } from 'lucide-react';
import { authAPI } from '../api/auth';
import { jobApplicationsAPI } from '../api/jobApplications';

const DashboardCard = ({ title, value, icon: Icon, color, isCurrency }) => {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };
  
  return (
    <div className="bg-white rounded-xl shadow p-3 sm:p-4 hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] sm:text-xs text-gray-600 font-medium truncate pr-2">{title}</p>
        <div className={`p-1.5 sm:p-2 rounded-lg ${colorClasses[color]} flex-shrink-0`}>
          <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
        {isCurrency ? `₹${Number(value || 0).toLocaleString()}` : value}
      </p>
    </div>
  );
};

export default function FreelancerDashboard({ user }) {
  const [stats, setStats] = useState({
    activeJobs: 0,
    proposalsSent: 0,
    earnings: 0,
    completedProjects: 0,
  });
  const [proposals, setProposals] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('projects');
  const [contracts, setContracts] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(45);
  const [missingItems, setMissingItems] = useState([
    'Bio (50+ chars)',
    'Location',
    'Professional title',
    'Hourly rate'
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch profile
        const prof = await authAPI.getFreelancerProfile();
        const p = prof.data || {};
        
        let prop = [], contr = [], jobApps = [];
        
        // Fetch proposals
        if (authAPI.getMyProposals) {
          try { 
            const r = await authAPI.getMyProposals(); 
           
            prop = Array.isArray(r.data) ? r.data : (r.data?.results || []);
            console.log('Proposals fetched:', prop); 
          } catch (err) {
            console.error('Error fetching proposals:', err);
          }
        }
        
        // Fetch job applications
        try {
          const r = await jobApplicationsAPI.list();
          jobApps = Array.isArray(r.data) ? r.data : (r.data?.results || []);
          console.log('Job applications fetched:', jobApps);
        } catch (err) {
          console.error('Error fetching job applications:', err);
        }
        
        // Fetch contracts
        if (authAPI.getMyContracts) {
          try { 
            const r = await authAPI.getMyContracts(); 
           
            contr = Array.isArray(r.data) ? r.data : (r.data?.results || []);
            console.log('Contracts fetched:', contr); 
          } catch (err) {
            console.error('Error fetching contracts:', err);
          }
        }
        
        if (!mounted) return;
        
        
        setProposals(Array.isArray(prop) ? prop : []);
        setJobApplications(Array.isArray(jobApps) ? jobApps : []);
        setContracts(Array.isArray(contr) ? contr : []);
        setStats({
          activeJobs: contr.filter(c => c.status === 'active').length || 0,
          proposalsSent: (prop.length + jobApps.length) || 0,
          earnings: p.total_earnings || 0,
          completedProjects: p.projects_completed || 0,
        });
        
        // Profile completion calculation
        const socials = p.social_links || {};
        const socialFilled = Boolean(socials.linkedin || socials.github || socials.website || socials.other);
        const portfolioFiles = p.portfolio_files || [];

        const checks = [
          Boolean(user?.avatar),
          Boolean(user?.bio && user.bio.length >= 50),
          Boolean(user?.location),
          Boolean(p.role_title),
          Number(p.hourly_rate) > 0,
          (p.skills || []).length > 0,
          (p.languages || []).length > 0,
          (p.experiences || []).length > 0,
          (p.education || []).length > 0,
          socialFilled,
          (portfolioFiles || []).length > 0,
        ];
        
        const total = checks.length;
        const done = checks.filter(Boolean).length;
        setProfileCompletion(Math.round((done / total) * 100));

        const missing = [];
        if (!checks[0]) missing.push('Profile photo');
        if (!checks[1]) missing.push('Bio (50+ chars)');
        if (!checks[2]) missing.push('Location');
        if (!checks[3]) missing.push('Professional title');
        if (!checks[4]) missing.push('Hourly rate');
        if (!checks[5]) missing.push('Add at least 1 skill');
        if (!checks[6]) missing.push('Languages');
        if (!checks[7]) missing.push('Experience');
        if (!checks[8]) missing.push('Education');
        if (!checks[9]) missing.push('Social links');
        if (!checks[10]) missing.push('Portfolio files');
        setMissingItems(missing);
        
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        if (mounted) setError('Failed to load dashboard data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchData();
    return () => { mounted = false; };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Get active and pending contracts for display
  const activeAndPendingContracts = Array.isArray(contracts) ? contracts.filter(c => c.status === 'active' || c.status === 'pending') : [];

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-5 px-3 sm:px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-xl sm:text-2xl font-extrabold mb-4 sm:mb-5 text-gray-900">
          Freelancer Dashboard
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <DashboardCard 
            title="Active Jobs" 
            value={stats.activeJobs} 
            icon={Briefcase} 
            color="purple" 
          />
          <DashboardCard 
            title="Proposals" 
            value={stats.proposalsSent} 
            icon={FileText} 
            color="blue" 
          />
          <DashboardCard 
            title="Earnings" 
            value={stats.earnings} 
            icon={IndianRupee} 
            color="green" 
            isCurrency 
          />
          <DashboardCard 
            title="Completed" 
            value={stats.completedProjects} 
            icon={TrendingUp} 
            color="orange" 
          />

          {/* Profile Progress Card */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1 rounded-2xl p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-xl sm:text-2xl font-bold">{profileCompletion}%</p>
                  <p className="text-xs sm:text-sm opacity-90 truncate">
                    {profileCompletion >= 90
                      ? "Perfect!"
                      : profileCompletion >= 60
                      ? "Almost There"
                      : "Keep Going"}
                  </p>
                </div>
                <div className="mt-2 h-1.5 sm:h-2 w-full bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(0, profileCompletion))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3">
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-white text-purple-700 font-medium rounded-lg hover:bg-purple-50 text-xs sm:text-sm"
              >
                <Edit2 size={14} className="sm:w-4 sm:h-4" /> Complete
              </Link>
            </div>
          </div>
        </div>

        {/* Two Column Content */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 mb-6">
          {/* Proposals / Job Applications */}
          <div className="bg-white rounded-xl shadow p-4 sm:p-5 hover:shadow-lg transition">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Layers size={20} className="text-purple-600" />
                My Applications
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTab === 'projects'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Projects ({proposals.length})
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                    activeTab === 'jobs'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Jobs ({jobApplications.length})
                </button>
              </div>
            </div>
            
            {activeTab === 'projects' ? (
              <>
                {Array.isArray(proposals) && proposals.length > 0 ? (
                  <div className="space-y-3">
                    {proposals.slice(0, 5).map((proposal) => (
                      <Link
                        key={proposal.id}
                        to={`/projects/${proposal.project_id || proposal.project}`}
                        className="block border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-md transition cursor-pointer"
                      >
                        <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-1">
                          {proposal.project_title || 'Untitled Project'}
                        </h3>
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">
                            ₹{Number(proposal.bid_amount || 0).toLocaleString()}
                          </span>
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                            proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            proposal.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {proposal.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                    {proposals.length > 5 && (
                      <Link to="/proposals" className="block text-center text-sm text-purple-600 hover:underline py-2">
                        View all {proposals.length} proposals →
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <FileText className="mx-auto text-gray-300 mb-2" size={36} />
                    <p className="text-gray-600 mb-3 text-sm">No project proposals yet</p>
                    <Link 
                      to="/projects" 
                      className="inline-block px-4 sm:px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-sm shadow-md"
                    >
                      Browse Projects
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <>
                {Array.isArray(jobApplications) && jobApplications.length > 0 ? (
                  <div className="space-y-3">
                    {jobApplications.slice(0, 5).map((app) => (
                      <Link
                        key={app.id}
                        to={`/jobs/${app.job_id || app.job}`}
                        className="block border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-md transition cursor-pointer"
                      >
                        <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-1">
                          {app.job_title || 'Untitled Job'}
                        </h3>
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="text-xs sm:text-sm text-gray-600 font-medium">
                            ₹{Number(app.bid_amount || 0).toLocaleString()}
                          </span>
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                    {jobApplications.length > 5 && (
                      <p className="text-center text-sm text-purple-600 py-2">
                        {jobApplications.length - 5} more job applications
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <FileText className="mx-auto text-gray-300 mb-2" size={36} />
                    <p className="text-gray-600 mb-3 text-sm">No job applications yet</p>
                    <Link 
                      to="/jobs" 
                      className="inline-block px-4 sm:px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-sm shadow-md"
                    >
                      Browse Jobs
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Contracts */}
          <div className="bg-white rounded-xl shadow p-4 sm:p-5 hover:shadow-lg transition">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Active & Pending Contracts</h2>
              <Link to="/contracts" className="text-xs text-purple-600 hover:underline font-medium whitespace-nowrap">
                View All →
              </Link>
            </div>
            {activeAndPendingContracts.length > 0 ? (
              <div className="space-y-3">
                {activeAndPendingContracts.slice(0, 5).map((contract) => (
                  <Link
                    key={contract.id}
                    to={`/contracts/${contract.id}`}
                    className="block border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-md transition cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-1">
                      {contract.project_title || 'Untitled Project'}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                      Client: {contract.client_name || 'Unknown'}
                    </p>
                    <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                      contract.status === 'active' 
                        ? 'bg-blue-100 text-blue-700' 
                        : contract.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {contract.status}
                    </span>
                  </Link>
                ))}
                {activeAndPendingContracts.length > 5 && (
                  <p className="text-center text-sm text-purple-600 py-2">
                    {activeAndPendingContracts.length - 5} more contracts
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Briefcase className="mx-auto text-gray-300 mb-2" size={36} />
                <p className="text-gray-600 text-sm">No active or pending contracts</p>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        {profileCompletion < 100 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6 shadow">
            <h3 className="font-bold text-blue-900 mb-3 text-sm sm:text-base flex items-center gap-2">
              💡 Boost Your Success
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition">
                <p className="font-semibold mb-1 text-xs sm:text-sm text-blue-900">Complete Profile</p>
                <p className="text-[10px] sm:text-xs text-blue-700">Get 40% more views</p>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition">
                <p className="font-semibold mb-1 text-xs sm:text-sm text-blue-900">Add Portfolio</p>
                <p className="text-[10px] sm:text-xs text-blue-700">Showcase your work</p>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition">
                <p className="font-semibold mb-1 text-xs sm:text-sm text-blue-900">Link Socials</p>
                <p className="text-[10px] sm:text-xs text-blue-700">Build trust</p>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition">
                <p className="font-semibold mb-1 text-xs sm:text-sm text-blue-900">Missing Items</p>
                <p className="text-[10px] sm:text-xs text-blue-700">{missingItems.length} items left</p>
              </div>
            </div>
            {missingItems.length > 0 && (
              <div className="mt-4 bg-white bg-opacity-70 rounded-lg p-3 sm:p-4">
                <p className="font-semibold mb-2 flex items-center gap-2 text-xs sm:text-sm text-blue-900">
                  <AlertCircle size={16} /> Complete these to boost your profile:
                </p>
                <ul className="grid sm:grid-cols-2 gap-2 text-[11px] sm:text-xs text-blue-800">
                  {missingItems.slice(0, 6).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-600 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                  {missingItems.length > 6 && (
                    <li className="text-purple-700 font-medium">
                      +{missingItems.length - 6} more items
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}