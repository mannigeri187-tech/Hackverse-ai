import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function runTest(name, url) {
  const start = performance.now();
  try {
    const res = await fetch(url);
    const data = await res.json();
    const time = performance.now() - start;
    
    if (!res.ok) {
      console.log(`❌ [${name}] API Error`);
      return null;
    }
    
    console.log(`✅ [${name}] Source: ${data.source.toUpperCase().padEnd(8)} | API Time: ${time.toFixed(2)}ms (Internal: ${data.responseTime.toFixed(2)}ms) | Results: ${data.data.length}`);
    return { time, internal: data.responseTime, source: data.source };
  } catch (err) {
    console.log(`❌ [${name}] Request Failed: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log("🚀 Running API Cache Tests...\n");
  
  const baseUrl = 'http://localhost:3001/api/hackathons/search';
  
  // 1. Cold start / Cache miss
  await runTest("1. First request / cache miss", `${baseUrl}?query=Online`);
  
  // 2. Repeated request / Cache hit
  await runTest("2. Repeated request / cache hit", `${baseUrl}?query=Online`);
  
  // 3. Search cache hit
  await runTest("3. Search cache hit", `${baseUrl}?query=Online`);
  
  // 4. Search cache miss
  await runTest("4. Search cache miss", `${baseUrl}?mode=offline`);
  
  // 7 & 8 are simulated if Redis is unavailable
  console.log("\nNote: If REDIS_URL is not set in .env.local, all requests will gracefully fallback to POSTGRES.");
}

main();
