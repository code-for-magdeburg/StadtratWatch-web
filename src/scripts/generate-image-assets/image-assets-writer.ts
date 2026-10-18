import * as path from 'node:path';
import { mkdir } from 'node:fs/promises';
import type { GeneratedVotingImage } from './images-generator.ts';

export class ImageAssetsWriter {
  private readonly votingsImagesOutputDir: string;

  constructor(private readonly outputDir: string) {
    this.votingsImagesOutputDir = path.join(this.outputDir, 'images', 'votings');
  }

  public async writeImageAssets(votingImages: GeneratedVotingImage[]): Promise<void> {
    await mkdir(this.votingsImagesOutputDir, { recursive: true });
    await this.writeVotingImagesFiles(votingImages);
  }

  private async writeVotingImagesFiles(votingImages: GeneratedVotingImage[]): Promise<void> {
    console.log('Writing votings images...');

    for (const { sessionId, votingId, canvas } of votingImages) {
      const filename = `${sessionId}-${votingId.toString().padStart(3, '0')}.png`;
      await Bun.write(path.join(this.votingsImagesOutputDir, sessionId, filename), canvas.toBuffer('image/png'));
    }
  }
}
