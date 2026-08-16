import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      setIsLoading(true);
      
      const { data } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('user_id', user.id)
        .single();
        
      if (data) {
        setProfile({
          name: data.name || user.email?.split('@')[0] || 'User',
          email: data.email || user.email || ''
        });
      } else {
        // Fallback if profile row doesn't exist yet
        setProfile({
          name: user.email?.split('@')[0] || 'User',
          email: user.email || ''
        });
      }
      setIsLoading(false);
    }
    
    loadProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  if (!user) return null; // ProtectedRoute will catch this anyway

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        {isLoading || !profile ? (
          <div className="animate-pulse flex items-center space-x-4">
            <div className="w-20 h-20 bg-slate-200 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-slate-200 w-1/3 rounded"></div>
              <div className="h-4 bg-slate-200 w-1/2 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-3xl font-bold shadow-sm">
              {getInitials(profile.name)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">{profile.name}</h2>
              <p className="text-slate-500 font-medium">{profile.email}</p>
            </div>
          </div>
        )}
        
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Account Settings</h3>
          <div className="flex space-x-4">
            <button 
              onClick={handleSignOut}
              className="flex items-center px-5 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
