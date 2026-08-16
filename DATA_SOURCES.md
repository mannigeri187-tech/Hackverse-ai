# Hackathon Data Sources

## Primary Source
**Hack Club Events API**
- **URL**: `https://hackathons.hackclub.com/api/events/upcoming`
- **Type**: Clean REST JSON API
- **Credentials Required**: None
- **Rate Limits**: Standard public rate limit (be reasonable)
- **Duplicate Strategy**: Unique `source` ("hackclub") and `external_id` (HackClub ID)

## Removed Source
**Major League Hacking (MLH)**
- **Reason**: Automated data usage could not be sufficiently verified for our intended use.

## How it works

The data collector (`scripts/collector.js`) is a Node.js script designed to be run securely from a backend server or manually on your local machine.

### **Important Security Note:** 
Because writing to the `hackathons` table is blocked for normal users by Row Level Security (RLS), the collector **must** use the `SUPABASE_SERVICE_ROLE_KEY`. This key is an absolute secret and is **never** used in the React Vite application. It only exists in your `.env.local` for local execution or your secure server environment.

### Field Mapping

| Supabase Field | HackClub Mapping |
| :--- | :--- |
| `title` | `name` |
| `start_date` | `start` |
| `end_date` | `end` |
| `location` | Concat of City, State, Country |
| `mode` | `virtual` / `hybrid` checks |
| `registration_url` | `website` |
| `image_url` | `logo` |

## How to run locally

1. Ensure your Supabase Dashboard -> Project Settings -> API `service_role` secret key is added to `D:\app 02\hackverse-ai\.env.local` like this:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR...
   ```
2. Open a terminal in the project root.
3. Run: `node scripts/collector.js`

If there are duplicate events, the script will silently update the existing ones without creating duplicates thanks to the `ON CONFLICT (source, external_id)` constraint!
