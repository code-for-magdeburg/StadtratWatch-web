import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, rename, stat, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

/** Local file the scraper reads to resume an incremental run; restored from `manifest.lastSync`. */
const METADATA_FILENAME = 'scraper-metadata.txt';

/**
 * Every OParl snapshot file the scraper publishes.
 */
export const NEEDED_FILES = [
  'organizations.json',
  'persons.json',
  'meetings.json',
  'papers.json',
  'memberships.json',
  'locations.json',
  'agenda-items.json',
  'consultations.json',
  'files.json',
];

const MANIFEST_FILENAME = 'manifest.json';

/** Length of the short SHA recorded in the manifest. Must match the scrape-oparl publisher. */
const SHA_LENGTH = 12;

/**
 * @typedef {{ blob: string, sha: string, bytes: number }} ManifestEntry
 * @typedef {{ lastSync?: string, files: Record<string, ManifestEntry> }} Manifest
 * @typedef {{ log: (msg: string) => void, warn: (msg: string) => void }} Logger
 */

/**
 * First 12 hex chars of the SHA-256 of a local file's bytes. Matches `shortSha` in
 * `scrape-oparl/oparl-s3-publisher.ts` (hash of the uncompressed JSON), so a local file that came
 * from a given blob produces the manifest's recorded sha.
 *
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export async function shortShaOfFile(filePath) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk);
  }
  return hash.digest('hex').slice(0, SHA_LENGTH);
}

/**
 * Mirrors the remote OParl snapshot into `dir`, downloading only the files whose local hash differs
 * from the manifest (or that are missing). Idempotent: if everything matches it does nothing.
 *
 * Resilience: missing local files are a hard requirement, so a failed manifest fetch throws when any
 * needed file is absent. If the manifest is unreachable but every file already exists locally, it
 * warns and keeps the local copy so offline dev/builds keep working.
 *
 * @param {{ baseUrl: string, dir: string, prefix?: string, fetchFn?: typeof fetch, log?: Logger }} options
 * @returns {Promise<{ downloaded: string[], upToDate: string[] }>}
 */
export async function syncOparlSnapshot({
  baseUrl,
  dir,
  prefix = 'oparl',
  fetchFn = fetch,
  log = console,
}) {
  const base = baseUrl.replace(/\/+$/, '');
  await mkdir(dir, { recursive: true });

  const localShas = await readLocalShas(dir);

  let manifest;
  try {
    manifest = await fetchManifest(base, prefix, fetchFn);
  } catch (error) {
    const missing = NEEDED_FILES.filter(
      (filename) => localShas[filename] === null,
    );
    if (missing.length > 0) {
      throw new Error(
        `Cannot fetch the OParl manifest and these required files are missing locally: ${missing.join(', ')}. ` +
          `Original error: ${errorMessage(error)}`,
      );
    }
    log.warn(
      `OParl manifest unavailable (${errorMessage(error)}); using the existing local snapshot.`,
    );
    return { downloaded: [], upToDate: [...NEEDED_FILES] };
  }

  const files = manifest.files;
  const downloaded = [];
  const upToDate = [];
  for (const filename of NEEDED_FILES) {
    const entry = files[filename];
    const localSha = localShas[filename];

    if (!entry) {
      if (localSha === null) {
        throw new Error(
          `Required file ${filename} is absent from the manifest and missing locally.`,
        );
      }
      log.warn(
        `File ${filename} is absent from the manifest; keeping the local copy.`,
      );
      upToDate.push(filename);
      continue;
    }

    if (localSha === entry.sha) {
      upToDate.push(filename);
      continue;
    }

    log.log(`Fetching ${filename} (${entry.blob})...`);
    await downloadBlob(
      base,
      prefix,
      entry.blob,
      path.join(dir, filename),
      fetchFn,
    );
    downloaded.push(filename);
  }

  // Restore the last-sync timestamp locally so an incremental scrape on this machine resumes from
  // the last published snapshot. The scraper reads it via ScraperMetadataFileStore (unchanged).
  if (typeof manifest.lastSync === 'string' && manifest.lastSync.length > 0) {
    await writeFile(path.join(dir, METADATA_FILENAME), manifest.lastSync);
  }

  if (downloaded.length === 0) {
    log.log(`OParl snapshot up to date (${upToDate.length} files).`);
  } else {
    log.log(
      `OParl snapshot updated: downloaded ${downloaded.length}, unchanged ${upToDate.length}.`,
    );
  }
  return { downloaded, upToDate };
}

/**
 * @param {string} dir
 * @returns {Promise<Record<string, string | null>>} sha per file, or null if the file is missing
 */
async function readLocalShas(dir) {
  const result = {};
  for (const filename of NEEDED_FILES) {
    const filePath = path.join(dir, filename);
    try {
      await stat(filePath);
      result[filename] = await shortShaOfFile(filePath);
    } catch {
      result[filename] = null;
    }
  }
  return result;
}

/**
 * @param {string} base
 * @param {string} prefix
 * @param {typeof fetch} fetchFn
 * @returns {Promise<Manifest>}
 */
async function fetchManifest(base, prefix, fetchFn) {
  const url = `${base}/${prefix}/${MANIFEST_FILENAME}`;
  const res = await fetchFn(url);
  if (!res.ok) {
    throw new Error(
      `manifest request returned ${res.status} ${res.statusText} (${url})`,
    );
  }
  return /** @type {Manifest} */ (await res.json());
}

/**
 * Streams a blob to disk, then atomically renames it into place so an interrupted download never
 * leaves a corrupt file that a later run would treat as valid.
 *
 * The blobs are stored with `Content-Encoding: gzip` (set by the scrape-oparl publisher), so the
 * HTTP client decompresses the body transparently — we write the plain JSON it yields and must not
 * gunzip again.
 *
 * @param {string} base
 * @param {string} prefix
 * @param {string} blob
 * @param {string} destPath
 * @param {typeof fetch} fetchFn
 */
async function downloadBlob(base, prefix, blob, destPath, fetchFn) {
  const url = `${base}/${prefix}/${blob}`;
  const res = await fetchFn(url);
  if (!res.ok || !res.body) {
    throw new Error(
      `blob request returned ${res.status} ${res.statusText} (${url})`,
    );
  }
  const tmpPath = `${destPath}.tmp`;
  await pipeline(Readable.fromWeb(res.body), createWriteStream(tmpPath));
  await rename(tmpPath, destPath);
}

/** @param {unknown} error */
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
