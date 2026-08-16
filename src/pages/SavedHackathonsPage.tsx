import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Trash2, 
  Clock, 
  Bell, 
  BellOff, 
  CheckCircle2, 
  Circle, 
  FileEdit, 
  ExternalLink,
  SlidersHorizontal,
  FolderPlus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { TrackedHackathon, TrackerStatus } from '../types/tracker';
import { TRACKER_STATUSES } from '../types/tracker';
import { calculateDeadline } from '../utils/deadline';

type SortOption = 'deadline' | 'recent_added' | 'recent_updated';

export default function SavedHackathonsPage() {
  const { user } = useAuth();
  const [trackedEvents, setTrackedEvents] = useState<TrackedHackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('deadline');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  useEffect(() => {
    fetchTracked();
  }, [user]);

  async function fetchTracked() {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('saved_hackathons')
        .select(`
          id,
          user_id,
          hackathon_id,
          status,
          notes,
          reminder_enabled,
          created_at,
          updated_at,
          hackathons (
            id, title, organizer, start_date, end_date, registration_deadline, location, mode, image_url, status, registration_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrackedEvents((data || []) as unknown as TrackedHackathon[]);
    } catch (err) {
      console.error('Error fetching tracker items:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const updateStatus = async (id: string, newStatus: TrackerStatus) => {
    // Optimistic UI update
    setTrackedEvents(prev => prev.map(item => item.id === id ? { ...item, status: newStatus, updated_at: new Date().toISOString() } : item));

    try {
      const { error } = await supabase
        .from('saved_hackathons')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) {
        console.error('Failed to update status:', error);
        fetchTracked(); // Revert on failure
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const toggleReminder = async (id: string, current: boolean) => {
    const nextState = !current;
    setTrackedEvents(prev => prev.map(item => item.id === id ? { ...item, reminder_enabled: nextState } : item));

    try {
      const { error } = await supabase
        .from('saved_hackathons')
        .update({ reminder_enabled: nextState })
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) {
        console.error('Failed to update reminder:', error);
        fetchTracked();
      }
    } catch (err) {
      console.error('Error updating reminder:', err);
    }
  };

  const saveNotes = async (id: string) => {
    setSavingNoteId(id);
    try {
      const { error } = await supabase
        .from('saved_hackathons')
        .update({ notes: tempNotes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
      setTrackedEvents(prev => prev.map(item => item.id === id ? { ...item, notes: tempNotes } : item));
      setEditingNotesId(null);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNoteId(null);
    }
  };

  const removeItem = async (id: string) => {
    setTrackedEvents(prev => prev.filter(s => s.id !== id));
    try {
      await supabase.from('saved_hackathons').delete().eq('id', id).eq('user_id', user!.id);
    } catch (err) {
      console.error('Error removing tracked hackathon:', err);
    }
  };

  // Filter items
  const filteredEvents = trackedEvents.filter(item => {
    if (selectedFilter === 'All') return true;
    return (item.status || 'Saved').toLowerCase() === selectedFilter.toLowerCase();
  });

  // Sort items
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'deadline') {
      const deadlineA = calculateDeadline(a.hackathons || {}).daysRemaining;
      const deadlineB = calculateDeadline(b.hackathons || {}).daysRemaining;
      
      // Items with deadlines passed or unavailable go to bottom
      if (deadlineA === null && deadlineB === null) return 0;
      if (deadlineA === null) return 1;
      if (deadlineB === null) return -1;
      if (deadlineA < 0 && deadlineB >= 0) return 1;
      if (deadlineB < 0 && deadlineA >= 0) return -1;
      return deadlineA - deadlineB;
    }
    if (sortBy === 'recent_updated') {
      return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
    }
    // recent_added
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const getStatusIndex = (status: TrackerStatus) => {
    const idx = TRACKER_STATUSES.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">My Hackathons & Tracker</h1>
          <p className="text-slate-600">Track application stages, deadlines, and project progress for each hackathon.</p>
        </div>

        <Link 
          to="/hackathons"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm self-start md:self-auto"
        >
          <FolderPlus className="w-4 h-4 mr-2" /> Find More Hackathons
        </Link>
      </div>

      {/* Filter and Sort Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {['All', ...TRACKER_STATUSES].map(tab => {
            const count = tab === 'All' 
              ? trackedEvents.length 
              : trackedEvents.filter(t => (t.status || 'Saved') === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedFilter === tab
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-xs px-1.5 py-0.2 rounded-full font-bold ${
                  selectedFilter === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <label htmlFor="sortSelect" className="text-sm text-slate-500 font-medium">Sort:</label>
          <select
            id="sortSelect"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="deadline">Closest Deadline</option>
            <option value="recent_added">Recently Added</option>
            <option value="recent_updated">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Tracker Cards List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 h-44 shadow-sm"></div>
          ))}
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm text-center py-16">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {selectedFilter === 'All' ? "No hackathons tracked yet" : `No hackathons in "${selectedFilter}" status`}
          </h3>
          <p className="text-slate-500 mb-6 text-sm">
            {selectedFilter === 'All' 
              ? "Discover hackathons and click 'Save' to start tracking your progress."
              : "Change status filters or bookmark new events from the discover catalog."}
          </p>
          <Link 
            to="/hackathons" 
            className="inline-flex px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEvents.map((item) => {
            const hackathon = item.hackathons;
            if (!hackathon) return null;

            const currentStatus = item.status || 'Saved';
            const currentIdx = getStatusIndex(currentStatus);
            const deadline = calculateDeadline(hackathon);
            const isEditingNote = editingNotesId === item.id;

            return (
              <div 
                key={item.id} 
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-slate-300 transition-all"
              >
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  {/* Left Column: Info & Details */}
                  <div className="flex items-start gap-4 flex-1">
                    <div 
                      className="w-16 h-16 rounded-lg bg-slate-100 bg-cover bg-center border border-slate-200 flex-shrink-0"
                      style={hackathon.image_url ? { backgroundImage: `url(${hackathon.image_url})` } : {}}
                    ></div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link 
                          to={`/hackathons/${hackathon.id}`}
                          className="font-bold text-lg text-slate-900 hover:text-primary-600 transition-colors line-clamp-1"
                        >
                          {hackathon.title}
                        </Link>
                        
                        {/* Deadline Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                          deadline.status === 'urgent' ? 'bg-red-100 text-red-700' :
                          deadline.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                          deadline.status === 'passed' ? 'bg-slate-100 text-slate-600' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {deadline.text}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 font-medium mb-2">{hackathon.organizer}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(hackathon.start_date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {hackathon.location || hackathon.mode}
                        </span>
                        {hackathon.registration_url && (
                          <a 
                            href={hackathon.registration_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline flex items-center gap-0.5"
                          >
                            Register Link <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions (Reminder & Delete) */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <button
                      onClick={() => toggleReminder(item.id, item.reminder_enabled)}
                      className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                        item.reminder_enabled
                          ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                      title={item.reminder_enabled ? "Reminders Enabled" : "Enable Reminders"}
                    >
                      {item.reminder_enabled ? <Bell className="w-4 h-4 text-amber-600 fill-amber-600" /> : <BellOff className="w-4 h-4" />}
                      <span className="hidden sm:inline">{item.reminder_enabled ? 'Reminder On' : 'Remind Me'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (isEditingNote) {
                          setEditingNotesId(null);
                        } else {
                          setEditingNotesId(item.id);
                          setTempNotes(item.notes || '');
                        }
                      }}
                      className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                        item.notes 
                          ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                      title="Add or view personal notes"
                    >
                      <FileEdit className="w-4 h-4" />
                      <span className="hidden sm:inline">Notes</span>
                    </button>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
                      title="Remove from Tracker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status Stepper Progress Bar */}
                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center">
                    <span>Application Stage</span>
                    <span className="text-primary-700 font-semibold lowercase bg-primary-50 px-2 py-0.5 rounded capitalize">
                      {currentStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
                    {TRACKER_STATUSES.map((status, idx) => {
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <button
                          key={status}
                          onClick={() => updateStatus(item.id, status)}
                          className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all text-left ${
                            isCurrent
                              ? 'bg-primary-600 text-white border-primary-600 shadow-sm ring-2 ring-primary-300 ring-offset-1'
                              : isCompleted
                              ? 'bg-white text-slate-800 border-slate-200 hover:border-primary-300'
                              : 'bg-slate-100/70 text-slate-400 border-slate-200/50 hover:bg-white hover:text-slate-700'
                          }`}
                        >
                          <span className="truncate mr-1">{status}</span>
                          {isCompleted ? (
                            <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${isCurrent ? 'text-white' : 'text-primary-600'}`} />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Notes Section */}
                {isEditingNote && (
                  <div className="p-5 bg-white border-t border-slate-200">
                    <label htmlFor={`notes-${item.id}`} className="block text-xs font-bold text-slate-700 mb-1.5">
                      Personal Notes & Project Plan:
                    </label>
                    <textarea
                      id={`notes-${item.id}`}
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Add team member names, repo links, pitch ideas, or submission checklists..."
                      className="w-full text-sm p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none min-h-[80px]"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => setEditingNotesId(null)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveNotes(item.id)}
                        disabled={savingNoteId === item.id}
                        className="px-4 py-1.5 text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors disabled:opacity-50"
                      >
                        {savingNoteId === item.id ? 'Saving...' : 'Save Notes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
