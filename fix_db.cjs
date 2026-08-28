require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("Fetching Unstop hackathons...");
  const { data, error } = await supabase.from('hackathons').select('id, title, registration_url, image_url, external_id');
  
  if (error) {
    console.error(error);
    return;
  }
  
  let updatedCount = 0;
  
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    let needsUpdate = false;
    let newRegUrl = row.registration_url;
    
    // Fix registration URL
    if (newRegUrl && newRegUrl.startsWith('https://unstop.com/https://unstop.com/')) {
        newRegUrl = newRegUrl.replace('https://unstop.com/https://unstop.com/', 'https://unstop.com/');
        needsUpdate = true;
    }
    
    if (needsUpdate) {
        const { error: updateError } = await supabase.from('hackathons').update({
            registration_url: newRegUrl
        }).eq('id', row.id);
        
        if (updateError) {
            console.error(`Error updating row ${row.id}:`, updateError.message);
        } else {
            updatedCount++;
            console.log(`Fixed URL for: ${row.title}`);
        }
    }
  }
  
  console.log(`Updated ${updatedCount} rows.`);
}

run();
