// frontend/src/pages/ClientDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, FileText, CheckCircle, Users } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import { projectsAPI } from '../api/projects';
import { contractsAPI } from '../api/contracts';

export default function ClientDashboard({ user }) {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalProposals: 0,
    completedProjects: 0,
  });
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get all projects
      const projectsRes = await projectsAPI.list();
      const allProjects = projectsRes.data.results || projectsRes.data;
      
      // Filter to show only current user's projects
      const myProjects = allProjects.filter(p => p.client === user.id);
      
      setProjects(myProjects);
      
      const totalProposals = myProjects.reduce((sum, p) => sum + (p.proposal_count || 0), 0);
      
      setStats({
        totalProjects: myProjects.length,
        activeProjects: myProjects.filter((p) => p.status === 'open' || p.status === 'in_progress').length,
        totalProposals,
        completedProjects: myProjects.filter((p) => p.status === 'completed').length,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };
  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Client Dashboard</h1>
          <button
            onClick={handleCreateProject}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
          >
            + Post New Project
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <DashboardCard title="Total Projects" value={stats.totalProjects} icon={Briefcase} color="purple" />
          <DashboardCard title="Active Projects" value={stats.activeProjects} icon={FileText} color="blue" />
          <DashboardCard title="Proposals Received" value={stats.totalProposals} icon={Users} color="orange" />
          <DashboardCard title="Completed" value={stats.completedProjects} icon={CheckCircle} color="green" />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Your Projects</h2>
          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{project.title}</h3>
                      <p className="text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-500">
                        <span>Budget: ₹{project.budget_min} - ₹{project.budget_max}</span>
                        <span>•</span>
                        <span>{project.proposal_count || 0} proposals</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'open'
                          ? 'bg-green-100 text-green-700'
                          : project.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't posted any projects yet.</p>
              <button
                onClick={handleCreateProject}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Post Your First Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}