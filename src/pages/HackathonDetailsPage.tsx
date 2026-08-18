import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  Rocket, 
  Loader2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { parseHackathonDate, getHackathonNormalizedStatus } from '../utils/hackathonDate';

interface HackathonDetail {
  id: string;
  title: string;
  organizer: string;
  start_date: string;
  end_date?: string;
  registration_deadline?: string;
  location: string;
  mode: string;
  description: string;
  image_url?: string;
  registration_url?: string;
  registration_url_status?: string;
  status: string;
}

export default function HackathonDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workspaces, createWorkspace } = useWorkspaces();

  const [hackathon, setHackathon] = useState<HackathonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);

  // Check if a workspace already exists for this hackathon
  const existingWorkspace = workspaces.find((w) => w.hackathon_id === id);
  const existingWorkspaceId = existingWorkspace?.id;

  useEffect(() => {
    async function fetchHackathon() {
      if (!id) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('hackathons')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setHackathon(data);
      } catch (err) {
        console.error('Error loading hackathon details:', err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }

    async function checkSavedStatus() {
      if (!id || !user) return;
      try {
        const { data } = await supabase
          .from('saved_hackathons')
          .select('id')
          .eq('user_id', user.id)
          .eq('hackathon_id', id)
          .maybeSingle();

        setIsSaved(!!data);
      } catch (err) {
        console.error('Error checking saved status:', err);
      }
    }

    fetchHackathon();
    checkSavedStatus();
  }, [id, user]);

  const toggleSave = async () => {
    if (!user || !id || isSaving) return;
    setIsSaving(true);

    try {
      if (isSaved) {
        await supabase
          .from('saved_hackathons')
          .delete()
          .eq('user_id', user.id)
          .eq('hackathon_id', id);
        setIsSaved(false);
      } else {
        await supabase
          .from('saved_hackathons')
          .insert({
            user_id: user.id,
            hackathon_id: id,
            status: 'interested',
          });
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Toggle save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleParticipate = async () => {
    if (!user || !hackathon || isParticipating) return;

    if (existingWorkspaceId) {
      navigate(`/workspace/${existingWorkspaceId}`);
      return;
    }

    setIsParticipating(true);

    try {
      const workspace = await createWorkspace({
        hackathon_id: hackathon.id,
        project_name: `${hackathon.title} Project`,
      });

      if (workspace) {
        navigate(`/workspace/${workspace.id}`);
      } else {
        alert('Could not initialize workspace. Please try again.');
      }
    } catch (err) {
      console.error('Participate error:', err);
      alert('Error creating workspace.');
    } finally {
      setIsParticipating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-64 bg-slate-200 rounded-2xl w-full"></div>
        <div className="h-10 bg-slate-200 w-1/2 rounded"></div>
        <div className="h-4 bg-slate-200 w-1/4 rounded"></div>
        <div className="h-32 bg-slate-200 w-full rounded"></div>
      </div>
    );
  }

  if (isError || !hackathon) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Hackathon not found</h2>
        <p className="text-slate-600 mb-6">The event you are looking for might have been removed or is temporarily unavailable.</p>
        <Link to="/hackathons" className="text-primary-600 font-medium hover:underline">← Back to Discover</Link>
      </div>
    );
  }

  const regStatus = hackathon.registration_url_status || 'VALID';
  const normStatus = getHackathonNormalizedStatus(hackathon);
  const isRegistrationClosed = normStatus === 'CLOSED' || normStatus === 'ENDED';
  const isBrokenOrUnreachable = regStatus === 'BROKEN' || regStatus === 'UNREACHABLE' || (!hackathon.registration_url && regStatus !== 'UNKNOWN');
  const isUnknown = regStatus === 'UNKNOWN' && !hackathon.registration_url;

  const startDate = parseHackathonDate(hackathon.start_date);
  const endDate = parseHackathonDate(hackathon.end_date);
  const deadlineDate = parseHackathonDate(hackathon.registration_deadline);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div 
        className="h-64 bg-slate-200 rounded-2xl w-full bg-cover bg-center border border-slate-200 shadow-sm"
        style={hackathon.image_url ? { backgroundImage: `url(${hackathon.image_url})` } : {}}
      ></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
              isRegistrationClosed ? 'bg-slate-100 text-slate-700' :
              normStatus === 'UPCOMING' || normStatus === 'OPEN' ? 'bg-green-100 text-green-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {isRegistrationClosed ? (normStatus === 'ENDED' ? 'Event Ended' : 'Registration Closed') : normStatus}
            </span>
            <span className="bg-primary-50 text-primary-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
              {hackathon.mode}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 leading-tight">{hackathon.title}</h1>
          <p className="text-lg font-medium text-slate-600 mb-4">{hackathon.organizer}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-600 font-medium text-sm">
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-slate-400" /> {startDate ? startDate.toLocaleDateString() : 'TBA'}{endDate ? ` - ${endDate.toLocaleDateString()}` : ''}</span>
            <span className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-slate-400" /> {hackathon.location || 'Online'}</span>
            {deadlineDate && (
              <span className="flex items-center"><Clock className="w-4 h-4 mr-2 text-amber-500" /> Deadline: {deadlineDate.toLocaleDateString()}</span>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {user && (
            <>
              {/* I'm Participating / Open Workspace Button */}
              <button
                onClick={handleParticipate}
                disabled={isParticipating}
                className="flex-1 md:flex-none px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
              >
                {isParticipating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Preparing Workspace...
                  </>
                ) : existingWorkspaceId ? (
                  <>
                    <Rocket className="w-4 h-4" /> Open Workspace
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" /> I'm Participating
                  </>
                )}
              </button>

              <button 
                onClick={toggleSave}
                disabled={isSaving}
                className={`p-3 border rounded-xl transition-colors flex justify-center items-center ${
                  isSaved 
                    ? 'bg-primary-50 border-primary-200 text-primary-600 hover:bg-primary-100' 
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                } disabled:opacity-50`}
                title={isSaved ? 'Remove from Saved' : 'Save Hackathon'}
              >
                {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
            </>
          )}
          
          {/* Real Verified Registration Link Actions */}
          {isRegistrationClosed ? (
            <button 
              disabled 
              className="flex-1 md:flex-none px-6 py-3 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl font-bold cursor-not-allowed text-sm flex items-center justify-center"
            >
              Registration Closed
            </button>
          ) : isBrokenOrUnreachable ? (
            <button 
              disabled 
              className="flex-1 md:flex-none px-5 py-3 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl font-bold cursor-not-allowed text-xs flex items-center justify-center"
            >
              Registration Link Unavailable
            </button>
          ) : isUnknown ? (
            <button 
              disabled 
              className="flex-1 md:flex-none px-5 py-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-bold cursor-not-allowed text-xs flex items-center justify-center"
            >
              Registration Link Being Verified
            </button>
          ) : hackathon.registration_url ? (
            <a 
              href={hackathon.registration_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 md:flex-none px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center shadow-sm hover:shadow-md text-sm"
            >
              Register <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          ) : (
            <button 
              disabled 
              className="flex-1 md:flex-none px-5 py-3 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl font-bold cursor-not-allowed text-xs flex items-center justify-center"
            >
              Registration Link Unavailable
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">About this hackathon</h2>
        <div className="prose max-w-none text-slate-600 leading-relaxed">
          {hackathon.description ? (
            <p className="whitespace-pre-wrap">{hackathon.description}</p>
          ) : (
            <p className="italic text-slate-400">No detailed description provided by the organizer.</p>
          )}
        </div>
      </div>
    </div>
  );
}
