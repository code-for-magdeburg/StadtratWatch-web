import { useEffect, useState } from 'react';
import type { SessionConfig } from '../types';

interface FetchState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
  config: SessionConfig | null;
}

interface SessionDataResult<T> {
  sessionDate: string;
  error: string | null;
  data: T | null;
  config: SessionConfig | null;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${url} → ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// Loads the route's data file + the session config in parallel. The fetched
// objects are returned as-is; callers seed their own editable state from them.
export function useSessionData<T>(
  sessionDate: string | undefined,
  dataUrl: (date: string) => string,
  configUrl: (date: string) => string,
): FetchState<T> {
  const [result, setResult] = useState<SessionDataResult<T> | null>(null);

  useEffect(() => {
    if (!sessionDate) return;

    let cancelled = false;

    Promise.all([
      fetchJson<T>(dataUrl(sessionDate)),
      fetchJson<SessionConfig>(configUrl(sessionDate)),
    ])
      .then(([data, config]) => {
        if (!cancelled) {
          setResult({ sessionDate, error: null, data, config });
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setResult({ sessionDate, error: err.message, data: null, config: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionDate, dataUrl, configUrl]);

  if (!sessionDate) {
    return { loading: false, error: null, data: null, config: null };
  }
  if (result?.sessionDate !== sessionDate) {
    return { loading: true, error: null, data: null, config: null };
  }
  return { loading: false, error: result.error, data: result.data, config: result.config };
}
