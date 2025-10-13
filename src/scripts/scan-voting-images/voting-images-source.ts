import * as path from '@std/path';
import { CanvasRenderingContext2D, createCanvas, Image } from '@gfx/canvas';

export interface IVotingImagesSource {
  getVotingImagesFilenames(): string[];
  getFilepath(votingFilename: string): string;
  loadVotingImage(votingFilepath: string): CanvasRenderingContext2D;
}

export class VotingImagesSource implements IVotingImagesSource {
  constructor(private readonly directory: string) {
  }

  public getVotingImagesFilenames(): string[] {
    return Array
      .from(Deno.readDirSync(this.directory))
      .filter((entry) => entry.isFile)
      .filter((entry) => entry.name.endsWith('.png'))
      .map((entry) => entry.name);
  }

  public getFilepath(votingFilename: string): string {
    return path.join(this.directory, votingFilename);
  }

  public loadVotingImage(filePath: string): CanvasRenderingContext2D {
    const image = Image.loadSync(filePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    return ctx;
  }
}
