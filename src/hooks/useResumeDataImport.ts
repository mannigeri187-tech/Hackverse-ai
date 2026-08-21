import { supabase } from '../lib/supabase';
import { defaultResumeContent } from '../types/resume';
import type { ResumeContent } from '../types/resume';

export async function gatherUserResumeData(userId: string): Promise<ResumeContent> {
  const data: ResumeContent = { ...defaultResumeContent };
  
  try {
    // 1. Get Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('user_id', userId)
      .single();
      
    if (profile) {
      data.name = profile.name || '';
      data.email = profile.email || '';
    }

    // 2. Get Workspaces (Projects & Hackathons)
    const { data: workspaces } = await supabase
      .from('workspaces')
      .select(`
        id, 
        project_name, 
        problem_statement, 
        solution, 
        tech_stack, 
        github_url,
        hackathon:hackathons(id, title, organizer, start_date)
      `)
      .eq('user_id', userId);

    const allSkills = new Set<string>();

    if (workspaces && workspaces.length > 0) {
      workspaces.forEach(ws => {
        // Collect skills
        if (ws.tech_stack && Array.isArray(ws.tech_stack)) {
          ws.tech_stack.forEach(tech => {
            const cleanTech = tech.trim();
            if (cleanTech) allSkills.add(cleanTech);
          });
        }
        
        // Build project description
        const descParts = [];
        if (ws.problem_statement) descParts.push(`Problem: ${ws.problem_statement}`);
        if (ws.solution) descParts.push(`Solution: ${ws.solution}`);
        const description = descParts.join(' | ') || 'No description provided.';
        
        const projectItem = {
          id: ws.id,
          name: ws.project_name || 'Untitled Project',
          description: description,
          technologies: Array.isArray(ws.tech_stack) ? ws.tech_stack.join(', ') : '',
          link: ws.github_url || ''
        };

        // If it belongs to a hackathon, add to hackathons, else to projects
        if (ws.hackathon) {
           const hackathonData = Array.isArray(ws.hackathon) ? ws.hackathon[0] : ws.hackathon;
           if (hackathonData) {
             data.hackathons.push({
               ...projectItem,
               name: `${projectItem.name} (at ${(hackathonData as any).title || 'Hackathon'})`
             });
           } else {
             data.projects.push(projectItem);
           }
        } else {
           data.projects.push(projectItem);
        }
      });
    }

    // 3. Get Certificates
    const { data: certificates } = await supabase
      .from('certificates')
      .select('title, issuer, certificate_date')
      .eq('user_id', userId);
      
    if (certificates && certificates.length > 0) {
      const certLines = certificates.map(cert => {
        let line = cert.title;
        if (cert.issuer) line += ` - ${cert.issuer}`;
        if (cert.certificate_date) line += ` (${new Date(cert.certificate_date).getFullYear()})`;
        return line;
      });
      data.certifications = certLines.join('\n');
    }

    // Assign collected skills
    if (allSkills.size > 0) {
      data.skills = Array.from(allSkills).join(', ');
    }

  } catch (err) {
    console.error('Error gathering resume data:', err);
  }
  
  return data;
}
