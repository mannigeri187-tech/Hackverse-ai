import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { isUpcomingEvent } from '../api/_shared/normalizer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data } = await supabase.from('hackathons').select('*');
  let active = 0;
  for (const item of data) {
    if (isUpcomingEvent(item.start_date, item.end_date, item.registration_deadline, item.status)) {
      active++;
    } else {
      console.log('REJECTED:', item.title, '| Start:', item.start_date, '| End:', item.end_date, '| Status:', item.status);
    }
  }
  console.log(`\nTotal: ${data.length} | Upcoming/Active: ${active}`);
}

main();
