import { useEffect, useState } from 'react';
import type { SessionConfig } from '../types';
import { env } from '../constants/env';

interface SessionData<T> {
  error: string | null;
  data: T | null;
  config: SessionConfig | null;
}

interface FetchState<T> extends SessionData<T> {
  loading: boolean;
}

interface FetchResult<T> extends SessionData<T> {
  dataUrl: string;
}

const noSessionData: SessionData<never> = { error: null, data: null, config: null };

const configUrl = (date: string) =>
  `${env.awsCloudFrontSessionsConfigsBaseFolder}/config-${date}.json`;

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
  dataUrlFor: (date: string) => string,
): FetchState<T> {
  const dataUrl = sessionDate ? dataUrlFor(sessionDate) : undefined;
  const [result, setResult] = useState<FetchResult<T> | null>(null);

  // Dropping the previous result as soon as the request changes, so switching
  // back to an earlier session while another one is loading never shows its
  // stale data (callers would re-seed and discard edits once the refetch lands).
  if (result && result.dataUrl !== dataUrl) {
    setResult(null);
  }

  useEffect(() => {
    if (!sessionDate || !dataUrl) return;

    let cancelled = false;

    Promise.all([
      fetchJson<T>(dataUrl),
      fetchJson<SessionConfig>(configUrl(sessionDate)),
    ])
      .then(([data, config]) => {
        if (!cancelled) {
          setResult({ dataUrl, error: null, data, config });
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setResult({ dataUrl, ...noSessionData, error: err.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionDate, dataUrl]);

  if (!dataUrl) {
    return { loading: false, ...noSessionData };
  }
  if (result?.dataUrl !== dataUrl) {
    return { loading: true, ...noSessionData };
  }
  return { loading: false, error: result.error, data: result.data, config: result.config };
}
