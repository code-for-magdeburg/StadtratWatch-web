import type { ReactNode } from 'react';

interface Props {
  loading: boolean;
  error: string | null;
  empty: boolean;
  children: ReactNode;
}

// Loading / error / empty states (the original Angular app had none).
export function StatusGate({ loading, error, empty, children }: Props) {
  if (loading) return <p style={{ padding: '1rem' }}>Loading…</p>;
  if (error) {
    return (
      <p style={{ padding: '1rem', color: 'red' }}>
        Failed to load: {error}
      </p>
    );
  }
  if (empty) return <p style={{ padding: '1rem' }}>No data for this session.</p>;
  return <>{children}</>;
}
