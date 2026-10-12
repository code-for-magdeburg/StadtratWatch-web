import { useEffect, useState } from 'react';
import type { SessionConfig } from '../types';

interface FetchState<T> {
  loading: boolean;
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
  const [state, setState] = useState<FetchState<T>>({
    loading: true,
    error: null,
    data: null,
    config: null,
  });

  useEffect(() => {
    if (!sessionDate) {
      setState({ loading: false, error: null, data: null, config: null });
      return;
    }

    let cancelled = false;
    setState({ loading: true, error: null, data: null, config: null });

    Promise.all([
      fetchJson<T>(dataUrl(sessionDate)),
      fetchJson<SessionConfig>(configUrl(sessionDate)),
    ])
      .then(([data, config]) => {
        if (!cancelled) {
          setState({ loading: false, error: null, data, config });
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setState({ loading: false, error: err.message, data: null, config: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionDate, dataUrl, configUrl]);

  return state;
}
