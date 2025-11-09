import { useState, useEffect } from 'react';
import { Search, X, Clock, DollarSign, MapPin, Briefcase, Award, Calendar } from 'lucide-react';
import { jobsAPI } from '../api/jobs'; 
import { Link } from 'react-router-dom';

const JOB_TYPES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'fixed', label: 'Fixed Price' },
];

const EXPERIENCE_LEVEL = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' }
];

const POSTED_TIME = [
  { value: '24h', label: 'Last 24 hours' },
  { value: 'week', label: 'Last week' },
  { value: 'month', label: 'Last month' }
];

const LOCATION_TYPE = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' }
];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [jobTypes, setJobTypes] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState([]);
  const [postedTime, setPostedTime] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [location, setLocation] = useState('');
  const [locationType, setLocationType] = useState([]);

  const handleCheckbox = (arr, setArr, v) => {
    setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  };

  const clearAllFilters = () => {
    setJobTypes([]);
    setExperienceLevel([]);
    setPostedTime('');
    setMinRate('');
    setMaxRate('');
    setLocation('');
    setLocationType([]);
    setSearchTerm('');
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  useEffect(() => {
    loadJobs();
  }, [jobTypes, experienceLevel, postedTime, minRate, maxRate, location, locationType, searchTerm]);

  const loadJobs = () => {
    setLoading(true);
    const params = {
      status: 'open',
      search: searchTerm,
      job_type: jobTypes.join(','),
      experience_level: experienceLevel.join(','),
      posted_time: postedTime,
      location: location,
      location_type: locationType.join(','),
    };

    if (minRate) params.hourly_min = minRate;
    if (maxRate) params.hourly_max = maxRate;

    jobsAPI
      .list(params)
      .then((res) => {
        const data = res.data.results || res.data;
        setJobs(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to load jobs:', err);
        setJobs([]);
      })
      .finally(() => setLoading(false));
  };

  const formatJobType = (type) => {
    return type === 'hourly' ? 'Hourly' : 'Fixed Price';
  };

  const formatExperience = (level) => {
    const map = {
      'entry': 'Entry Level',
      'intermediate': 'Intermediate',
      'expert': 'Expert'
    };
    return map[level] || level;
  };

  const formatLocationType = (type) => {
    const map = {
      'remote': 'Remote',
      'hybrid': 'Hybrid',
      'onsite': 'Onsite'
    };
    return map[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
          <p className="text-gray-600">Find hourly and project-based opportunities</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search jobs by title, skills, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters */}
          <aside className="w-72 bg-white rounded-lg shadow-md p-5 shrink-0 h-fit sticky top-20">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
              <h3 className="font-semibold text-base text-gray-900">Filters</h3>
              <button
                onClick={clearAllFilters}
                className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold px-3 py-1.5 rounded-md transition"
              >
                Clear All
              </button>
            </div>

            {/* Job Type */}
            <div className="mb-5">
              <div className="text-sm font-semibold text-gray-800 mb-3">Job Type</div>
              {JOB_TYPES.map((o) => (
                <label
                  key={o.value}
                  className="flex items-center ml-2 py-2 cursor-pointer hover:bg-purple-50 rounded px-2 transition"
                >
                  <input
                    type="checkbox"
                    checked={jobTypes.includes(o.value)}
                    onChange={() => handleCheckbox(jobTypes, setJobTypes, o.value)}
                    className="mr-3 w-4 h-4 accent-purple-600 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{o.label}</span>
                </label>
              ))}
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Experience Level */}
            <div className="mb-5">
              <div className="text-sm font-semibold text-gray-800 mb-3">Experience Level</div>
              {EXPERIENCE_LEVEL.map((o) => (
                <label
                  key={o.value}
                  className="flex items-center ml-2 py-2 cursor-pointer hover:bg-purple-50 rounded px-2 transition"
                >
                  <input
                    type="checkbox"
                    checked={experienceLevel.includes(o.value)}
                    onChange={() => handleCheckbox(experienceLevel, setExperienceLevel, o.value)}
                    className="mr-3 w-4 h-4 accent-purple-600 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{o.label}</span>
                </label>
              ))}
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Location Type */}
            <div className="mb-5">
              <div className="text-sm font-semibold text-gray-800 mb-3">Location Type</div>
              {LOCATION_TYPE.map((o) => (
                <label
                  key={o.value}
                  className="flex items-center ml-2 py-2 cursor-pointer hover:bg-purple-50 rounded px-2 transition"
                >
                  <input
                    type="checkbox"
                    checked={locationType.includes(o.value)}
                    onChange={() => handleCheckbox(locationType, setLocationType, o.value)}
                    className="mr-3 w-4 h-4 accent-purple-600 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{o.label}</span>
                </label>
              ))}
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Posted Time */}
            <div className="mb-5">
              <div className="text-sm font-semibold text-gray-800 mb-3">Posted Time</div>
              <select
                value={postedTime}
                onChange={(e) => setPostedTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Any time</option>
                {POSTED_TIME.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Hourly Rate */}
            <div className="mb-5">
              <div className="text-sm font-semibold text-gray-800 mb-3">
                <DollarSign size={16} className="inline mr-1" />
                Hourly Rate (₹/hr)
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minRate}
                  onChange={(e) => setMinRate(e.target.value)}
                  className="w-1/2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxRate}
                  onChange={(e) => setMaxRate(e.target.value)}
                  className="w-1/2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Location */}
            <div className="mb-5">
              <div className="text-sm font-semibold text-gray-800 mb-3">
                <MapPin size={16} className="inline mr-1" />
                Location
              </div>
              <input
                type="text"
                placeholder="Enter location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </aside>

          {/* Jobs List */}
          <main className="flex-1">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-gray-600">Loading jobs...</p>
              </div>
            ) : jobs.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{jobs.length}</span> job{jobs.length !== 1 ? 's' : ''} found
                </div>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition no-underline border-2 border-transparent hover:border-purple-400"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 hover:text-purple-600 mb-2">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                              Open
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 capitalize">
                              {formatJobType(job.job_type)}
                            </span>
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                              {formatExperience(job.experience_level)}
                            </span>
                            {job.location_type && (
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 capitalize">
                                {formatLocationType(job.location_type)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Job Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {/* Payment */}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-gray-600 mb-1">
                            <DollarSign size={16} className="text-green-600" />
                            <span className="text-xs font-medium">Payment</span>
                          </div>
                          <span className="text-base font-bold text-green-600">
                            {job.job_type === 'hourly' && job.hourly_min && job.hourly_max
                              ? `₹${job.hourly_min}-${job.hourly_max}/hr`
                              : job.job_type === 'fixed' && job.fixed_amount
                              ? `₹${job.fixed_amount}`
                              : 'Not specified'}
                          </span>
                        </div>

                        {/* Location */}
                        {job.location && (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 text-gray-600 mb-1">
                              <MapPin size={16} />
                              <span className="text-xs font-medium">Location</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {job.location}
                            </span>
                          </div>
                        )}

                        {/* Posted Date */}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-gray-600 mb-1">
                            <Calendar size={16} />
                            <span className="text-xs font-medium">Posted</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {new Date(job.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Posted by: <span className="font-semibold text-gray-700">{job.client_name || 'Client'}</span>
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}