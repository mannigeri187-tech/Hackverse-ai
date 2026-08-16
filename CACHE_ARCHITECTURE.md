# Redis Caching Architecture

## Objective
Provide an intermediate caching layer to reduce the load on the primary Supabase PostgreSQL database while ensuring seamless fallback functionality if the cache is unavailable.

## Configuration
- **Provider**: Any standard Redis server (e.g., Upstash, AWS ElastiCache, Local Redis).
- **Environment Variable**: `REDIS_URL` in `.env.local`.
- **Backend API**: An Express.js backend (`server.js`) securely interfaces between the React frontend and Redis/Supabase. 

## Cache Strategy: Cache-Aside

### What is Cached?
1. **Search Results**: Highly repeated queries (like viewing upcoming hackathons on the homepage) are cached.
   - **Cache Key**: `hackathons:search:[md5_hash_of_query_params]`
   - **TTL**: 5 minutes (300 seconds)
2. **Hackathon Details**: Individual event data.
   - **Cache Key**: `hackathon:detail:[uuid]`
   - **TTL**: 1 hour (3600 seconds)

### What is NOT Cached?
- User authentication tokens.
- User profile data (e.g., "Saved Hackathons").
- Sensitive or highly dynamic user-specific information.

## Fallback & Failure Handling
If `REDIS_URL` is omitted, or if the Redis server goes offline/times out, the `getFromCache` function gracefully catches the error and silently falls back to querying Supabase directly. The application will never crash due to a Redis failure.

## Cache Invalidation
Because the data comes from a scheduled data collector script (`scripts/collector.js`), the primary invalidation strategy relies on short TTLs (Time To Live). Five minutes for searches ensures data remains fresh without needing complex manual flushing logic. 

## Security
- **No Client-Side Credentials**: The React frontend only knows about `http://localhost:3001/api/...`. It has no knowledge of Redis passwords or the Supabase Service Role key.
- **Service-Role Kept Safe**: The service role is securely held in the Node.js backend.
