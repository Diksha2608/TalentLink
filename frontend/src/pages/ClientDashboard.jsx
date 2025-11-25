// frontend/src/pages/ClientDashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  CheckCircle,
  Users,
  IndianRupee,
  Clock,
  MapPin,
  Award,
  Layers
} from 'lucide-react';

import DashboardCard from '../components/DashboardCard';
import { projectsAPI } from '../api/projects';
import { jobsAPI } from '../api/jobs';
import { jobApplicationsAPI } from '../api/jobApplications';

export default function ClientDashboard({ user }) {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalProposals: 0,
    completedProjects: 0,
  });

  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applicationCounts, setApplicationCounts] = useState({});
  const [activeTab, setActiveTab] = useState('projects');
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ✅ FINAL UPDATED FUNCTION
  const loadDashboardData = async () => {
    try {
      // PROJECTS
      const projectsRes = await projectsAPI.list();
      const allProjects = projectsRes.data.results || projectsRes.data;
      const myProjects = allProjects.filter((p) => p.client === user.id);
      setProjects(myProjects);

      // ✅ Project proposal count
      const projectProposalCount = myProjects.reduce(
        (sum, p) => sum + (p.proposal_count || 0),
        0
      );

      // JOBS
      const jobsRes = await jobsAPI.list();
      const allJobs = jobsRes.data.results || jobsRes.data;
      const myJobs = allJobs.filter((j) => j.client === user.id);
      setJobs(myJobs);

      // ✅ Job application count
      let jobApplicationCount = 0;
      const counts = {};

      for (const job of myJobs) {
        try {
          const appsResponse = await jobApplicationsAPI.list({ job: job.id });
          const count = appsResponse.data.results?.length || 0;

          counts[job.id] = count;
          jobApplicationCount += count; // add to total
        } catch {
          counts[job.id] = 0;
        }
      }

      setApplicationCounts(counts);

      // ✅ Final combined total
      const totalProposals = projectProposalCount + jobApplicationCount;
      // ✅ Project-only counts
      const activeProjectCount = myProjects.filter((p) =>
        ['open', 'in_progress'].includes(p.status)
      ).length;
      const completedProjectCount = myProjects.filter(
        (p) => p.status === 'completed'
      ).length;

      // ✅ Job-only counts
      const activeJobCount = myJobs.filter((j) =>
        ['open', 'in_progress'].includes(j.status)
      ).length;
      const completedJobCount = myJobs.filter(
        (j) => j.status === 'completed'
      ).length;

      setStats({
        // Projects only
        totalProjects: myProjects.length,
        activeProjects: activeProjectCount,
        completedProjects: completedProjectCount,

        // Jobs only (for separate cards / UI)
        totalJobs: myJobs.length,
        activeJobs: activeJobCount,
        completedJobs: completedJobCount,

        // Proposals from both
        totalProposals: totalProposals,
      });

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const handleCreateProject = () => navigate('/projects/create');
  const handleCreateJob = () => navigate('/jobs/create');

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
      case 'open': return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Client Dashboard</h1>
          <div className="flex gap-3">
            <button onClick={handleCreateJob} className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700">+ Post New Job</button>
            <button onClick={handleCreateProject} className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700">+ Post New Project</button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={Layers}
            color="purple"
          />
          <DashboardCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={FileText}
            color="blue"
          />
          <DashboardCard
            title="Jobs Posted"
            value={stats.totalJobs}
            icon={Briefcase}
            color="orange"
          />
          <DashboardCard
            title="Proposals Received"
            value={stats.totalProposals}
            icon={Users}
            color="green"
          />
        </div>
        {/* Your Activity summary */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Your Activity</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {/* Completed Projects */}
            <div className="border rounded-lg p-4 flex flex-col gap-1">
              <span className="text-gray-500">Completed Projects</span>
              <span className="text-2xl font-bold text-green-600">
                {stats.completedProjects}
              </span>
              <span className="text-xs text-gray-500">
                Projects marked as completed via contracts
              </span>
            </div>

            {/* Active Projects */}
            <div className="border rounded-lg p-4 flex flex-col gap-1">
              <span className="text-gray-500">Active Projects</span>
              <span className="text-2xl font-bold text-blue-600">
                {stats.activeProjects}
              </span>
              <span className="text-xs text-gray-500">
                Open or in-progress projects
              </span>
            </div>

            {/* Completed Jobs */}
            <div className="border rounded-lg p-4 flex flex-col gap-1">
              <span className="text-gray-500">Completed Jobs</span>
              <span className="text-2xl font-bold text-green-700">
                {stats.completedJobs}
              </span>
              <span className="text-xs text-gray-500">
                Jobs completed via contracts
              </span>
            </div>

            {/* Active Jobs */}
            <div className="border rounded-lg p-4 flex flex-col gap-1">
              <span className="text-gray-500">Active Jobs</span>
              <span className="text-2xl font-bold text-indigo-600">
                {stats.activeJobs}
              </span>
              <span className="text-xs text-gray-500">
                Currently open or in-progress jobs
              </span>
            </div>
          </div>
        </div>


        {/* MAIN WRAPPER */}
        <div className="bg-white rounded-lg shadow-md p-6">

          {/* TABS */}
          <div className="flex justify-between mb-6 border-b pb-4">
            <h2 className="text-2xl font-semibold">Your Postings</h2>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${activeTab === 'projects' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Layers size={16} />
                Projects ({projects.length})
              </button>

              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${activeTab === 'jobs' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <Briefcase size={16} />
                Jobs ({jobs.length})
              </button>
            </div>
          </div>

          {/* PROJECTS VIEW */}
          {activeTab === 'projects' ? (
            projects.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {projects.map((project) => (
                  <Link key={project.id} to={`/projects/${project.id}`} className="block border-2 border-gray-200 rounded-xl p-5 hover:border-purple-400 hover:shadow-lg">

                    {/* Header */}
                    <div className="flex justify-between mb-3">
                      <h3 className="font-bold text-lg line-clamp-2">{project.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Category */}
                    {project.category && (
                      <div className="mb-3">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">{project.category}</span>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>

                    {/* Skills */}
                    {project.skills_required?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.skills_required.slice(0, 3).map((skill) => (
                          <span key={skill.id} className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">{skill.name}</span>
                        ))}
                        {project.skills_required.length > 3 && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">+{project.skills_required.length - 3} more</span>
                        )}
                      </div>
                    )}

                    {/* INFO BOX */}
                    <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">

                      {/* Budget */}
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <IndianRupee size={14} />
                          Budget:
                        </div>
                        <span className="font-bold">{formatBudget(project)}</span>
                      </div>

                      {/* Level */}
                      {project.experience_level && (
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600"><Award size={14} /> Level:</div>
                          <span className="font-semibold capitalize">{project.experience_level}</span>
                        </div>
                      )}

                      {/* Location */}
                      {project.location_type && (
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600"><MapPin size={14} /> Type:</div>
                          <span className="font-semibold capitalize">{project.location_type}</span>
                        </div>
                      )}

                      {/* Duration */}
                      {project.duration && (
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600"><Clock size={14} /> Duration:</div>
                          <span className="font-semibold">
                            {project.duration.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        </div>
                      )}

                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-between border-t pt-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Users size={14} />
                        <span className="font-semibold">{project.proposal_count || 0}</span>
                        proposals
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
                <button onClick={handleCreateProject} className="px-6 py-2 bg-purple-600 text-white rounded-lg">Post Your First Project</button>
              </div>
            )
          ) : (
            /* JOBS VIEW */
            jobs.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {jobs.map((job) => (
                  <Link key={job.id} to={`/jobs/${job.id}`} className="block border-2 border-gray-200 rounded-xl p-5 hover:border-purple-400 hover:shadow-lg">

                    {/* Header */}
                    <div className="flex justify-between mb-3">
                      <h3 className="font-bold text-lg line-clamp-2">{job.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(job.status)}`}>
                        {job.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Type */}
                    <div className="mb-3">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full capitalize">
                        {job.job_type === 'hourly' ? 'Hourly' : 'Fixed Price'}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                    {/* INFO BOX */}
                    <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">

                      {/* Payment */}
                      <div className="flex justify-between text-sm">
                        <div className="flex gap-1.5 items-center text-gray-600"><IndianRupee size={14} /> Payment:</div>
                        <span className="font-bold text-green-600">
                          {job.job_type === 'hourly' && job.hourly_min && job.hourly_max
                            ? `₹${job.hourly_min}-${job.hourly_max}/hr`
                            : job.job_type === 'fixed' && job.fixed_amount
                            ? `₹${job.fixed_amount}`
                            : 'Not specified'}
                        </span>
                      </div>

                      {/* Level */}
                      {job.experience_level && (
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600"><Award size={14} /> Level:</div>
                          <span className="font-semibold capitalize">{job.experience_level}</span>
                        </div>
                      )}

                      {/* Location */}
                      {job.location_type && (
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600"><MapPin size={14} /> Type:</div>
                          <span className="font-semibold capitalize">{job.location_type}</span>
                        </div>
                      )}

                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-between pt-3 border-t text-sm">
                      <div className="flex items-center gap-1.5">
                        <Users size={14} />
                        <span className="font-semibold text-purple-700">{applicationCounts[job.id] || 0}</span>
                        application{(applicationCounts[job.id] || 0) !== 1 ? 's' : ''}
                      </div>
                      <span className="text-xs text-gray-500">{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>

                  </Link>
                ))}

              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">You haven't posted any jobs yet.</p>
                <button onClick={handleCreateJob} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Post Your First Job</button>
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}
