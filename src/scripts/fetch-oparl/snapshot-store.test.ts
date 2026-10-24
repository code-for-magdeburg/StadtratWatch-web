import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { SCRAPER_METADATA_FILENAME, shortSnapshotSha } from '../shared/oparl/oparl-snapshot.ts';
import { createFileSnapshotStore } from './snapshot-store.ts';

function bodyOf(text: string): ReadableStream<Uint8Array> {
  return new Response(text).body!;
}

describe('createFileSnapshotStore', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'fetch-oparl-store-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true });
  });

  it('creates the target directory on ensureReady', async () => {
    const nested = path.join(dir, 'a', 'b');
    await createFileSnapshotStore(nested).ensureReady();

    expect((await stat(nested)).isDirectory()).toEqual(true);
  });

  it('reports null for a missing file and the short sha for a present one', async () => {
    const content = '[{"id":1}]';
    await Bun.write(path.join(dir, 'papers.json'), content);

    const shas = await createFileSnapshotStore(dir).readLocalShas();

    expect(shas.get('papers.json')).toEqual(await shortSnapshotSha(new TextEncoder().encode(content)));
    expect(shas.get('meetings.json')).toEqual(null);
  });

  it('writes a blob body to its file and leaves no temp file behind', async () => {
    const store = createFileSnapshotStore(dir);
    await store.ensureReady();

    await store.writeBlob('meetings.json', bodyOf('[{"meeting":1}]'));

    expect(await Bun.file(path.join(dir, 'meetings.json')).text()).toEqual('[{"meeting":1}]');
    expect(await Bun.file(path.join(dir, 'meetings.json.tmp')).exists()).toEqual(false);
  });

  it('writes the scraper metadata file', async () => {
    const store = createFileSnapshotStore(dir);
    await store.ensureReady();

    await store.writeScraperMetadata('2026-06-28T12:34:56.000Z');

    expect(await Bun.file(path.join(dir, SCRAPER_METADATA_FILENAME)).text()).toEqual('2026-06-28T12:34:56.000Z');
  });

  it('promotes a complete staged snapshot without changing the current snapshot first', async () => {
    await Bun.write(path.join(dir, 'meetings.json'), '[{"generation":"old"}]');
    const store = createFileSnapshotStore(dir);
    const stagedSnapshot = await store.createStagingSnapshot();

    await stagedSnapshot.store.writeBlob('meetings.json', bodyOf('[{"generation":"new"}]'));

    expect(await Bun.file(path.join(dir, 'meetings.json')).text()).toEqual('[{"generation":"old"}]');

    await stagedSnapshot.commit();

    expect(await Bun.file(path.join(dir, 'meetings.json')).text()).toEqual('[{"generation":"new"}]');
  });
});
