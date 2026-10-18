import { ImageAssetsWriter } from './image-assets-writer.ts';
import type { GeneratedVotingImage } from './images-generator.ts';
import { createCanvas } from '@napi-rs/canvas';
import { decode } from 'fast-png';
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';

function redVotingImage(sessionId: string, votingId: number): GeneratedVotingImage {
  const canvas = createCanvas(4, 2);
  const context = canvas.getContext('2d');
  context.fillStyle = '#FF0000';
  context.fillRect(0, 0, 4, 2);
  return { sessionId, votingId, canvas };
}

describe('ImageAssetsWriter', () => {
  let outputDir: string;

  beforeEach(async () => {
    outputDir = await mkdtemp(path.join(tmpdir(), 'generate-image-assets-writer-'));
  });

  afterEach(async () => {
    await rm(outputDir, { recursive: true });
  });

  it('writes each voting image as a PNG named after its session and zero-padded voting id', async () => {
    const writer = new ImageAssetsWriter(outputDir);

    await writer.writeImageAssets([redVotingImage('2024-07-08', 7), redVotingImage('2024-08-15', 123)]);

    const firstImage = decode(
      await Bun.file(path.join(outputDir, 'images/votings/2024-07-08/2024-07-08-007.png')).bytes(),
    );
    expect([firstImage.width, firstImage.height]).toEqual([4, 2]);
    expect([...firstImage.data.slice(0, 4)]).toEqual([255, 0, 0, 255]);
    expect(await Bun.file(path.join(outputDir, 'images/votings/2024-08-15/2024-08-15-123.png')).exists()).toBe(true);
  });
});
