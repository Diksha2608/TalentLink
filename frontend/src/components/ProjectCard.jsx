import { Link } from 'react-router-dom';
import { Briefcase, Clock, Calendar, Users, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function ProjectCard({ project }) {
  // Helper to format duration
  const formatDuration = (duration) => {
    const durationMap = {
      'less_1_month': 'Less than 1 month',
      '1_3_months': '1-3 months',
      '3_6_months': '3-6 months',
      '6_plus_months': '6+ months'
    };
    return durationMap[duration] || duration;
  };

  // Helper to format hours per week
  const formatHours = (hours) => {
    const hoursMap = {
      'less_30': 'Less than 30 hrs/week',
      'more_30': 'More than 30 hrs/week'
    };
    return hoursMap[hours] || hours;
  };

  // Helper to format job type
  const formatJobType = (jobType) => {
    return jobType === 'hourly' ? 'Hourly' : 'Fixed Price';
  };

  return (
    <Link to={`/projects/${project.id}`}>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
        
        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
        
        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.skills_required?.slice(0, 3).map((skill) => (
            <span
              key={skill.id}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
            >
              {skill.name}
            </span>
          ))}
          {project.skills_required?.length > 3 && (
            <span className="text-xs text-gray-500">
              +{project.skills_required.length - 3} more
            </span>
          )}
        </div>

        {/* Project Details */}
        <div className="space-y-2 mb-4">
          {/* Duration */}
          {project.duration && (
            <div className="flex items-center text-sm text-gray-700">
              <Calendar className="w-4 h-4 mr-2 text-purple-600" />
              <span className="font-semibold mr-1">Duration:</span>
              <span>{formatDuration(project.duration)}</span>
            </div>
          )}

          {/* Hours per week */}
          {project.hours_per_week && (
            <div className="flex items-center text-sm text-gray-700">
              <Clock className="w-4 h-4 mr-2 text-purple-600" />
              <span className="font-semibold mr-1">Time:</span>
              <span>{formatHours(project.hours_per_week)}</span>
            </div>
          )}

          {/* Job Type & Budget */}
          <div className="flex items-center text-sm text-gray-700">
            <DollarSign className="w-4 h-4 mr-2 text-purple-600" />
            <span className="font-semibold mr-1">{project.job_type ? formatJobType(project.job_type) : 'Budget'}:</span>
            {project.job_type === 'fixed' && project.fixed_payment ? (
              <span className="text-green-600 font-bold">{formatCurrency(project.fixed_payment)}</span>
            ) : project.job_type === 'hourly' && (project.hourly_min || project.hourly_max) ? (
              <span className="text-green-600 font-bold">
                {formatCurrency(project.hourly_min || 0)} - {formatCurrency(project.hourly_max || 0)}/hr
              </span>
            ) : (
              <span className="text-green-600 font-bold">
                {formatCurrency(project.budget_min)} - {formatCurrency(project.budget_max)}
              </span>
            )}
          </div>

          {/* Proposals */}
          <div className="flex items-center text-sm text-gray-700">
            <Users className="w-4 h-4 mr-2 text-purple-600" />
            <span className="font-semibold mr-1">Proposals:</span>
            <span>{project.proposal_count || 0}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-200">
          <span>By: {project.client_name || 'Client'}</span>
          <span>{new Date(project.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}
