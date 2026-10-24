import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';

import type { LocalAsset, RemoteObject, WebAssetOperations, WebAssetTarget } from '../shared/web-asset-publisher.ts';
import { publishAndVerifyImageAssets } from './push.ts';

const TARGET: WebAssetTarget = {
  bucket: 'test-bucket',
  prefix: `web-assets/parliament-periods/magdeburg-8`,
  distributionId: 'DIST123',
};

function keyOf(sessionId: string, votingId: string): string {
  return `${TARGET.prefix}/images/votings/${sessionId}/${sessionId}-${votingId}.png`;
}

function image(sessionId: string, votingId: string, content: string): LocalAsset {
  return {
    key: keyOf(sessionId, votingId),
    body: new TextEncoder().encode(content) as Uint8Array<ArrayBuffer>,
  };
}

/**
 * Operations backed by an in-memory inventory: `send` and `deleteKeys` mutate it and `list` reflects
 * those mutations, so the post-publish verify observes the state the publish produced - which is what
 * makes the silent-failure test meaningful. Tests wrap individual methods with `spyOn` to assert calls,
 * or replace one's implementation to simulate a failure.
 */
function imageAssetsOperations(remote: RemoteObject[]): WebAssetOperations {
  const inventory = new Map(remote.map((object) => [object.key, object]));
  return {
    list: () => Promise.resolve([...inventory.values()]),
    send: (input) => {
      inventory.set(input.Key!, { key: input.Key!, etag: 'some etag' });
      return Promise.resolve({});
    },
    deleteKeys: (_bucket, keys) => {
      keys.forEach((key) => inventory.delete(key));
      return Promise.resolve({});
    },
    invalidate: () => Promise.resolve({}),
  };
}

describe('publishAndVerifyImageAssets', () => {
  afterEach(() => mock.restore());

  it('uploads the generated images under the period prefix, preserving the nested votings tree', async () => {
    const assets = [image('2024-01-01', '000', 'first'), image('2024-01-01', '001', 'second')];
    const operations = imageAssetsOperations([]);
    const sendSpy = spyOn(operations, 'send');

    const plan = await publishAndVerifyImageAssets(assets, TARGET, operations);

    expect(plan.uploads).toEqual([keyOf('2024-01-01', '000'), keyOf('2024-01-01', '001')]);
    expect(sendSpy).toHaveBeenCalledTimes(2);
    expect(sendSpy.mock.calls.map(([input]) => input.Key)).toEqual([
      keyOf('2024-01-01', '000'),
      keyOf('2024-01-01', '001'),
    ]);
  });

  it('prunes a remote orphan the run no longer produces', async () => {
    const assets = [image('2024-01-01', '000', 'first')];
    const orphan = keyOf('2024-01-01', '009');
    const operations = imageAssetsOperations([{ key: orphan, etag: 'some etag' }]);
    const deleteSpy = spyOn(operations, 'deleteKeys');

    const plan = await publishAndVerifyImageAssets(assets, TARGET, operations);

    expect(plan.deletes).toEqual([orphan]);
    expect(deleteSpy).toHaveBeenNthCalledWith(1, TARGET.bucket, [orphan]);
  });

  it('mutates nothing on a dry run', async () => {
    const assets = [image('2024-01-01', '000', 'first')];
    const operations = imageAssetsOperations([]);
    const sendSpy = spyOn(operations, 'send');
    const deleteSpy = spyOn(operations, 'deleteKeys');
    const invalidateSpy = spyOn(operations, 'invalidate');

    const plan = await publishAndVerifyImageAssets(assets, TARGET, operations, { dryRun: true });

    expect(plan.uploads).toEqual([keyOf('2024-01-01', '000')]);
    expect(sendSpy).toHaveBeenCalledTimes(0);
    expect(deleteSpy).toHaveBeenCalledTimes(0);
    expect(invalidateSpy).toHaveBeenCalledTimes(0);
  });

  it('throws when the remote prefix does not end up matching the produced images', async () => {
    const assets = [image('2024-01-01', '000', 'first')];
    const operations = imageAssetsOperations([]);
    spyOn(operations, 'send').mockImplementation(() => Promise.resolve({}));

    await expect(publishAndVerifyImageAssets(assets, TARGET, operations)).rejects.toThrow('verification failed');
  });
});
