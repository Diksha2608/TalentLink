// frontend/src/pages/Talent.jsx
import { useState, useEffect } from 'react';
import { Search, MapPin, Star, DollarSign } from 'lucide-react';
import FreelancerCard from '../components/FreelancerCard';
import { freelancersAPI } from '../api/freelancers';

export default function Talent() {
  const [freelancers, setFreelancers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [locationFilter, setLocationFilter] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');

  useEffect(() => {
    loadFreelancers();
  }, []);

  // Debounce filter changes (only after initial load)
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  
  useEffect(() => {
    if (filtersInitialized) {
      const timeoutId = setTimeout(() => {
        loadFreelancers();
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setFiltersInitialized(true);
    }
  }, [locationFilter, minRating, minRate, maxRate]);

  const loadFreelancers = () => {
    setLoading(true);
    const params = {};
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    if (locationFilter) {
      params.location = locationFilter;
    }
    
    if (minRating) {
      params.min_rating = minRating;
    }
    
    if (minRate) {
      params.min_rate = minRate;
    }
    
    if (maxRate) {
      params.max_rate = maxRate;
    }

    freelancersAPI
      .list(params)
      .then((res) => {
        const data = res.data.results || res.data;
        setFreelancers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to load freelancers:', err);
        setFreelancers([]);
      })
      .finally(() => setLoading(false));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadFreelancers();
  };


  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setMinRating('');
    setMinRate('');
    setMaxRate('');
    setTimeout(() => {
      loadFreelancers();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Talent</h1>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search freelancers by name or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex gap-8">
          {/* Filter Section - Left Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Star size={16} className="inline mr-1 text-yellow-400 fill-yellow-400" />
                  Minimum Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>

              {/* Hourly Rate Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign size={16} className="inline mr-1" />
                  Work Rate Per Hour
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min rate"
                    value={minRate}
                    onChange={(e) => setMinRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="Max rate"
                    value={maxRate}
                    onChange={(e) => setMaxRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Freelancers Grid - Right Side */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">Loading freelancers...</div>
            ) : freelancers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {freelancers.map((freelancer) => (
                  <FreelancerCard key={freelancer.user?.id || freelancer.id} freelancer={freelancer} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                No freelancers found. Try adjusting your search or filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

