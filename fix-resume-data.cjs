const fs = require('fs');
let code = fs.readFileSync('src/utils/resume/resumeDataService.ts', 'utf8');

// Replace sequential awaits with Promise.all
const newCode = code.replace(
  /\/\/ 1\. Fetch Basic Profile Data[\s\S]*?const \{ data: certificates \} = await supabase[\s\S]*?\.eq\('user_id', userId\);/,
  \// Fetch all user data in parallel to prevent network waterfall and improve speed
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
    ]);\
);

fs.writeFileSync('src/utils/resume/resumeDataService.ts', newCode, 'utf8');
