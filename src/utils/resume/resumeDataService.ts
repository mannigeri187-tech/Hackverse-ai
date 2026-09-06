import { supabase } from '../../lib/supabase';
import type { ResumeData } from '../../types/resumeBuilder';

export async function fetchUserResumeData(userId: string): Promise<ResumeData | null> {
  if (!userId) return null;

  try {
    // Fetch all user data in parallel to eliminate network waterfall and improve speed
    const [
      { data: profile },
      { data: teamProfile },
      { data: workspaces },
      { data: certificates }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('team_profiles').select('skills, bio').eq('user_id', userId).maybeSingle(),
      supabase.from('workspaces').select('id, project_name, problem_statement, solution, tech_stack, github_url, hackathon:hackathons(id, title, start_date, end_date)').eq('user_id', userId),
      supabase.from('certificates').select('*').eq('user_id', userId)
    ]);

    // Map Workspaces to Projects
    const projects = (workspaces || []).map(w => ({
      id: w.id,
      name: w.project_name || 'Untitled Project',
      description: w.solution || w.problem_statement || '',
      technologies: Array.isArray(w.tech_stack) ? w.tech_stack : [],
      githubUrl: w.github_url || '',
      included: true
    }));

    // Map Workspaces to Hackathons (participated)
    const hackathons = (workspaces || [])
      .filter(w => w.hackathon)
      .map(w => {
        const h = w.hackathon as any;
        return {
          id: h?.id,
          name: h?.title || 'Unknown Hackathon',
          project: w.project_name || 'N/A',
          date: h?.start_date || '',
          url: w.github_url || '',
          included: true
        };
      });

    // Map Certificates
    const certifications = (certificates || []).map(c => ({
      id: c.id,
      title: c.title,
      issuer: c.issuer || 'HackVerse AI',
      date: c.certificate_date || c.created_at,
      url: c.certificate_url || '',
      included: true
    }));

    const data: ResumeData = {
      personal: {
        name: profile?.name || 'Your Name',
        title: profile?.headline || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        location: profile?.location || profile?.college || '',
        profileImage: profile?.profile_image || '',
        github: profile?.github_url || '',
        linkedin: profile?.linkedin_url || '',
        portfolio: profile?.portfolio_url || ''
      },
      summary: profile?.bio || teamProfile?.bio || '',
      skills: teamProfile?.skills || [],
      projects,
      hackathons,
      certifications,
      education: [],
      experience: [],
      achievements: []
    };

    return data;
  } catch (err) {
    console.error('Error fetching resume data service:', err);
    return null;
  }
}
