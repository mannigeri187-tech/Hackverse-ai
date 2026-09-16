import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Bookmark } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { TrackedHackathon } from '../types/tracker';
import { calculateDeadline, type DeadlineInfo } from '../utils/deadline';

export function TrackerSummaryWidget() {
  const { user } = useAuth();
  const [tracked, setTracked] = useState<TrackedHackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTrackerSummary() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('saved_hackathons')
          .select(`
            id,
            user_id,
            hackathon_id,
            status,
            reminder_enabled,
            created_at,
            updated_at,
            hackathons (
              id, title, organizer, start_date, registration_deadline, mode, image_url
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;
        setTracked((data || []) as unknown as TrackedHackathon[]);
      } catch (err) {
        console.error('Error loading tracker summary:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTrackerSummary();
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-pulse">
        <div className="h-6 w-36 bg-slate-200 rounded mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Count by status
  const counts = {
    preparing: tracked.filter(t => (t.status || 'Saved') === 'Preparing').length,
    registered: tracked.filter(t => (t.status || 'Saved') === 'Registered').length,
    building: tracked.filter(t => (t.status || 'Saved') === 'Building').length,
    submitted: tracked.filter(t => (t.status || 'Saved') === 'Submitted').length,
    saved: tracked.filter(t => (t.status || 'Saved') === 'Saved').length,
  };

  // Find closest upcoming deadline
  let closestItem: { hackathon: TrackedHackathon; deadline: DeadlineInfo } | null = null;
  let closestDays = Infinity;

  for (const item of tracked) {
    if (!item.hackathons) continue;
    const deadline = calculateDeadline(item.hackathons);
    if (deadline.daysRemaining !== null && deadline.daysRemaining >= 0 && deadline.daysRemaining < closestDays) {
      closestDays = deadline.daysRemaining;
      closestItem = { hackathon: item, deadline };
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary-600" /> My Hackathons & Tracker
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Your application pipelines and active events.</p>
        </div>
        <Link to="/saved" className="text-primary-600 hover:text-primary-700 font-medium flex items-center text-sm">
          Open Tracker <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="p-6 grid md:grid-cols-3 gap-6 items-center">
        {/* Status Breakdown Pills */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/saved" className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preparing</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{counts.preparing}</div>
          </Link>
          <Link to="/saved" className="p-3.5 bg-blue-50/60 hover:bg-blue-50 rounded-xl border border-blue-100 transition-colors">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Registered</div>
            <div className="text-2xl font-bold text-blue-950 mt-1">{counts.registered}</div>
          </Link>
          <Link to="/saved" className="p-3.5 bg-amber-50/60 hover:bg-amber-50 rounded-xl border border-amber-100 transition-colors">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Building</div>
            <div className="text-2xl font-bold text-amber-950 mt-1">{counts.building}</div>
          </Link>
          <Link to="/saved" className="p-3.5 bg-emerald-50/60 hover:bg-emerald-50 rounded-xl border border-emerald-100 transition-colors">
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Submitted</div>
            <div className="text-2xl font-bold text-emerald-950 mt-1">{counts.submitted}</div>
          </Link>
        </div>

        {/* Closest Deadline Card */}
        <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-primary-600" /> Closest Deadline
          </div>

          {closestItem ? (
            <div>
              <Link 
                to={`/hackathons/${closestItem.hackathon.hackathons.id}`}
                className="font-bold text-slate-900 text-sm hover:text-primary-600 line-clamp-1 mb-1 block"
              >
                {closestItem.hackathon.hackathons.title}
              </Link>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  closestItem.deadline.status === 'urgent' ? 'bg-red-100 text-red-700' :
                  closestItem.deadline.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {closestItem.deadline.text}
                </span>
                <span className="text-xs text-slate-400 capitalize font-medium">
                  ({closestItem.hackathon.status})
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No active hackathon deadlines right now.</p>
          )}
        </div>
      </div>
    </div>
  );
}
