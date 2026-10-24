import { cp, mkdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';

import {
  OPARL_SNAPSHOT_FILENAMES,
  SCRAPER_METADATA_FILENAME,
  shortSnapshotSha,
} from '../shared/oparl/oparl-snapshot.ts';

/** Short SHA per snapshot file present on disk; `null` for a file that is missing. */
export type LocalShas = Map<string, string | null>;

/** The local end of the mirror: the directory the snapshot is materialised into. */
export type SnapshotStore = {
  ensureReady(): Promise<void>;
  readLocalShas(): Promise<LocalShas>;
  writeBlob(filename: string, body: ReadableStream<Uint8Array>): Promise<void>;
  writeScraperMetadata(lastSync: string): Promise<void>;
  createStagingSnapshot(): Promise<StagedSnapshot>;
};

/** An isolated candidate generation that can be promoted only once it is complete. */
export type StagedSnapshot = {
  store: SnapshotStore;
  commit(): Promise<void>;
  discard(): Promise<void>;
};

/** Snapshot store backed by a directory on the local filesystem. */
export function createFileSnapshotStore(directory: string): SnapshotStore {
  const pathTo = (filename: string) => path.join(directory, filename);

  return {
    async ensureReady() {
      await mkdir(directory, { recursive: true });
    },

    async readLocalShas() {
      const shas: LocalShas = new Map();
      for (const filename of OPARL_SNAPSHOT_FILENAMES) {
        shas.set(filename, await readShaIfExists(pathTo(filename)));
      }
      return shas;
    },

    // Streams to a temp file, then atomically renames, so an interrupted download never leaves a
    // corrupt file that a later run would trust as valid.
    async writeBlob(filename, body) {
      const destPath = pathTo(filename);
      const tmpPath = `${destPath}.tmp`;
      await Bun.write(tmpPath, new Response(body));
      await rename(tmpPath, destPath);
    },

    async writeScraperMetadata(lastSync) {
      await Bun.write(pathTo(SCRAPER_METADATA_FILENAME), lastSync);
    },

    async createStagingSnapshot() {
      const stagingDirectory = `${directory}.staging-${crypto.randomUUID()}`;
      await cp(directory, stagingDirectory, { recursive: true });

      return {
        store: createFileSnapshotStore(stagingDirectory),
        async commit() {
          const previousDirectory = `${directory}.previous-${crypto.randomUUID()}`;
          await rename(directory, previousDirectory);
          try {
            await rename(stagingDirectory, directory);
          } catch (error) {
            await rename(previousDirectory, directory);
            throw error;
          }
          await rm(previousDirectory, { recursive: true }).catch(() => {});
        },
        async discard() {
          await rm(stagingDirectory, { recursive: true, force: true });
        },
      };
    },
  };
}

async function readShaIfExists(filePath: string): Promise<string | null> {
  try {
    return await shortSnapshotSha(await Bun.file(filePath).bytes());
  } catch (error) {
    if (isFileNotFound(error)) {
      return null;
    }
    throw error;
  }
}

function isFileNotFound(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === 'ENOENT';
}
