import { type PutObjectCommandInput } from '@aws-sdk/client-s3';
import * as path from '@std/path';
import { type ScrapeOparlPushEnv } from './env.ts';
import { OPARL_FILENAMES } from './oparl-filenames.ts';

const BLOB_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const MANIFEST_CACHE_CONTROL = 'public, max-age=60';
const MANIFEST_FILENAME = 'manifest.json';
/** Mirrors the file `ScraperMetadataFileStore` writes; carried in the manifest, not as a blob. */
const METADATA_FILENAME = 'scraper-metadata.txt';

export type OparlManifestEntry = {
  /** Object key (relative to the prefix), e.g. `meetings.<sha>.json.gz`. */
  blob: string;
  /** Short SHA-256 of the uncompressed JSON. */
  sha: string;
  /** Uncompressed byte size. */
  bytes: number;
};

export type OparlManifest = {
  /**
   * ISO timestamp of the last successful scrape, taken from the local `scraper-metadata.txt`.
   * Absent when no such file exists at push time. `fetch-oparl` restores it locally so an
   * incremental scrape on another machine resumes from the last published snapshot.
   */
  lastSync?: string;
  /** One entry per snapshot file, keyed by filename. */
  files: Record<string, OparlManifestEntry>;
};

/**
 * Sends a single S3 put given its input. Abstracted so tests can inject a fake, and so the (heavy)
 * AWS SDK is only loaded by the real implementation — importing this module stays side-effect free.
 */
export type S3Send = (input: PutObjectCommandInput) => Promise<unknown>;

/** Reads a snapshot file's raw bytes by filename. Injectable so tests need no filesystem access. */
export type FileReader = (filename: string) => Promise<Uint8Array<ArrayBuffer>>;

/** Reads the last-sync timestamp, or null if none exists. Injectable for tests. */
export type MetadataReader = () => Promise<string | null>;

/**
 * Uploads the local OParl snapshot to S3: one gzipped, content-hashed blob per file plus a small
 * `manifest.json` that also carries the last-sync timestamp. All files are read, hashed and gzipped
 * up front, so a missing file fails before any object is uploaded (no partial snapshot). Returns the
 * manifest that was written.
 */
export async function uploadOparlSnapshot(
  directory: string,
  bucket: string,
  prefix: string,
  send: S3Send,
  readFile: FileReader = (filename) => Deno.readFile(path.join(directory, filename)),
  readMetadata: MetadataReader = () => readLastSync(directory),
): Promise<OparlManifest> {
  const blobs = await prepareBlobs(prefix, readFile);
  const lastSync = await readMetadata();

  for (const blob of blobs) {
    await send({
      Bucket: bucket,
      Key: blob.key,
      Body: blob.body,
      ContentType: 'application/json',
      ContentEncoding: 'gzip',
      CacheControl: BLOB_CACHE_CONTROL,
    });
    console.log(`Uploaded ${blob.key} (${blob.bytes} bytes uncompressed, ${blob.body.length} gzipped).`);
  }

  const manifest = buildManifest(blobs, lastSync);
  const manifestKey = `${prefix}/${MANIFEST_FILENAME}`;
  await send({
    Bucket: bucket,
    Key: manifestKey,
    Body: new TextEncoder().encode(JSON.stringify(manifest, null, 2)),
    ContentType: 'application/json',
    CacheControl: MANIFEST_CACHE_CONTROL,
  });
  console.log(
    `Uploaded ${manifestKey} (${OPARL_FILENAMES.length} entries, lastSync ${lastSync ?? 'none'}).`,
  );

  return manifest;
}

/** Reads `<directory>/scraper-metadata.txt`, trimmed; null if absent, empty or unreadable. */
async function readLastSync(directory: string): Promise<string | null> {
  try {
    const text = (await Deno.readTextFile(path.join(directory, METADATA_FILENAME))).trim();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

/** Builds an S3 client from env and uploads the snapshot. */
export async function publishOparlSnapshot(directory: string, env: ScrapeOparlPushEnv): Promise<void> {
  const { PutObjectCommand, S3Client } = await import('@aws-sdk/client-s3');
  const client = new S3Client({
    region: env.region,
    credentials: { accessKeyId: env.accessKeyId, secretAccessKey: env.secretAccessKey },
  });
  await uploadOparlSnapshot(directory, env.bucket, env.prefix, (input) => client.send(new PutObjectCommand(input)));
}

type PreparedBlob = {
  filename: string;
  blob: string;
  key: string;
  sha: string;
  bytes: number;
  body: Uint8Array;
};

async function prepareBlobs(prefix: string, readFile: FileReader): Promise<PreparedBlob[]> {
  const blobs: PreparedBlob[] = [];

  for (const filename of OPARL_FILENAMES) {
    const data = await readFile(filename);
    const sha = await shortSha(data);
    const body = await gzip(data);
    const base = filename.replace(/\.json$/, '');
    const blob = `${base}.${sha}.json.gz`;

    blobs.push({
      filename,
      blob,
      key: `${prefix}/${blob}`,
      sha,
      bytes: data.length,
      body,
    });
  }

  return blobs;
}

function buildManifest(blobs: PreparedBlob[], lastSync: string | null): OparlManifest {
  const files: Record<string, OparlManifestEntry> = {};
  for (const blob of blobs) {
    files[blob.filename] = { blob: blob.blob, sha: blob.sha, bytes: blob.bytes };
  }
  return lastSync ? { lastSync, files } : { files };
}

/** First 12 hex chars of the SHA-256 of the uncompressed bytes (gzip determinism is irrelevant). */
async function shortSha(data: Uint8Array<ArrayBuffer>): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', data);
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return hex.slice(0, 12);
}

async function gzip(data: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  const compressed = new Response(data).body!.pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(compressed).arrayBuffer());
}
