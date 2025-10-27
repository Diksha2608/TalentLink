// frontend/src/pages/ProjectFeed.jsx
import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import { projectsAPI } from '../api/projects';

export default function ProjectFeed() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [statusFilter]);

  const loadProjects = () => {
    setLoading(true);
    projectsAPI
      .list({ status: statusFilter, search: searchTerm })
      .then((res) => setProjects(res.data.results || res.data))
      .finally(() => setLoading(false));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProjects();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Browse Projects</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading projects...</div>
        ) : projects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            No projects found. Try adjusting your filters.
          </div>
        )}
      </div>
    </div>
  );
}