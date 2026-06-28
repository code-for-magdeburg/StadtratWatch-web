import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { Readable } from 'node:stream';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  NEEDED_FILES,
  shortShaOfFile,
  syncOparlSnapshot,
} from './fetch-oparl.lib.mjs';

const BASE_URL = 'https://cdn.example.test';
const PREFIX = 'oparl';
const MANIFEST_FILENAME = 'manifest.json';

let dir;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'fetch-oparl-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

function shortSha(buffer) {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 12);
}

/**
 * Builds an in-memory "remote": a manifest plus blob bodies keyed by blob filename. Bodies are the
 * plain JSON, matching what the HTTP client yields after transparently decoding `Content-Encoding:
 * gzip` (the fetch side never gunzips itself).
 */
function makeRemote(files, { lastSync } = {}) {
  const fileEntries = {};
  const blobs = {};
  for (const [filename, content] of Object.entries(files)) {
    const data = Buffer.from(content);
    const sha = shortSha(data);
    const blob = `${filename.replace(/\.json$/, '')}.${sha}.json.gz`;
    fileEntries[filename] = { blob, sha, bytes: data.length };
    blobs[blob] = data;
  }
  const manifest = lastSync
    ? { lastSync, files: fileEntries }
    : { files: fileEntries };
  return { manifest, blobs };
}

/** A fetch double serving the given remote; `failManifest` simulates the manifest being unreachable. */
function makeFetch(remote, { failManifest = false } = {}) {
  return vi.fn(async (url) => {
    if (url.endsWith(`/${MANIFEST_FILENAME}`)) {
      if (failManifest)
        return { ok: false, status: 503, statusText: 'Service Unavailable' };
      return { ok: true, status: 200, json: async () => remote.manifest };
    }
    const blobName = url.split('/').pop();
    const buffer = remote.blobs[blobName];
    if (!buffer) return { ok: false, status: 404, statusText: 'Not Found' };
    return {
      ok: true,
      status: 200,
      body: Readable.toWeb(Readable.from(buffer)),
    };
  });
}

/** Content for all six needed files, so a full remote is easy to assemble. */
function fullContent(overrides = {}) {
  const content = {};
  for (const filename of NEEDED_FILES) {
    content[filename] = JSON.stringify([{ file: filename }]);
  }
  return { ...content, ...overrides };
}

async function writeLocal(content, { skip = [] } = {}) {
  for (const [filename, value] of Object.entries(content)) {
    if (skip.includes(filename)) continue;
    await writeFile(path.join(dir, filename), value);
  }
}

function silentLog() {
  return { log: vi.fn(), warn: vi.fn() };
}

describe('shortShaOfFile', () => {
  it('matches the publisher formula (sha-256, first 12 hex of the bytes)', async () => {
    const file = path.join(dir, 'meetings.json');
    const data = Buffer.from('[{"id":1}]');
    await writeFile(file, data);
    expect(await shortShaOfFile(file)).toBe(shortSha(data));
  });
});

describe('syncOparlSnapshot', () => {
  it('downloads nothing when every local file already matches the manifest', async () => {
    const content = fullContent();
    await writeLocal(content);
    const fetchFn = makeFetch(makeRemote(content));

    const result = await syncOparlSnapshot({
      baseUrl: BASE_URL,
      dir,
      prefix: PREFIX,
      fetchFn,
      log: silentLog(),
    });

    expect(result.downloaded).toEqual([]);
    expect(result.upToDate).toHaveLength(NEEDED_FILES.length);
    // Only the manifest is fetched; no blob requests.
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('downloads a file whose hash changed', async () => {
    await writeLocal(fullContent());
    const remoteContent = fullContent({
      'papers.json': JSON.stringify([{ updated: true }]),
    });
    const fetchFn = makeFetch(makeRemote(remoteContent));

    const result = await syncOparlSnapshot({
      baseUrl: BASE_URL,
      dir,
      prefix: PREFIX,
      fetchFn,
      log: silentLog(),
    });

    expect(result.downloaded).toEqual(['papers.json']);
    expect(await readFile(path.join(dir, 'papers.json'), 'utf8')).toBe(
      remoteContent['papers.json'],
    );
  });

  it('downloads a file that is missing locally', async () => {
    const content = fullContent();
    await writeLocal(content, { skip: ['files.json'] });
    const fetchFn = makeFetch(makeRemote(content));

    const result = await syncOparlSnapshot({
      baseUrl: BASE_URL,
      dir,
      prefix: PREFIX,
      fetchFn,
      log: silentLog(),
    });

    expect(result.downloaded).toEqual(['files.json']);
    expect(await readFile(path.join(dir, 'files.json'), 'utf8')).toBe(
      content['files.json'],
    );
  });

  it('warns and keeps local files when the manifest is unreachable but all files exist', async () => {
    const content = fullContent();
    await writeLocal(content);
    const fetchFn = makeFetch(makeRemote(content), { failManifest: true });
    const log = silentLog();

    const result = await syncOparlSnapshot({
      baseUrl: BASE_URL,
      dir,
      prefix: PREFIX,
      fetchFn,
      log,
    });

    expect(result.downloaded).toEqual([]);
    expect(log.warn).toHaveBeenCalledOnce();
  });

  it('restores scraper-metadata.txt from the manifest lastSync', async () => {
    const content = fullContent();
    await writeLocal(content);
    const lastSync = '2026-06-28T12:34:56.000Z';
    const fetchFn = makeFetch(makeRemote(content, { lastSync }));

    await syncOparlSnapshot({
      baseUrl: BASE_URL,
      dir,
      prefix: PREFIX,
      fetchFn,
      log: silentLog(),
    });

    expect(await readFile(path.join(dir, 'scraper-metadata.txt'), 'utf8')).toBe(
      lastSync,
    );
  });

  it('does not write scraper-metadata.txt when the manifest has no lastSync', async () => {
    const content = fullContent();
    await writeLocal(content);
    const fetchFn = makeFetch(makeRemote(content));

    await syncOparlSnapshot({
      baseUrl: BASE_URL,
      dir,
      prefix: PREFIX,
      fetchFn,
      log: silentLog(),
    });

    await expect(
      readFile(path.join(dir, 'scraper-metadata.txt'), 'utf8'),
    ).rejects.toThrow();
  });

  it('throws when the manifest is unreachable and a required file is missing', async () => {
    const content = fullContent();
    await writeLocal(content, { skip: ['organizations.json'] });
    const fetchFn = makeFetch(makeRemote(content), { failManifest: true });

    await expect(
      syncOparlSnapshot({
        baseUrl: BASE_URL,
        dir,
        prefix: PREFIX,
        fetchFn,
        log: silentLog(),
      }),
    ).rejects.toThrow(/missing locally: organizations\.json/);
  });
});
