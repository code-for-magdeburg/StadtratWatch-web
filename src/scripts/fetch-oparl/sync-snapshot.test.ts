import { describe, expect, it } from 'bun:test';
import { OPARL_SNAPSHOT_FILENAMES, type OparlManifest, shortSnapshotSha } from '../shared/oparl/oparl-snapshot.ts';
import type { SnapshotSource } from './snapshot-source.ts';
import type { LocalShas, SnapshotStore } from './snapshot-store.ts';
import { type SyncLogger, syncOparlSnapshot } from './sync-snapshot.ts';

const encoder = new TextEncoder();

/** In-memory store standing in for the filesystem port, so the integration is tested without I/O. */
function inMemoryStore(initial: Record<string, string> = {}) {
  const files = new Map<string, string>(Object.entries(initial));
  let metadata: string | undefined;

  const store: SnapshotStore = {
    ensureReady: () => Promise.resolve(),
    async readLocalShas() {
      const shas: LocalShas = new Map();
      for (const filename of OPARL_SNAPSHOT_FILENAMES) {
        const content = files.get(filename);
        shas.set(filename, content === undefined ? null : await shortSnapshotSha(encoder.encode(content)));
      }
      return shas;
    },
    async writeBlob(filename, body) {
      files.set(filename, new TextDecoder().decode(await new Response(body).arrayBuffer()));
    },
    writeScraperMetadata(lastSync) {
      metadata = lastSync;
      return Promise.resolve();
    },
    createStagingSnapshot() {
      const stagedFiles = new Map(files);
      let stagedMetadata = metadata;
      const stagedStore: SnapshotStore = {
        ensureReady: () => Promise.resolve(),
        async readLocalShas() {
          const shas: LocalShas = new Map();
          for (const filename of OPARL_SNAPSHOT_FILENAMES) {
            const content = stagedFiles.get(filename);
            shas.set(filename, content === undefined ? null : await shortSnapshotSha(encoder.encode(content)));
          }
          return shas;
        },
        async writeBlob(filename, body) {
          stagedFiles.set(filename, new TextDecoder().decode(await new Response(body).arrayBuffer()));
        },
        writeScraperMetadata(lastSync) {
          stagedMetadata = lastSync;
          return Promise.resolve();
        },
        createStagingSnapshot: () => Promise.reject(new Error('Nested staging snapshots are unsupported.')),
      };

      return Promise.resolve({
        store: stagedStore,
        commit() {
          files.clear();
          for (const [filename, content] of stagedFiles) files.set(filename, content);
          metadata = stagedMetadata;
          return Promise.resolve();
        },
        discard: () => Promise.resolve(),
      });
    },
  };

  return { store, files, getMetadata: () => metadata };
}

type SourceOptions = { lastSync?: string; failManifest?: boolean };

/** In-memory source standing in for the HTTP port; records which blobs were actually requested. */
async function inMemorySource(content: Record<string, string>, { lastSync, failManifest = false }: SourceOptions = {}) {
  const files: OparlManifest['files'] = {};
  const blobs = new Map<string, Uint8Array>();
  for (const [filename, text] of Object.entries(content)) {
    const data = encoder.encode(text);
    const sha = await shortSnapshotSha(data);
    const blob = `${filename.replace(/\.json$/, '')}.${sha}.json.gz`;
    files[filename] = { blob, sha, bytes: data.length };
    blobs.set(blob, data);
  }
  const manifest: OparlManifest = lastSync ? { lastSync, files } : { files };
  const blobRequests: string[] = [];

  const source: SnapshotSource = {
    tryFetchManifest: () =>
      Promise.resolve(failManifest ? { ok: false, reason: 'boom' } as const : { ok: true, manifest } as const),
    fetchBlob(blob) {
      blobRequests.push(blob);
      const data = blobs.get(blob);
      if (!data) return Promise.reject(new Error(`unknown blob ${blob}`));
      return Promise.resolve(new Response(data as BodyInit).body!);
    },
  };

  return { source, blobRequests };
}

function fullContent(overrides: Record<string, string> = {}): Record<string, string> {
  const content: Record<string, string> = {};
  for (const filename of OPARL_SNAPSHOT_FILENAMES) {
    content[filename] = JSON.stringify([{ file: filename }]);
  }
  return { ...content, ...overrides };
}

function silentLog(): SyncLogger & { warnings: string[] } {
  const warnings: string[] = [];
  return { info: () => {}, warn: (message) => warnings.push(message), warnings };
}

describe('syncOparlSnapshot', () => {
  it('downloads nothing when every local file already matches the manifest', async () => {
    const content = fullContent();
    const { store } = inMemoryStore(content);
    const { source, blobRequests } = await inMemorySource(content);

    const result = await syncOparlSnapshot(source, store, silentLog());

    expect(result.downloaded).toEqual([]);
    expect(result.upToDate.length).toEqual(OPARL_SNAPSHOT_FILENAMES.length);
    expect(blobRequests).toEqual([]);
  });

  it('downloads only the file whose hash changed and writes the new content', async () => {
    const { store, files } = inMemoryStore(fullContent());
    const remoteContent = fullContent({ 'papers.json': JSON.stringify([{ updated: true }]) });
    const { source } = await inMemorySource(remoteContent);

    const result = await syncOparlSnapshot(source, store, silentLog());

    expect(result.downloaded).toEqual(['papers.json']);
    expect(files.get('papers.json')).toEqual(remoteContent['papers.json']);
  });

  it('downloads a file that is missing locally', async () => {
    const content = fullContent();
    const local = { ...content };
    delete local['files.json'];
    const { store, files } = inMemoryStore(local);
    const { source } = await inMemorySource(content);

    const result = await syncOparlSnapshot(source, store, silentLog());

    expect(result.downloaded).toEqual(['files.json']);
    expect(files.get('files.json')).toEqual(content['files.json']);
  });

  it('warns and keeps local files when the manifest is unreachable but all files exist', async () => {
    const content = fullContent();
    const { store } = inMemoryStore(content);
    const { source } = await inMemorySource(content, { failManifest: true });
    const log = silentLog();

    const result = await syncOparlSnapshot(source, store, log);

    expect(result.downloaded).toEqual([]);
    expect(log.warnings.length).toEqual(1);
  });

  it('restores the scraper metadata from the manifest lastSync', async () => {
    const content = fullContent();
    const { store, getMetadata } = inMemoryStore(content);
    const { source } = await inMemorySource(content, { lastSync: '2026-06-28T12:34:56.000Z' });

    await syncOparlSnapshot(source, store, silentLog());

    expect(getMetadata()).toEqual('2026-06-28T12:34:56.000Z');
  });

  it('does not touch the scraper metadata when the manifest has no lastSync', async () => {
    const content = fullContent();
    const { store, getMetadata } = inMemoryStore(content);
    const { source } = await inMemorySource(content);

    await syncOparlSnapshot(source, store, silentLog());

    expect(getMetadata()).toEqual(undefined);
  });

  it('throws when the manifest is unreachable and a required file is missing', async () => {
    const content = fullContent();
    const local = { ...content };
    delete local['organizations.json'];
    const { store } = inMemoryStore(local);
    const { source } = await inMemorySource(content, { failManifest: true });

    await expect(syncOparlSnapshot(source, store, silentLog())).rejects.toThrow('organizations.json');
  });

  it('keeps the current snapshot intact when a later blob download fails', async () => {
    const initial = fullContent();
    const { store, files } = inMemoryStore(initial);
    const remote = fullContent({
      'meetings.json': JSON.stringify([{ updated: 'meetings' }]),
      'papers.json': JSON.stringify([{ updated: 'papers' }]),
    });
    const { source } = await inMemorySource(remote);
    const originalFetchBlob = source.fetchBlob;
    source.fetchBlob = (blob) =>
      blob.startsWith('papers.') ? Promise.reject(new Error('papers download failed')) : originalFetchBlob(blob);

    await expect(syncOparlSnapshot(source, store, silentLog())).rejects.toThrow('papers download failed');

    expect(Object.fromEntries(files)).toEqual(initial);
  });
});
