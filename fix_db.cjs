require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

function normalizeUrl(rawUrl, baseUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let trimmed = rawUrl.trim();
  if (trimmed === '') return null;
  const doubleProtocolMatch = trimmed.match(/^https?:\/\/[^/]+\/(https?:\/\/.+)$/i);
  if (doubleProtocolMatch) trimmed = doubleProtocolMatch[1];
  if (trimmed.startsWith('//')) trimmed = 'https:' + trimmed;
  try {
    const parsed = new URL(trimmed);
    return parsed.href;
  } catch (e) {
    try {
      if (!baseUrl) return trimmed;
      const parsedBase = new URL(baseUrl);
      const parsed = new URL(trimmed, parsedBase.href);
      return parsed.href;
    } catch (err) {
      return null;
    }
  }
}

async function run() {
  console.log("Fetching all hackathons...");
  const { data, error } = await supabase.from('hackathons').select('id, title, registration_url, image_url, source');
  if (error) {
    console.error(error); return;
  }
  
  let updatedCount = 0;
  for (let i = 0; i < data.length; i++) {
    let row = data[i];
    let baseUrl = 'https://unstop.com';
    if (row.source === 'devfolio') baseUrl = 'https://devfolio.co';
    if (row.source === 'hackerearth') baseUrl = 'https://www.hackerearth.com';

    let newRegUrl = normalizeUrl(row.registration_url, baseUrl);
    let newImgUrl = normalizeUrl(row.image_url, baseUrl);
    
    if (newRegUrl !== row.registration_url || newImgUrl !== row.image_url) {
        const { error: updateError } = await supabase.from('hackathons').update({
            registration_url: newRegUrl,
            image_url: newImgUrl
        }).eq('id', row.id);
        
        if (!updateError) {
            updatedCount++;
            console.log(`Fixed URLs for: ${row.title}`);
        }
    }
  }
  console.log(`Updated ${updatedCount} rows.`);
}
run();
