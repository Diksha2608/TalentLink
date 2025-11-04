import { MapPin, Star, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

export default function FreelancerCard({ freelancer }) {
  const profile = freelancer.user || {};
  const rating = profile.rating_avg || 0;
  const hourlyRate = freelancer.hourly_rate || 0;
  
  // For now, link to a placeholder - can be updated when public profile page is available
  const handleClick = (e) => {
    // If profile page doesn't support public viewing, prevent navigation
    // You can update this when a public profile route is available
    e.preventDefault();
    // Optionally: show a message or modal about viewing the profile
  };

  return (
    <div onClick={handleClick}>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start gap-4 mb-4">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={`${profile.first_name} ${profile.last_name}`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-lg">
                {profile.first_name?.[0] || 'U'}
                {profile.last_name?.[0] || ''}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {profile.first_name} {profile.last_name}
            </h3>
            {freelancer.role_title && (
              <p className="text-sm text-gray-600 mb-2">{freelancer.role_title}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{profile.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {profile.bio && (
          <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{profile.bio}</p>
        )}

        {freelancer.skills && freelancer.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {freelancer.skills.slice(0, 4).map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
              >
                {skill.name}
              </span>
            ))}
            {freelancer.skills.length > 4 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                +{freelancer.skills.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-1 text-green-600 font-semibold">
            <span>{formatCurrency(hourlyRate)}/hr</span>
          </div>
          {freelancer.availability && (
            <span className="text-xs text-gray-500 capitalize">
              {freelancer.availability.replace('-', ' ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

