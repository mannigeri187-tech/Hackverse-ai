import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables from .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ ERROR: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  console.error("Make sure you add SUPABASE_SERVICE_ROLE_KEY (from Supabase -> Settings -> API) to .env.local");
  process.exit(1);
}

// Create a Supabase client with the Service Role key to bypass RLS for writes
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fetchHackClub() {
  console.log("Fetching HackClub Hackathons...");
  try {
    const res = await fetch("https://hackathons.hackclub.com/api/events/upcoming");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    
    let processedCount = 0;
    
    for (const event of data) {
      if (!event.name || !event.start) continue;

      let locationStr = [event.city, event.state, event.country]
        .filter(Boolean)
        .join(", ");
        
      if (!locationStr && event.virtual) locationStr = "Online";

      const hackathon = {
        title: event.name,
        description: "",
        organizer: "HackClub (Partner/Supported)",
        start_date: event.start,
        end_date: event.end || event.start,
        registration_deadline: event.start, // Fallback
        location: locationStr,
        mode: event.virtual ? "online" : event.hybrid ? "hybrid" : "offline",
        prize: "Varies",
        team_size: "Varies",
        eligibility: "High School / College",
        registration_url: event.website,
        image_url: event.logo || event.banner,
        status: "upcoming",
        source: "hackclub",
        external_id: event.id
      };

      const { error } = await supabase
        .from('hackathons')
        .upsert(hackathon, { onConflict: 'source, external_id' });

      if (error) {
        console.error(`❌ Error upserting HackClub event ${event.name}:`, error.message);
      } else {
        processedCount++;
      }
    }
    console.log(`✅ Successfully synced ${processedCount} HackClub events.`);
  } catch (err) {
    console.error("❌ Error fetching from HackClub:", err);
  }
}


async function main() {
  console.log("🚀 Starting Hackathon Data Collection...");
  await fetchHackClub();
  console.log("🎉 Data Collection Complete!");
}

main();
