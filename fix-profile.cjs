const fs = require('fs');
let code = fs.readFileSync('src/pages/ProfilePage.tsx', 'utf8');

const oldCode = \        try {
          // Fetch profile
          const { data: pData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          let currentProfile = pData || {};
          
          // Merge with auth metadata if missing
          if (user.user_metadata) {
            if (!currentProfile.name) currentProfile.name = user.user_metadata.full_name || user.email?.split('@')[0];
            if (!currentProfile.headline) currentProfile.headline = user.user_metadata.headline;
            if (!currentProfile.bio) currentProfile.bio = user.user_metadata.bio;
            if (!currentProfile.location) currentProfile.location = user.user_metadata.location;
            if (!currentProfile.linkedin_url) currentProfile.linkedin_url = user.user_metadata.linkedin_url;
            if (!currentProfile.github_url) currentProfile.github_url = user.user_metadata.github_url;
            if (!currentProfile.portfolio_url) currentProfile.portfolio_url = user.user_metadata.portfolio_url;
            if (!currentProfile.avatar_url) currentProfile.avatar_url = user.user_metadata.avatar_url || user.user_metadata.picture || currentProfile.profile_image;
          }
  
          // Clean up linkedIn URL if it's duplicated in the database from the previous bug
          if (currentProfile.linkedin_url) {
            const m = currentProfile.linkedin_url.match(/^(https:\/\/[^/]+\.linkedin\.com\/in\/[^/]+\/?)/i);
            if (m) {
              currentProfile.linkedin_url = m[1];
            }
          }
    
          setProfile(currentProfile);
          setEditForm(currentProfile);
    
          // Fetch skills
          const { data: sData } = await supabase
            .from('user_skills')
            .select('skills ( id, name, category )')
            .eq('user_id', user.id);
            
          setSkills((sData || []).map(s => s.skills).filter(Boolean));
  
          // Fetch Certificates
          const { data: cData } = await supabase
            .from('certificates')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          setCertificates(cData || []);
  
          // Fetch Workspaces (Projects)
          const { count: projectCount } = await supabase
            .from('workspaces')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
  
          // Fetch Accepted Team Requests to approximate hackathon participation
          const { data: tData } = await supabase
            .from('team_requests')
            .select('hackathon_id')
            .or(\\\sender_id.eq.\,receiver_id.eq.\\\\)
            .eq('status', 'accepted');\;

const replacement = \        try {
          // Fetch all data in parallel to prevent network waterfall
          const [
            { data: pData },
            { data: sData },
            { data: cData },
            { count: projectCount },
            { data: tData }
          ] = await Promise.all([
            supabase.from('profiles').select('*').eq('user_id', user.id).single(),
            supabase.from('user_skills').select('skills ( id, name, category )').eq('user_id', user.id),
            supabase.from('certificates').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('workspaces').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('team_requests').select('hackathon_id').or(\\\sender_id.eq.\,receiver_id.eq.\\\\).eq('status', 'accepted')
          ]);
            
          let currentProfile = pData || {};
          
          // Merge with auth metadata if missing
          if (user.user_metadata) {
            if (!currentProfile.name) currentProfile.name = user.user_metadata.full_name || user.email?.split('@')[0];
            if (!currentProfile.headline) currentProfile.headline = user.user_metadata.headline;
            if (!currentProfile.bio) currentProfile.bio = user.user_metadata.bio;
            if (!currentProfile.location) currentProfile.location = user.user_metadata.location;
            if (!currentProfile.linkedin_url) currentProfile.linkedin_url = user.user_metadata.linkedin_url;
            if (!currentProfile.github_url) currentProfile.github_url = user.user_metadata.github_url;
            if (!currentProfile.portfolio_url) currentProfile.portfolio_url = user.user_metadata.portfolio_url;
            if (!currentProfile.avatar_url) currentProfile.avatar_url = user.user_metadata.avatar_url || user.user_metadata.picture || currentProfile.profile_image;
          }
  
          // Clean up linkedIn URL if it's duplicated in the database from the previous bug
          if (currentProfile.linkedin_url) {
            const m = currentProfile.linkedin_url.match(/^(https:\/\/[^/]+\.linkedin\.com\/in\/[^/]+\/?)/i);
            if (m) {
              currentProfile.linkedin_url = m[1];
            }
          }
    
          setProfile(currentProfile);
          setEditForm(currentProfile);
          
          setSkills((sData || []).map(s => s.skills).filter(Boolean));
          setCertificates(cData || []);\;

code = code.replace(oldCode, replacement);
fs.writeFileSync('src/pages/ProfilePage.tsx', code, 'utf8');
console.log('Fixed ProfilePage.tsx');
