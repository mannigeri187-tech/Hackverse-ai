import { useState, useEffect } from 'react';
import { Check, X, Clock, Send, Inbox, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { TeamRequest } from '../types/teamFinder';

export function TeamRequestsList({ onStartChat }: { onStartChat?: (userId: string, userName: string) => void }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  async function fetchRequests() {
    if (!user) return;
    setIsLoading(true);
    try {
      // Query team_requests where user is sender or receiver
      const { data, error } = await supabase
        .from('team_requests')
        .select(`
          id,
          sender_id,
          receiver_id,
          hackathon_id,
          status,
          message,
          created_at,
          updated_at,
          hackathons ( id, title )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Extract unique user IDs from requests to fetch their team_profiles in one query (avoiding N+1)
      const userIds = new Set<string>();
      (data || []).forEach((r: any) => {
        userIds.add(r.sender_id);
        userIds.add(r.receiver_id);
      });

      let profilesMap: Record<string, any> = {};
      if (userIds.size > 0) {
        const { data: profilesData } = await supabase
          .from('team_profiles')
          .select('user_id, display_name, skills, experience_level, preferred_roles')
          .in('user_id', Array.from(userIds));

        (profilesData || []).forEach(p => {
          profilesMap[p.user_id] = p;
        });
      }

      const formatted: TeamRequest[] = (data || []).map((r: any) => ({
        id: r.id,
        sender_id: r.sender_id,
        receiver_id: r.receiver_id,
        hackathon_id: r.hackathon_id,
        status: r.status,
        message: r.message,
        created_at: r.created_at,
        updated_at: r.updated_at,
        hackathon_title: r.hackathons?.title || 'Hackathon',
        sender_profile: profilesMap[r.sender_id] || { display_name: 'Hacker' },
        receiver_profile: profilesMap[r.receiver_id] || { display_name: 'Hacker' }
      }));

      setRequests(formatted);
    } catch (err) {
      console.error('Error fetching team requests:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const updateRequestStatus = async (requestId: string, newStatus: 'accepted' | 'rejected') => {
    setActionLoadingId(requestId);
    try {
      const { error } = await supabase
        .from('team_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('receiver_id', user!.id);

      if (error) throw error;

      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error('Error updating request status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const receivedRequests = requests.filter(r => r.receiver_id === user?.id);
  const sentRequests = requests.filter(r => r.sender_id === user?.id);

  const displayedList = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'received'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Inbox className="w-4 h-4" /> Received Invitations
          <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
            activeTab === 'received' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {receivedRequests.filter(r => r.status === 'pending').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'sent'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Send className="w-4 h-4" /> Sent Invitations
          <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
            activeTab === 'sent' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {sentRequests.length}
          </span>
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl shadow-sm"></div>
          ))}
        </div>
      ) : displayedList.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center py-16">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {activeTab === 'received' ? 'No invitations received yet' : 'No invitations sent yet'}
          </h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            {activeTab === 'received'
              ? 'Complete your profile to increase your visibility among other hackers looking for teammates.'
              : 'Explore the recommended hackers tab and send invitations for your target hackathons!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedList.map(req => {
            const isReceived = activeTab === 'received';
            const partnerProfile = isReceived ? req.sender_profile : req.receiver_profile;

            return (
              <div 
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">
                      {partnerProfile?.display_name || 'Hacker'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {isReceived ? 'invited you to join' : 'invited to join'}
                    </span>
                    <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md">
                      {req.hackathon_title}
                    </span>
                  </div>

                  {req.message && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                      "{req.message}"
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(req.created_at).toLocaleDateString()}
                    </span>
                    {partnerProfile?.experience_level && (
                      <span>• {partnerProfile.experience_level}</span>
                    )}
                    {partnerProfile?.preferred_roles && partnerProfile.preferred_roles.length > 0 && (
                      <span>• {partnerProfile.preferred_roles.join(', ')}</span>
                    )}
                  </div>
                </div>

                {/* Status / Action buttons */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {isReceived && req.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => updateRequestStatus(req.id, 'rejected')}
                        disabled={actionLoadingId === req.id}
                        className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                      <button
                        onClick={() => updateRequestStatus(req.id, 'accepted')}
                        disabled={actionLoadingId === req.id}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept Team Request
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                        req.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'rejected'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {req.status === 'accepted' && <Check className="w-3.5 h-3.5" />}
                        {req.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                        {req.status === 'rejected' && <X className="w-3.5 h-3.5" />}
                        <span className="capitalize">{req.status === 'accepted' ? 'Team Request Accepted' : req.status === 'rejected' ? 'Declined' : 'Pending Response'}</span>
                      </span>
                      {req.status === 'accepted' && onStartChat && (
                        <button
                          onClick={() => onStartChat(isReceived ? req.sender_id : req.receiver_id, partnerProfile?.display_name || 'User')}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Message
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
