import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type {
  UserSkill,
  HackathonSkill,
  SkillGapResult,
  Skill,
  SkillProficiency,
  AILearningPlanResponse,
  SkillGapItem,
} from '../types/skillGap';
import { calculateSkillGap } from '../utils/skillGapEngine';

export function useSkillGap() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [aiPlanLoading, setAiPlanLoading] = useState<boolean>(false);
  const [aiPlanError, setAiPlanError] = useState<string | null>(null);

  /**
   * 1. Get the authenticated user's skills with catalog metadata
   */
  const getUserSkills = useCallback(async (): Promise<UserSkill[]> => {
    if (!user) {
      return [];
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('user_skills')
        .select(`
          id,
          user_id,
          skill_id,
          proficiency,
          created_at,
          updated_at,
          skill:skills (
            id,
            name,
            category,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;
      return (data || []) as unknown as UserSkill[];
    } catch (err: any) {
      console.error('Error fetching user skills:', err.message);
      setError(err.message || 'Failed to fetch user skills');
      return [];
    }
  }, [user]);

  /**
   * 2. Get a hackathon's required and recommended skills with catalog metadata
   */
  const getHackathonSkills = useCallback(async (hackathonId: string): Promise<HackathonSkill[]> => {
    if (!hackathonId) {
      return [];
    }

    try {
      const { data, error: fetchError } = await supabase
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
            category,
            created_at
          )
        `)
        .eq('hackathon_id', hackathonId);

      if (fetchError) throw fetchError;
      return (data || []) as unknown as HackathonSkill[];
    } catch (err: any) {
      console.error(`Error fetching skills for hackathon ${hackathonId}:`, err.message);
      setError(err.message || 'Failed to fetch hackathon skills');
      return [];
    }
  }, []);

  /**
   * 3. Analyze the skill gap for a specific hackathon against the authenticated user's skills
   */
  const analyzeSkillGap = useCallback(
    async (hackathonId: string): Promise<SkillGapResult | null> => {
      if (!user) {
        setError('User not authenticated');
        return null;
      }

      if (!hackathonId) {
        setError('Hackathon ID is required for skill gap analysis');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const [userSkills, hackathonSkills] = await Promise.all([
          getUserSkills(),
          getHackathonSkills(hackathonId),
        ]);

        const result = calculateSkillGap(hackathonId, userSkills, hackathonSkills);
        return result;
      } catch (err: any) {
        console.error('Error analyzing skill gap:', err.message);
        setError(err.message || 'Failed to perform skill gap analysis');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, getUserSkills, getHackathonSkills]
  );

  /**
   * 4. Generate AI Learning Plan via secure serverless endpoint
   */
  const generateAILearningPlan = async (
    hackathonTitle: string,
    hackathonDescription: string | undefined,
    missingSkills: SkillGapItem[],
    userSkillsList: SkillGapItem[]
  ): Promise<AILearningPlanResponse | null> => {
    if (!user) {
      setAiPlanError('User not authenticated');
      return null;
    }

    if (!missingSkills || missingSkills.length === 0) {
      return null;
    }

    setAiPlanLoading(true);
    setAiPlanError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error('Authentication token not available');
      }

      const res = await fetch('/api/ai/skill-gap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hackathonTitle,
          hackathonDescription,
          missingSkills,
          userSkills: userSkillsList,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'AI recommendations are temporarily unavailable. Please try again.');
      }

      const data: AILearningPlanResponse = await res.json();
      return data;
    } catch (err: any) {
      console.error('Error generating AI learning plan:', err);
      setAiPlanError(err.message || 'AI recommendations are temporarily unavailable. Please try again.');
      return null;
    } finally {
      setAiPlanLoading(false);
    }
  };

  /**
   * 5. Helper to add or update a skill for the authenticated user
   */
  const setUserSkill = async (skillId: string, proficiency: SkillProficiency = 'intermediate'): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      const { error: upsertError } = await supabase
        .from('user_skills')
        .upsert(
          {
            user_id: user.id,
            skill_id: skillId,
            proficiency,
          },
          { onConflict: 'user_id,skill_id' }
        );

      if (upsertError) throw upsertError;
      return true;
    } catch (err: any) {
      console.error('Error setting user skill:', err.message);
      setError(err.message || 'Failed to set user skill');
      return false;
    }
  };

  /**
   * 6. Helper to remove a skill for the authenticated user
   */
  const removeUserSkill = async (skillId: string): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    try {
      const { error: deleteError } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', user.id)
        .eq('skill_id', skillId);

      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      console.error('Error removing user skill:', err.message);
      setError(err.message || 'Failed to remove user skill');
      return false;
    }
  };

  /**
   * 7. Helper to fetch all available standard skills from catalog
   */
  const getAllSkills = async (): Promise<Skill[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('skills')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      return (data || []) as Skill[];
    } catch (err: any) {
      console.error('Error fetching catalog skills:', err.message);
      return [];
    }
  };

  return {
    loading,
    error,
    aiPlanLoading,
    aiPlanError,
    getUserSkills,
    getHackathonSkills,
    analyzeSkillGap,
    generateAILearningPlan,
    setUserSkill,
    removeUserSkill,
    getAllSkills,
  };
}
