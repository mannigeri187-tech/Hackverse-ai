import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Globe, Building2 } from 'lucide-react';
import { useHackathons } from '../hooks/useHackathons';

export default function HackathonsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const [locationInput, setLocationInput] = useState('');
  const [debouncedLocation, setDebouncedLocation] = useState('');

  const [regionFilter, setRegionFilter] = useState<'all' | 'karnataka' | 'bengaluru' | 'india' | 'online' | 'international'>('all');
  const [mode, setMode] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 9;

  // 250ms Debounce for text typing to avoid spamming network
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchInput);
      setPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedLocation(locationInput);
      setPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [locationInput]);

  const { hackathons, totalCount, isLoading, isError, responseTime, dataSource } = useHackathons({
    query: debouncedQuery,
    location: debouncedLocation,
    regionFilter,
    mode,
    status,
    page,
    limit
  });

  const totalPages = Math.ceil(totalCount / limit);

  // Region Filter Pills
  const regionOptions: Array<{ id: typeof regionFilter; label: string; icon: any }> = [
    { id: 'all', label: 'All Locations', icon: Globe },
    { id: 'karnataka', label: 'Karnataka', icon: Building2 },
    { id: 'bengaluru', label: 'Bengaluru', icon: MapPin },
    { id: 'india', label: 'India', icon: MapPin },
    { id: 'online', label: 'Online', icon: Globe },
    { id: 'international', label: 'International', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Discover Hackathons</h1>
          <p className="text-slate-600">Find hackathons in Karnataka, India, and worldwide.</p>
        </div>
      </div>

      {/* 1. Quick Location Filter Chips (First-Class Karnataka & India) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Region:</span>
        {regionOptions.map((opt) => {
          const Icon = opt.icon;
          const isActive = regionFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => {
                setRegionFilter(opt.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                isActive
                  ? 'bg-primary-600 text-white border-primary-600 ring-2 ring-primary-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Filters & Search Box */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Query input */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search title or organizer..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs sm:text-sm font-medium" 
            />
          </div>
          
          {/* Specific Location Input */}
          <div className="relative">
            <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="City, State or Country..." 
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs sm:text-sm font-medium" 
            />
          </div>

          {/* Mode */}
          <select 
            value={mode} 
            onChange={(e) => { setMode(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-xs sm:text-sm font-medium"
          >
            <option value="all">All Modes</option>
            <option value="online">Online</option>
            <option value="offline">Offline (In-Person)</option>
            <option value="hybrid">Hybrid</option>
          </select>

          {/* Status */}
          <select 
            value={status} 
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-xs sm:text-sm font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* 3. Search Metadata & Performance Bar */}
      <div className="flex justify-between items-center text-xs text-slate-500">
        <div>
          {totalCount > 0 && !isLoading && (
            <span>Showing {(page - 1) * limit + 1}-{Math.min(page * limit, totalCount)} of {totalCount} results</span>
          )}
        </div>
        <div className="flex gap-3 items-center">
          {responseTime !== null && (
            <span className="font-mono text-[11px] font-semibold text-slate-600">
              Query: {responseTime.toFixed(1)}ms
            </span>
          )}
          {dataSource && (
            <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
              dataSource === 'redis' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {dataSource}
            </span>
          )}
        </div>
      </div>

      {/* 4. Results Grid or Clean Empty States */}
      {isError ? (
        <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
          <p className="text-red-600 font-medium">Failed to load hackathons. Please try again.</p>
        </div>
      ) : isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-slate-100 rounded-xl border border-slate-200 h-64 shadow-sm"></div>
          ))}
        </div>
      ) : hackathons.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 p-8 space-y-3">
          <Search className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            {regionFilter === 'karnataka' 
              ? 'No Karnataka hackathons available right now.' 
              : regionFilter === 'bengaluru'
              ? 'No Bengaluru hackathons available right now.'
              : regionFilter === 'india'
              ? 'No India hackathons available right now.'
              : 'No hackathons found matching your criteria.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try switching region filters or clearing search keywords to explore all hackathon listings.
          </p>
          <button 
            onClick={() => { 
              setSearchInput(''); 
              setLocationInput(''); 
              setRegionFilter('all'); 
              setMode('all'); 
              setStatus('all'); 
              setPage(1); 
            }}
            className="mt-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl transition-all shadow-sm"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((hackathon) => (
              <div key={hackathon.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div 
                  className="h-32 bg-slate-200 bg-cover bg-center" 
                  style={hackathon.image_url ? { backgroundImage: `url(${hackathon.image_url})` } : {}}
                ></div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-slate-900 line-clamp-2 leading-snug">{hackathon.title}</h3>
                    <p className="text-xs text-slate-600 font-medium">{hackathon.organizer}</p>
                    
                    <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(hackathon.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="line-clamp-1">{hackathon.location || hackathon.mode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <span className="bg-primary-50 text-primary-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary-200">
                      {hackathon.mode}
                    </span>
                    <Link to={`/hackathons/${hackathon.id}`} className="text-primary-600 hover:text-primary-800 font-bold text-xs">
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-6">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-slate-300 rounded-xl disabled:opacity-50 hover:bg-slate-50 font-bold text-xs transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-slate-600">Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-slate-300 rounded-xl disabled:opacity-50 hover:bg-slate-50 font-bold text-xs transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
