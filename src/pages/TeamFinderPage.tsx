import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Calendar, 
  Inbox, 
  CheckCircle2, 
  Layers, 
  UserPlus, MessageCircle, UserSearch
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { TeamProfile, TeamRequest, TeammateFilterState } from '../types/teamFinder';
import { AVAILABLE_SKILLS, AVAILABLE_ROLES } from '../types/teamFinder';
import { useChat } from '../hooks/useChat';
import ChatWindow from '../components/chat/ChatWindow';
import type { HackathonSkill } from '../types/skillGap';
import { TeamProfileForm } from '../components/TeamProfileForm';
import { TeammateCard } from '../components/TeammateCard';
import { TeamRequestsList } from '../components/TeamRequestsList';
import { calculateProfileCompletion } from '../utils/teamMatching';
import { calculateTeamMatch } from '../utils/teamMatchingEngine';

export default function TeamFinderPage() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'find' | 'profile' | 'requests' | 'individuals'>('find');
  // Individuals Search State
  const [individualSearch, setIndividualSearch] = useState('');
  const [individualResults, setIndividualResults] = useState<any[]>([]);
  const [isSearchingIndividuals, setIsSearchingIndividuals] = useState(false);

  // Chat Overlay State
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatTitle, setActiveChatTitle] = useState<string>('');
  const { getOrCreateDirectChannel } = useChat();
  const [myProfile, setMyProfile] = useState<TeamProfile | null>(null);
  const [candidates, setCandidates] = useState<TeamProfile[]>([]);
  const [hackathons, setHackathons] = useState<{ id: string; title: string }[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string>('');
  const [hackathonRequirements, setHackathonRequirements] = useState<HackathonSkill[]>([]);
  const [sentRequests, setSentRequests] = useState<Record<string, TeamRequest>>({});
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Default filters: All Skills, All Roles, All Experience Levels, All Availabilities
  const [filters, setFilters] = useState<TeammateFilterState>({
    skill: '',
    role: '',
    experience: '',
    availability: '',
    searchQuery: ''
  });

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

    async function searchIndividuals(query: string) {
    if (!query.trim()) {
      setIndividualResults([]);
      return;
    }
    setIsSearchingIndividuals(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, username, avatar_url, headline, location, bio')
        .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
        .neq('user_id', user?.id)
        .limit(20);

      if (error) throw error;
      setIndividualResults(data || []);
    } catch (err) {
      console.error('Error searching individuals:', err);
    } finally {
      setIsSearchingIndividuals(false);
    }
  }

  const handleStartChat = async (otherUserId: string, otherUserName: string) => {
    const channelId = await getOrCreateDirectChannel(otherUserId);
    if (channelId) {
      setActiveChatId(channelId);
      setActiveChatTitle(otherUserName);
    } else {
      alert('Could not start chat. Please check your connection.');
    }
  };

  async function loadInitialData() {
    setIsLoading(true);
    try {
      // 1. Fetch user's team profile
      const { data: myProf } = await supabase
        .from('team_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (myProf) {
        setMyProfile(myProf as TeamProfile);
      }

      // 2. Fetch list of available upcoming hackathons
      const { data: hacks } = await supabase
        .from('hackathons')
        .select('id, title')
        .order('start_date', { ascending: true })
        .limit(30);

      if (hacks && hacks.length > 0) {
        setHackathons(hacks);
        setSelectedHackathonId(hacks[0].id);
      }

      // 3. Fetch candidates (strictly excluding the authenticated user)
      const { data: candData } = await supabase
        .from('team_profiles')
        .select('*')
        .neq('user_id', user!.id)
        .limit(60);

      setCandidates((candData || []) as TeamProfile[]);

      // 4. Fetch sent/received requests
      const { data: reqData } = await supabase
        .from('team_requests')
        .select('*')
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`);

      if (reqData) {
        const sentMap: Record<string, TeamRequest> = {};
        let pendingCount = 0;

        reqData.forEach((req: any) => {
          if (req.sender_id === user!.id) {
            sentMap[`${req.receiver_id}_${req.hackathon_id}`] = req as TeamRequest;
          }
          if (req.receiver_id === user!.id && req.status === 'pending') {
            pendingCount++;
          }
        });

        setSentRequests(sentMap);
        setPendingRequestsCount(pendingCount);
      }
    } catch (err) {
      console.error('Error loading team finder initial data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Load Hackathon Requirements when selected hackathon changes
  useEffect(() => {
    async function loadHackathonSkills() {
      if (!selectedHackathonId) {
        setHackathonRequirements([]);
        return;
      }
      try {
        const { data } = await supabase
          .from('hackathon_skills')
          .select(`
            id,
            hackathon_id,
            skill_id,
            importance,
            created_at,
            skill:skills (
              id,
              name,
              category
            )
          `)
          .eq('hackathon_id', selectedHackathonId);

        setHackathonRequirements((data || []) as unknown as HackathonSkill[]);
      } catch (err) {
        console.error('Error loading hackathon skills for matching:', err);
        setHackathonRequirements([]);
      }
    }

    loadHackathonSkills();
  }, [selectedHackathonId]);

  const handleSendRequest = async (receiverId: string, hackathonId: string, message: string) => {
    if (!user) return;

    const payload = {
      sender_id: user.id,
      receiver_id: receiverId,
      hackathon_id: hackathonId,
      status: 'pending',
      message: message.trim() || null
    };

    const { data, error } = await supabase
      .from('team_requests')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Failed to send team request:', error);
      alert('Could not send team request. You may have already sent one for this hackathon.');
      throw error;
    }

    if (data) {
      setSentRequests(prev => ({
        ...prev,
        [`${receiverId}_${hackathonId}`]: data as TeamRequest
      }));
    }
  };

  const handleProfileSaved = (saved: TeamProfile) => {
    setMyProfile(saved);
    setActiveTab('find');
    loadInitialData(); // Refresh list
  };

  const resetFilters = () => {
    setFilters({
      skill: '',
      role: '',
      experience: '',
      availability: '',
      searchQuery: ''
    });
  };

  // Filter Candidates
  const eligibleCandidates = candidates.filter(c => c.user_id !== user?.id);

  const filteredCandidates = eligibleCandidates.filter(cand => {
    if (filters.skill && !cand.skills.some(s => s.toLowerCase() === filters.skill.toLowerCase())) {
      return false;
    }
    if (filters.role && !cand.preferred_roles.some(r => r.toLowerCase() === filters.role.toLowerCase())) {
      return false;
    }
    if (filters.experience && cand.experience_level.toLowerCase() !== filters.experience.toLowerCase()) {
      return false;
    }
    if (filters.availability && cand.availability.toLowerCase() !== filters.availability.toLowerCase() && cand.availability !== 'Both') {
      return false;
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = (cand.display_name || '').toLowerCase().includes(q);
      const matchBio = (cand.bio || '').toLowerCase().includes(q);
      const matchSkill = cand.skills.some(s => s.toLowerCase().includes(q));
      const matchRole = cand.preferred_roles.some(r => r.toLowerCase().includes(q));
      if (!matchName && !matchBio && !matchSkill && !matchRole) return false;
    }
    return true;
  });

  // Sort candidates by pure deterministic Hackathon Team Matching Engine score descending
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    const scoreA = calculateTeamMatch(myProfile, a, hackathonRequirements).score;
    const scoreB = calculateTeamMatch(myProfile, b, hackathonRequirements).score;
    return scoreB - scoreA;
  });

  const completionPercent = myProfile ? calculateProfileCompletion(myProfile) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* 1. HERO HEADER */}
      <div className="bg-theme-team text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800/80 relative overflow-hidden glow-blue">
        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md text-cyan-300 border border-cyan-500/30">
            <Users className="w-3.5 h-3.5 text-cyan-400" /> Hackathon Team Matchmaking
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
            Find Compatible Teammates & Build Winning Squads
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed">
            Discover developers with complementary skills, target hackathons, and balanced team roles for upcoming competitions.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setActiveTab('profile')}
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {myProfile ? 'Edit My Team Profile' : 'Complete My Team Profile'}
            </button>
            <button
              onClick={() => setActiveTab('find')}
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl transition-all border border-white/10 backdrop-blur-sm flex items-center gap-2"
            >
              <Users className="w-4 h-4" /> Find Teammates
            </button>
          </div>
        </div>

        {/* Profile Completion Widget in Hero */}
        {myProfile && (
          <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-72 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-300">
              <span>Profile Strength</span>
              <span className="text-primary-300 font-extrabold text-sm">{completionPercent}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-primary-400 h-2 rounded-full transition-all" style={{ width: `${completionPercent}%` }}></div>
            </div>
            <p className="text-[11px] text-slate-300">
              {completionPercent >= 80 
                ? 'Your profile has high visibility in recommendation rankings!' 
                : 'Add more skills and preferences to get matched with higher compatibility.'}
            </p>
          </div>
        )}
      </div>

      {/* Main View Tabs */}
      <div className="flex border-b border-slate-200 gap-2 md:gap-4 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('find')}
          className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'find'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> Recommended Teammates
          <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 font-extrabold">
            {sortedCandidates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'requests'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Inbox className="w-4 h-4" /> Team Invitations
          {pendingRequestsCount > 0 && (
            <span className="text-xs px-2 py-0.5 bg-primary-600 text-white rounded-full font-extrabold animate-pulse">
              {pendingRequestsCount} new
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" /> My Team Profile
        </button>
        <button
          onClick={() => setActiveTab('individuals')}
          className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'individuals'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserSearch className="w-4 h-4" /> Find Individuals
        </button>
      </div>

      {/* TAB CONTENT: INDIVIDUALS */}
      {activeTab === 'individuals' && (
        <div className="space-y-6">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or username..."
                value={individualSearch}
                onChange={(e) => setIndividualSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchIndividuals(individualSearch)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 font-medium"
              />
            </div>
            <button
              onClick={() => searchIndividuals(individualSearch)}
              disabled={isSearchingIndividuals}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl disabled:bg-slate-300 transition-colors"
            >
              {isSearchingIndividuals ? 'Searching...' : 'Search'}
            </button>
          </div>

          {individualResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {individualResults.map((u) => (
                <div key={u.user_id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-primary-700">{u.name?.substring(0, 2).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{u.name || 'Unknown User'}</h4>
                      <p className="text-sm text-slate-500 truncate">@{u.username || 'user'}</p>
                      {u.headline && <p className="text-sm font-medium text-slate-700 mt-1 line-clamp-2">{u.headline}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartChat(u.user_id, u.name || u.username || 'User')}
                    className="w-full mt-auto flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                </div>
              ))}
            </div>
          ) : individualSearch && !isSearchingIndividuals ? (
            <div className="text-center py-12 text-slate-500">
              No users found matching "{individualSearch}"
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <UserSearch className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Find HackVerse Friends</h3>
              <p className="max-w-md mx-auto">Search for other hackers by their name or username to connect and chat with them directly.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PROFILE BUILDER */}
      {activeTab === 'profile' && (
        <TeamProfileForm
          initialProfile={myProfile}
          onSave={handleProfileSaved}
        />
      )}

      {/* TAB CONTENT: REQUESTS INBOX */}
      {activeTab === 'requests' && (
        <TeamRequestsList onStartChat={handleStartChat} />
      )}

      {/* TAB CONTENT: FIND TEAMMATES */}
      {activeTab === 'find' && (
        <div className="space-y-6">
          {/* Hackathon Selector Banner */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl flex-shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <label htmlFor="hackathon-picker" className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Choose Target Hackathon
                </label>
                <p className="text-xs text-slate-500">Teammate recommendations & skill gap filling adapt directly to this event.</p>
              </div>
            </div>

            <div className="w-full md:max-w-md">
              <select
                id="hackathon-picker"
                value={selectedHackathonId}
                onChange={(e) => setSelectedHackathonId(e.target.value)}
                className="w-full text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {hackathons.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Bar (Stacked cleanly on mobile, grid on desktop) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search Bar */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name or skill..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Skill Filter (Defaults to All Skills) */}
              <select
                value={filters.skill}
                onChange={(e) => setFilters(prev => ({ ...prev, skill: e.target.value }))}
                className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Skills</option>
                {AVAILABLE_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Role Filter (Defaults to All Roles) */}
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Preferred Roles</option>
                {AVAILABLE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              {/* Experience Filter (Defaults to All Experience Levels) */}
              <select
                value={filters.experience}
                onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Experience Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              {/* Availability Filter (Defaults to All Availabilities) */}
              <select
                value={filters.availability}
                onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Availabilities</option>
                <option value="Weekdays">Weekdays</option>
                <option value="Weekends">Weekends</option>
                <option value="Both">Both (Full Availability)</option>
              </select>
            </div>
          </div>

          {/* Results Display */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 h-64 shadow-sm"></div>
              ))}
            </div>
          ) : eligibleCandidates.length === 0 ? (
            /* Case 1: Genuine 0 profiles in database */
            <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 text-center py-16">
              <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No teammates available yet.</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                Complete your Team Finder profile and invite your friends to start building teams.
              </p>
              <button
                onClick={() => setActiveTab('profile')}
                className="inline-flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {myProfile ? 'Review My Profile' : 'Complete My Team Profile'}
              </button>
            </div>
          ) : sortedCandidates.length === 0 ? (
            /* Case 2: Profiles exist but current filters hid them */
            <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 text-center py-16">
              <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No teammates match your current filters.</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                Try clearing or adjusting your search filters to discover more hackers!
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Case 3: Display matching candidate cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCandidates.map(candidate => {
                const reqKey = `${candidate.user_id}_${selectedHackathonId}`;
                const existingReq = sentRequests[reqKey];

                return (
                  <TeammateCard
                    key={candidate.user_id}
                    myProfile={myProfile}
                    candidate={candidate}
                    selectedHackathonId={selectedHackathonId}
                    hackathonRequirements={hackathonRequirements}
                    existingRequest={existingReq}
                    onSendRequest={handleSendRequest}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Global Chat Overlay */}
      {activeChatId && (
        <div className="fixed bottom-4 right-4 w-full max-w-sm h-[500px] z-50">
          <ChatWindow
            channelId={activeChatId}
            title={activeChatTitle}
            onClose={() => setActiveChatId(null)}
          />
        </div>
      )}
    </div>
  );
}
