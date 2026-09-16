import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { performance } from 'perf_hooks';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest(name, buildQuery) {
  const start = performance.now();
  const { data, count, error } = await buildQuery();
  const time = performance.now() - start;
  
  if (error) {
    console.log(`❌ [${name}] Error: ${error.message}`);
    return null;
  }
  
  console.log(`✅ [${name}] Time: ${time.toFixed(2)}ms | Results: ${data.length} (Total: ${count})`);
  return time;
}

async function main() {
  console.log("🚀 Running Baseline PostgreSQL Performance Tests...\n");
  
  let times = [];
  
  times.push(await runTest("1. Empty search", () => supabase.from('hackathons').select('id', { count: 'exact' }).limit(9)));
  times.push(await runTest("2. Title search", () => supabase.from('hackathons').select('id', { count: 'exact' }).ilike('title', '%AI%').limit(9)));
  times.push(await runTest("3. Organizer search", () => supabase.from('hackathons').select('id', { count: 'exact' }).ilike('organizer', '%HackClub%').limit(9)));
  times.push(await runTest("4. Location filter", () => supabase.from('hackathons').select('id', { count: 'exact' }).ilike('location', '%Online%').limit(9)));
  times.push(await runTest("5. Mode filter", () => supabase.from('hackathons').select('id', { count: 'exact' }).eq('mode', 'online').limit(9)));
  times.push(await runTest("6. Status filter", () => supabase.from('hackathons').select('id', { count: 'exact' }).eq('status', 'upcoming').limit(9)));
  times.push(await runTest("7. Date filter", () => supabase.from('hackathons').select('id', { count: 'exact' }).gte('start_date', '2026-08-01').limit(9)));
  times.push(await runTest("8. Pagination", () => supabase.from('hackathons').select('id', { count: 'exact' }).range(10, 19)));
  times.push(await runTest("9. Combined filters", () => supabase.from('hackathons').select('id', { count: 'exact' }).eq('mode', 'online').eq('status', 'upcoming').ilike('title', '%Hack%').limit(9)));
  times.push(await runTest("10. No-result search", () => supabase.from('hackathons').select('id', { count: 'exact' }).ilike('title', '%ImpossibleString123%').limit(9)));
  
  const validTimes = times.filter(t => t !== null);
  const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
  
  console.log(`\n📊 Average Search Response Time: ${avg.toFixed(2)}ms`);
}

main();
