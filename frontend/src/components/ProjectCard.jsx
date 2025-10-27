import { Link } from 'react-router-dom';
import { Briefcase, Clock } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`}>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {project.skills_required?.slice(0, 3).map((skill) => (
            <span
              key={skill.id}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
            >
              {skill.name}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-green-600">
              {formatCurrency(project.budget_min)} - {formatCurrency(project.budget_max)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{project.duration_estimate?.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Briefcase size={16} />
            <span>{project.proposal_count || 0} proposals</span>
          </div>
        </div>
      </div>
    </Link>
  );
}