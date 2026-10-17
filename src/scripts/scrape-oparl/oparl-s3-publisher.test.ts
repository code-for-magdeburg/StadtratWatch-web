import { type FileReader, type MetadataReader, uploadOparlSnapshot } from './oparl-s3-publisher.ts';
import type { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { describe, expect, it } from 'bun:test';
import { OPARL_SNAPSHOT_FILENAMES } from '../shared/oparl/oparl-snapshot.ts';

const BUCKET = 'test-bucket';
const PREFIX = 'oparl';
const DIR = '/ignored'; // unused: the reader is injected, so no filesystem is touched

/** Metadata reader yielding a fixed timestamp, so tests need no filesystem access. */
function fakeMetadata(lastSync: string | null): MetadataReader {
  return () => Promise.resolve(lastSync);
}

type PutInput = PutObjectCommandInput;

/** Records every put and returns a no-op success, so no real S3 client is touched. */
function recordingSend(calls: PutInput[]) {
  return (input: PutInput): Promise<unknown> => {
    calls.push(input);
    return Promise.resolve({});
  };
}

/** In-memory reader: content for each file is `{"name":"<file>"}`, or rejects for `missing`. */
function fakeReader(missing: Set<string> = new Set()): FileReader {
  return (filename) => {
    if (missing.has(filename)) {
      return Promise.reject(new Error(filename));
    }
    return Promise.resolve(contentFor(filename));
  };
}

function contentFor(filename: string): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(JSON.stringify({ name: filename }));
}

async function shortSha(data: Uint8Array<ArrayBuffer>): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', data);
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return hex.slice(0, 12);
}

async function gunzip(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  const stream = new Response(data).body!.pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

describe('uploadOparlSnapshot', () => {
  it('uploads one blob per file plus the manifest', async () => {
    const calls: PutInput[] = [];

    await uploadOparlSnapshot(DIR, BUCKET, PREFIX, recordingSend(calls), fakeReader(), fakeMetadata(null));

    expect(calls.length).toEqual(OPARL_SNAPSHOT_FILENAMES.length + 1);
    expect(calls.every((input) => input.Bucket === BUCKET)).toEqual(true);
  });

  it('sets immutable cache headers and gzip encoding on blobs', async () => {
    const calls: PutInput[] = [];

    await uploadOparlSnapshot(DIR, BUCKET, PREFIX, recordingSend(calls), fakeReader(), fakeMetadata(null));

    const blobPuts = calls.filter((input) => input.Key !== `${PREFIX}/manifest.json`);
    expect(blobPuts.length).toEqual(OPARL_SNAPSHOT_FILENAMES.length);
    for (const input of blobPuts) {
      expect(input.ContentEncoding).toEqual('gzip');
      expect(input.ContentType).toEqual('application/json');
      expect(input.CacheControl).toEqual('public, max-age=31536000, immutable');
      expect(input.Key!).toMatch(new RegExp(`^${PREFIX}/[a-z-]+\\.[0-9a-f]{12}\\.json\\.gz$`));
    }
  });

  it('writes a short-lived manifest referencing every blob with its hash and size', async () => {
    const calls: PutInput[] = [];

    const manifest = await uploadOparlSnapshot(
      DIR,
      BUCKET,
      PREFIX,
      recordingSend(calls),
      fakeReader(),
      fakeMetadata(null),
    );

    const manifestPut = calls.find((input) => input.Key === `${PREFIX}/manifest.json`);
    if (!manifestPut) throw new Error('manifest was not uploaded');
    expect(manifestPut.CacheControl).toEqual('public, max-age=60');
    expect(manifestPut.ContentEncoding).toEqual(undefined);

    const uploaded = JSON.parse(new TextDecoder().decode(manifestPut.Body as Uint8Array));
    expect(uploaded).toEqual(manifest);
    expect(Object.keys(manifest.files).sort()).toEqual([...OPARL_SNAPSHOT_FILENAMES].sort());

    for (const filename of OPARL_SNAPSHOT_FILENAMES) {
      const entry = manifest.files[filename];
      const raw = contentFor(filename);
      expect(entry.bytes).toEqual(raw.length);
      expect(entry.sha).toEqual(await shortSha(raw));
      expect(entry.blob).toEqual(`${filename.replace(/\.json$/, '')}.${entry.sha}.json.gz`);
    }
  });

  it('records lastSync from the metadata reader, and omits it when none exists', async () => {
    const withTimestamp: PutInput[] = [];
    const stamp = '2026-06-28T12:34:56.000Z';
    const withManifest = await uploadOparlSnapshot(
      DIR,
      BUCKET,
      PREFIX,
      recordingSend(withTimestamp),
      fakeReader(),
      fakeMetadata(stamp),
    );
    expect(withManifest.lastSync).toEqual(stamp);

    const withoutTimestamp: PutInput[] = [];
    const withoutManifest = await uploadOparlSnapshot(
      DIR,
      BUCKET,
      PREFIX,
      recordingSend(withoutTimestamp),
      fakeReader(),
      fakeMetadata(null),
    );
    expect('lastSync' in withoutManifest).toEqual(false);
  });

  it('uploads gzipped bodies that decompress to the original file', async () => {
    const calls: PutInput[] = [];

    await uploadOparlSnapshot(DIR, BUCKET, PREFIX, recordingSend(calls), fakeReader(), fakeMetadata(null));

    const meetingsPut = calls.find((input) => input.Key?.startsWith(`${PREFIX}/meetings.`));
    if (!meetingsPut) throw new Error('meetings blob was not uploaded');

    const decompressed = new TextDecoder().decode(await gunzip(meetingsPut.Body as Uint8Array<ArrayBuffer>));
    expect(decompressed).toEqual(JSON.stringify({ name: 'meetings.json' }));
  });

  it('throws without uploading anything when a file is missing', async () => {
    const calls: PutInput[] = [];

    await expect(
      uploadOparlSnapshot(
        DIR,
        BUCKET,
        PREFIX,
        recordingSend(calls),
        fakeReader(new Set(['papers.json'])),
        fakeMetadata(null),
      ),
    ).rejects.toThrow();

    expect(calls.length).toEqual(0);
  });
});
