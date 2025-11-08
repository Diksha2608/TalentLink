// frontend/src/pages/ClientDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, FileText, CheckCircle, Users, DollarSign, Clock, MapPin, Award } from 'lucide-react';
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

  const handleCreateJob = () => {
    navigate('/jobs/create');
  };

  const formatBudget = (project) => {
    if (project.job_type === 'hourly' && (project.hourly_min || project.hourly_max)) {
      return `₹${project.hourly_min || 0} - ₹${project.hourly_max || 0}/hr`;
    } else if (project.job_type === 'fixed' && project.fixed_payment) {
      return `₹${project.fixed_payment}`;
    } else {
      return `₹${project.budget_min} - ₹${project.budget_max}`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Client Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={handleCreateJob}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 shadow-md"
            >
              + Post New Job
            </button>
            <button
              onClick={handleCreateProject}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 shadow-md"
            >
              + Post New Project
            </button>
          </div>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block border-2 border-gray-200 rounded-xl p-5 hover:border-purple-400 hover:shadow-lg transition-all"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1 pr-2">
                      {project.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Category */}
                  {project.category && (
                    <div className="mb-3">
                      <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {project.category}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>

                  {/* Skills */}
                  {project.skills_required && project.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.skills_required.slice(0, 3).map((skill) => (
                        <span
                          key={skill.id}
                          className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {project.skills_required.length > 3 && (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          +{project.skills_required.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Info Grid */}
                  <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">
                    {/* Budget */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <DollarSign size={14} />
                        <span className="font-medium">Budget:</span>
                      </div>
                      <span className="font-bold text-gray-900">{formatBudget(project)}</span>
                    </div>

                    {/* Experience Level */}
                    {project.experience_level && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Award size={14} />
                          <span className="font-medium">Level:</span>
                        </div>
                        <span className="font-semibold text-gray-900 capitalize">
                          {project.experience_level}
                        </span>
                      </div>
                    )}

                    {/* Location Type */}
                    {project.location_type && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin size={14} />
                          <span className="font-medium">Type:</span>
                        </div>
                        <span className="font-semibold text-gray-900 capitalize">
                          {project.location_type}
                        </span>
                      </div>
                    )}

                    {/* Duration */}
                    {project.duration && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock size={14} />
                          <span className="font-medium">Duration:</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {project.duration.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Users size={14} />
                      <span className="font-semibold text-gray-900">{project.proposal_count || 0}</span>
                      <span>proposals</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 mb-4">You haven't posted any projects yet.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCreateJob}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Post Your First Job
                </button>
                <button
                  onClick={handleCreateProject}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Post Your First Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}