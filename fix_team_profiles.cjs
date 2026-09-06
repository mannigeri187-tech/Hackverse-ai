require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function backfill() {
  console.log('Fetching all profiles...');
  const { data: profiles, error: err1 } = await supabase.from('profiles').select('user_id, name');
  if (err1) return console.error('Error fetching profiles:', err1);

  console.log('Fetching existing team profiles...');
  const { data: teamProfiles, error: err2 } = await supabase.from('team_profiles').select('user_id');
  if (err2) return console.error('Error fetching team profiles:', err2);

  const existingIds = new Set(teamProfiles.map(tp => tp.user_id));
  
  const toInsert = profiles
    .filter(p => !existingIds.has(p.user_id))
    .map(p => ({
      user_id: p.user_id,
      display_name: p.name || 'Anonymous Hacker'
    }));

  if (toInsert.length > 0) {
    console.log('Inserting', toInsert.length, 'missing team profiles...');
    const { error: err3 } = await supabase.from('team_profiles').insert(toInsert);
    if (err3) console.error('Error inserting:', err3);
    else console.log('Successfully backfilled!');
  } else {
    console.log('No missing team profiles to backfill.');
  }
}
backfill();
