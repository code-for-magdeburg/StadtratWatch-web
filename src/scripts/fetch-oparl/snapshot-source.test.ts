import { describe, expect, it } from 'bun:test';
import type { OparlManifest } from '../shared/oparl/oparl-snapshot.ts';
import { createHttpSnapshotSource, type FetchFn } from './snapshot-source.ts';

const BASE_URL = 'https://cdn.example.test/';
const PREFIX = 'oparl';

const MANIFEST: OparlManifest = { files: { 'papers.json': { blob: 'papers.abc.json.gz', sha: 'abc', bytes: 3 } } };

function recordingFetch(handler: (url: string) => Response): FetchFn & { urls: string[] } {
  const urls: string[] = [];
  const fetchFn = (url: string) => {
    urls.push(url);
    return Promise.resolve(handler(url));
  };
  return Object.assign(fetchFn, { urls });
}

describe('createHttpSnapshotSource', () => {
  it('requests the manifest under the prefix and normalises the trailing slash', async () => {
    const fetchFn = recordingFetch(() => new Response(JSON.stringify(MANIFEST)));
    const source = createHttpSnapshotSource(BASE_URL, PREFIX, fetchFn);

    const result = await source.tryFetchManifest();

    expect(fetchFn.urls).toEqual(['https://cdn.example.test/oparl/manifest.json']);
    expect(result).toEqual({ ok: true, manifest: MANIFEST });
  });

  it('reports an unreachable manifest as a value, not an exception', async () => {
    const fetchFn = recordingFetch(() => new Response(null, { status: 503, statusText: 'Service Unavailable' }));
    const source = createHttpSnapshotSource(BASE_URL, PREFIX, fetchFn);

    const result = await source.tryFetchManifest();

    expect(result.ok).toEqual(false);
    if (!result.ok) expect(result.reason).toContain('503');
  });

  it('reports a malformed 200 manifest as a value, not an exception', async () => {
    const fetchFn = recordingFetch(() => new Response(JSON.stringify({ notFiles: true })));
    const source = createHttpSnapshotSource(BASE_URL, PREFIX, fetchFn);

    const result = await source.tryFetchManifest();

    expect(result.ok).toEqual(false);
    if (!result.ok) expect(result.reason).toContain('malformed');
  });

  it('reports a thrown fetch as a value', async () => {
    const source = createHttpSnapshotSource(BASE_URL, PREFIX, () => Promise.reject(new Error('network down')));

    const result = await source.tryFetchManifest();

    expect(result.ok).toEqual(false);
    if (!result.ok) expect(result.reason).toContain('network down');
  });

  it('streams a blob body from the prefixed URL', async () => {
    const fetchFn = recordingFetch(() => new Response('payload'));
    const source = createHttpSnapshotSource(BASE_URL, PREFIX, fetchFn);

    const body = await source.fetchBlob('papers.abc.json.gz');

    expect(fetchFn.urls).toEqual(['https://cdn.example.test/oparl/papers.abc.json.gz']);
    expect(await new Response(body).text()).toEqual('payload');
  });

  it('throws when a blob request fails', async () => {
    const source = createHttpSnapshotSource(
      BASE_URL,
      PREFIX,
      () => Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' })),
    );

    await expect(source.fetchBlob('missing.json.gz')).rejects.toThrow('404');
  });
});
