import { MapPin, Star, MessageCircle, Briefcase, Award } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FreelancerCard({ freelancer, showChatButton = true }) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();
  const profile = freelancer.user || {};
  const rating = profile.rating_avg || 0;
  const hourlyRate = freelancer.hourly_rate || 0;
  const isTopRated = rating >= 4.5;
  const isRisingTalent = freelancer.projects_completed > 0 && freelancer.projects_completed <= 5;

  const handleCardClick = (e) => {

    if (!e.target.closest('.chat-button')) {
      setShowProfileModal(true);
    }
  };

  const handleStartChat = (e) => {
    e.stopPropagation();
    navigate(`/messages?user=${profile.id}`);
  };

  return (
    <>
      <div onClick={handleCardClick}>
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer hover:border-purple-300">
          <div className="flex items-start gap-4 mb-4">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={`${profile.first_name} ${profile.last_name}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-200">
                <span className="text-purple-600 font-semibold text-lg">
                  {profile.first_name?.[0] || 'U'}
                  {profile.last_name?.[0] || ''}
                </span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {profile.first_name} {profile.last_name}
                </h3>
                {isTopRated && (
                  <Award size={16} className="text-yellow-500" title="Top Rated" />
                )}
              </div>
              {freelancer.role_title && (
                <p className="text-sm text-gray-600 mb-2">{freelancer.role_title}</p>
              )}
              <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
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
                {isRisingTalent && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    Rising Talent
                  </span>
                )}
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
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                >
                  {skill.name}
                </span>
              ))}
              {freelancer.skills.length > 4 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  +{freelancer.skills.length - 4} more
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Briefcase size={14} />
              <span>{freelancer.projects_completed || 0} projects</span>
            </div>
            {freelancer.availability && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs capitalize">
                {freelancer.availability.replace('-', ' ')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <div className="flex-1 flex items-center gap-1 text-green-600 font-semibold">
              <span className="text-base">{formatCurrency(hourlyRate)}/hr</span>
            </div>
            {showChatButton && (
              <button
                onClick={handleStartChat}
                className="chat-button flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition"
              >
                <MessageCircle size={16} />
                Chat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Detail Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Freelancer Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 text-sm">
              {/* Profile Header */}
              <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center border-4 border-purple-200">
                    <span className="text-purple-600 font-semibold text-3xl">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {profile.first_name} {profile.last_name}
                    </h3>
                    {isTopRated && (
                      <Award size={20} className="text-yellow-500" title="Top Rated" />
                    )}
                  </div>
                  {freelancer.role_title && (
                    <p className="text-lg text-gray-600 mb-3">{freelancer.role_title}</p>
                  )}
                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold">{rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase size={16} />
                      <span>{freelancer.projects_completed || 0} projects completed</span>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(hourlyRate)}/hr
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">About</h4>
                  <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Skills */}
              {freelancer.skills && freelancer.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {freelancer.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio text/links */}
              {freelancer.portfolio && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Portfolio</h4>
                  <p className="text-gray-700">{freelancer.portfolio}</p>
                </div>
              )}

              {/* Portfolio Files (view/download) */}
              {Array.isArray(freelancer.portfolio_files) && freelancer.portfolio_files.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Portfolio Files</h4>
                  <ul className="space-y-2">
                    {freelancer.portfolio_files.map((f) => (
                      <li key={f.id} className="flex items-center justify-between border rounded-lg px-3 py-2 hover:bg-gray-50">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{f.file_name || 'File'}</div>
                          <div className="text-gray-500 text-xs">{((f.file_size || 0) / 1024).toFixed(1)} KB</div>
                        </div>
                        <a
                          href={f.file_url || (f.file && f.file)}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs font-semibold"
                        >
                          View / Download
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Languages*/}
              {Array.isArray(freelancer.languages) && freelancer.languages.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {freelancer.languages.map((lang, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {typeof lang === 'string'
                          ? lang
                          : (lang?.name || lang?.language || 'Language')}
                        {lang && (lang.level || lang.proficiency)
                          ? ` • ${lang.level || lang.proficiency}`
                          : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {freelancer.experiences && freelancer.experiences.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Experience</h4>
                  <div className="space-y-4">
                    {freelancer.experiences.map((exp, idx) => (
                      <div key={idx} className="border-l-2 border-purple-500 pl-4">
                        <h5 className="font-semibold text-gray-900">{exp.title || exp.position}</h5>
                        <p className="text-gray-600">{exp.company}</p>
                        <p className="text-gray-500 text-xs">
                          {exp.startDate || exp.start || '—'} → {exp.endDate || exp.end || (exp.current ? 'Present' : '—')}
                        </p>
                        {exp.description && (
                          <p className="text-gray-700 mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {freelancer.education && freelancer.education.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Education</h4>
                  <div className="space-y-3">
                    {freelancer.education.map((edu, idx) => (
                      <div key={idx} className="border-l-2 border-purple-500 pl-4">
                        <h5 className="font-semibold text-gray-900">{edu.degree || edu.title}</h5>
                        <p className="text-gray-600">{edu.institution || edu.school}</p>
                        <p className="text-gray-500 text-xs">{edu.field ? `${edu.field} • ` : ''}{edu.year || edu.period}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    handleStartChat({ stopPropagation: () => {} });
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
                >
                  <MessageCircle size={18} />
                  Start Conversation
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
