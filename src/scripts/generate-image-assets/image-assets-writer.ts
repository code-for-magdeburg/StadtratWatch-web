import * as fs from '@std/fs';
import * as path from '@std/path';
import { decodeBase64 } from '@std/encoding';
import { type GeneratedVotingImage } from './images-generator.ts';

export class ImageAssetsWriter {
  private readonly votingsImagesOutputDir: string;

  constructor(private readonly outputDir: string) {
    this.votingsImagesOutputDir = path.join(this.outputDir, 'images', 'votings');
    this.ensureOutputDirsExists();
  }

  public writeImageAssets(votingImages: GeneratedVotingImage[]) {
    this.writeVotingImagesFiles(votingImages);
  }

  private writeVotingImagesFiles(votingImages: GeneratedVotingImage[]) {
    console.log('Writing votings images...');

    votingImages.forEach((votingImage) => {
      const { sessionId, votingId, canvas } = votingImage;

      const sessionOutputDir = path.join(this.votingsImagesOutputDir, sessionId);
      fs.ensureDirSync(sessionOutputDir);

      const imageBase64Encoded = canvas.toDataURL().replace(/^data:image\/png;base64,/, '');
      const image = decodeBase64(imageBase64Encoded);
      const filename = `${sessionId}-${votingId.toString().padStart(3, '0')}.png`;
      Deno.writeFileSync(path.join(sessionOutputDir, filename), image);
    });
  }

  private ensureOutputDirsExists() {
    fs.ensureDirSync(this.outputDir);
    fs.ensureDirSync(this.votingsImagesOutputDir);
  }
}
