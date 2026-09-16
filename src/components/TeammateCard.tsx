import { useState } from 'react';
import { 
  User, 
  Send, 
  Check, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  X,
  MessageSquare,
  Award,
  CheckCircle2
} from 'lucide-react';
import type { TeamProfile, TeamRequest } from '../types/teamFinder';
import type { HackathonSkill } from '../types/skillGap';
import { calculateTeamMatch, type TeamMatchResult } from '../utils/teamMatchingEngine';

interface TeammateCardProps {
  myProfile: TeamProfile | null;
  candidate: TeamProfile;
  selectedHackathonId: string | null;
  hackathonRequirements?: HackathonSkill[];
  currentTeamSkills?: string[];
  existingRequest?: TeamRequest;
  onSendRequest: (receiverId: string, hackathonId: string, message: string) => Promise<void>;
}

export function TeammateCard({
  myProfile,
  candidate,
  selectedHackathonId,
  hackathonRequirements = [],
  currentTeamSkills = [],
  existingRequest,
  onSendRequest
}: TeammateCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Pure deterministic hackathon-specific matching calculation
  const matchResult: TeamMatchResult = calculateTeamMatch(
    myProfile,
    candidate,
    hackathonRequirements,
    currentTeamSkills
  );

  const handleSend = async () => {
    if (!selectedHackathonId) return;
    setIsSending(true);
    try {
      await onSendRequest(candidate.user_id, selectedHackathonId, requestMessage);
      setShowRequestDialog(false);
      setRequestMessage('');
    } catch (err) {
      console.error('Error in handleSend:', err);
    } finally {
      setIsSending(false);
    }
  };

  const getBadgeStyle = (score: number) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score >= 75) return 'text-primary-700 bg-primary-50 border-primary-300';
    if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          {/* Header row with Name and Match Score */}
          <div className="flex justify-between items-start gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary-100 text-primary-700 font-bold text-base flex items-center justify-center flex-shrink-0">
                {candidate.display_name?.slice(0, 2).toUpperCase() || <User className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight">
                  {candidate.display_name || 'Hacker'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    {candidate.experience_level}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> {candidate.availability}
                  </span>
                </div>
              </div>
            </div>

            {/* Match Label & Score Badge */}
            <div 
              onClick={() => setShowModal(true)}
              className={`cursor-pointer px-2.5 py-1 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-transform hover:scale-105 ${getBadgeStyle(matchResult.score)}`}
              title="Click to view full match score breakdown"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{matchResult.score}%</span>
            </div>
          </div>

          {/* Match Label Subtitle */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-primary-700">
              {matchResult.matchLabel}
            </span>
            {matchResult.teamGapsFilled.length > 0 && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Fills {matchResult.teamGapsFilled.length} gap{matchResult.teamGapsFilled.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Preferred Roles */}
          {candidate.preferred_roles && candidate.preferred_roles.length > 0 && (
            <div className="mb-2.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Roles</div>
              <div className="flex flex-wrap gap-1">
                {candidate.preferred_roles.map(role => (
                  <span key={role} className="text-xs font-semibold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-md">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="mb-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Top Skills</div>
              <div className="flex flex-wrap gap-1">
                {candidate.skills.slice(0, 4).map(skill => (
                  <span key={skill} className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    {skill}
                  </span>
                ))}
                {candidate.skills.length > 4 && (
                  <span className="text-xs text-slate-400 font-medium px-1">
                    +{candidate.skills.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Bio Preview */}
          {candidate.bio && (
            <p className="text-xs text-slate-500 line-clamp-2 italic mb-4">
              "{candidate.bio}"
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
          <button
            onClick={() => setShowModal(true)}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-0.5 py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            View Match Breakdown <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {existingRequest ? (
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
              existingRequest.status === 'accepted' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : existingRequest.status === 'rejected'
                ? 'bg-slate-100 text-slate-500'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {existingRequest.status === 'accepted' && <Check className="w-3.5 h-3.5" />}
              {existingRequest.status === 'accepted' ? 'Accepted' : existingRequest.status === 'rejected' ? 'Declined' : 'Request Sent'}
            </span>
          ) : (
            <button
              onClick={() => {
                if (!selectedHackathonId) {
                  alert('Please choose a target hackathon at the top first!');
                  return;
                }
                setShowRequestDialog(true);
              }}
              className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" /> Send Request
            </button>
          )}
        </div>
      </div>

      {/* Profile & Compatibility Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 font-bold text-xl flex items-center justify-center">
                  {candidate.display_name?.slice(0, 2).toUpperCase() || <User className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{candidate.display_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {candidate.experience_level}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {candidate.previous_hackathons} previous hackathons
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compatibility Score Box */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-600" />
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Match Score</span>
                    <span className="text-xs font-extrabold text-primary-600">{matchResult.matchLabel}</span>
                  </div>
                </div>
                <span className="text-2xl font-black text-slate-900">{matchResult.score}%</span>
              </div>

              {/* 6-Factor Component Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Skill Complementarity & Gap Filling</span>
                    <span className="font-bold">{matchResult.skillComplementarity} / 40</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${(matchResult.skillComplementarity / 40) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Hackathon Tech Relevance</span>
                    <span className="font-bold">{matchResult.hackathonRelevance} / 20</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${(matchResult.hackathonRelevance / 20) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Experience Balance</span>
                    <span className="font-bold">{matchResult.experienceBalance} / 15</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(matchResult.experienceBalance / 15) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Availability Match</span>
                    <span className="font-bold">{matchResult.availability} / 10</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${(matchResult.availability / 10) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Interests Alignment</span>
                    <span className="font-bold">{matchResult.interestAlignment} / 10</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${(matchResult.interestAlignment / 10) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Role Complementarity</span>
                    <span className="font-bold">{matchResult.roleComplementarity} / 5</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(matchResult.roleComplementarity / 5) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Team Gaps Filled Card */}
              {matchResult.teamGapsFilled.length > 0 && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fills Hackathon Skill Gaps:
                  </span>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {matchResult.teamGapsFilled.map((gap) => (
                      <span key={gap} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-md text-[11px]">
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Transparent Explanations / Reasons */}
              {matchResult.reasons.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Why this match works
                  </span>
                  {matchResult.reasons.map((reason, idx) => (
                    <div key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                      <span className="text-primary-600 font-bold">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills & Bio Full View */}
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">All Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Interests & Tracks</h4>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.interests.map(i => (
                    <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                      {i}
                    </span>
                  ))}
                </div>
              </div>

              {candidate.bio && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">About Me</h4>
                  <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {candidate.bio}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              {!existingRequest && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    if (!selectedHackathonId) {
                      alert('Please choose a target hackathon at the top first!');
                      return;
                    }
                    setShowRequestDialog(true);
                  }}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Send Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Request Dialog */}
      {showRequestDialog && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Send Team Request</h3>
                <p className="text-xs text-slate-500 mt-0.5">Invite {candidate.display_name} to build together.</p>
              </div>
              <button 
                onClick={() => setShowRequestDialog(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label htmlFor={`message-${candidate.user_id}`} className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Short Note (Optional)
              </label>
              <textarea
                id={`message-${candidate.user_id}`}
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Hi! I loved your AI/ML experience and would love to team up for this hackathon."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRequestDialog(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {isSending ? 'Sending...' : 'Send Team Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
