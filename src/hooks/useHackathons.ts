import { useState, useEffect, useRef } from 'react';
import { isUpcomingHackathon } from '../utils/hackathonDate';

export type Hackathon = {
  id: string;
  title: string;
  organizer: string;
  start_date: string;
  end_date?: string;
  registration_deadline?: string;
  location: string;
  mode: string;
  image_url: string;
  status: string;
  registration_url?: string;
  registration_url_status?: string;
  description?: string;
};

export type SearchParams = {
  query?: string;
  location?: string;
  regionFilter?: string; // 'all' | 'india' | 'karnataka' | 'bengaluru' | 'online' | 'international'
  mode?: string;
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
};

// Client-Side In-Memory Cache Map for instant back-navigation and filter toggles (0ms)
const clientCache = new Map<string, { data: Hackathon[]; count: number; responseTime: number; source: string; timestamp: number }>();
const CLIENT_CACHE_TTL = 60000; // 1 minute

export function useHackathons(params: SearchParams) {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [dataSource, setDataSource] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 1. Build stable cache key & query params
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.location) queryParams.append('location', params.location);
    if (params.regionFilter && params.regionFilter !== 'all') queryParams.append('regionFilter', params.regionFilter);
    if (params.mode && params.mode !== 'all') queryParams.append('mode', params.mode);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.date) queryParams.append('date', params.date);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const cacheKey = queryParams.toString() || 'default';

    // 2. Check Client-Side In-Memory Cache First (Immediate 0ms paint)
    const cached = clientCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
      setHackathons(cached.data);
      setTotalCount(cached.count);
      setResponseTime(0.5);
      setDataSource('instant-cache');
      setIsLoading(false);
      setIsError(false);
      return;
    }

    // 3. Abort previous in-flight request if user is still typing/toggling
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    async function fetchHackathons() {
      setIsLoading(true);
      setIsError(false);

      try {
        const fetchStartTime = performance.now();
        const res = await fetch(`/api/hackathons/search?${cacheKey}`, {
          signal: abortController.signal
        });
        
        if (!res.ok) throw new Error('Failed to fetch from API');

        const result = await res.json();
        const clientLatency = performance.now() - fetchStartTime;

        const rawList = (result.data || []) as Hackathon[];
        const validList = params.status === 'completed' ? rawList : rawList.filter(isUpcomingHackathon);

        setHackathons(validList);
        setTotalCount(params.status === 'completed' ? (result.count || validList.length) : validList.length);
        setResponseTime(result.responseTime || clientLatency);
        setDataSource(result.source || 'postgres');

        // Store in client cache
        clientCache.set(cacheKey, {
          data: validList,
          count: validList.length,
          responseTime: result.responseTime || clientLatency,
          source: result.source || 'postgres',
          timestamp: Date.now()
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching hackathons:', err);
          setIsError(true);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchHackathons();

    return () => {
      abortController.abort();
    };
  }, [
    params.query, 
    params.location, 
    params.regionFilter, 
    params.mode, 
    params.status, 
    params.date, 
    params.page, 
    params.limit
  ]);

  return { hackathons, totalCount, isLoading, isError, responseTime, dataSource };
}
