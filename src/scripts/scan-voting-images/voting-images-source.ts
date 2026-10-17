import * as path from 'node:path';
import { readdirSync, readFileSync } from 'node:fs';
import { decode } from 'fast-png';

export type PixelMatrix = {
  width: number;
  channels: number;
  data: ArrayLike<number>;
};

export interface IVotingImagesSource {
  getVotingImagesFilenames(): string[];
  getFilepath(votingFilename: string): string;
  loadVotingImage(votingFilepath: string): PixelMatrix;
}

export class VotingImagesSource implements IVotingImagesSource {
  constructor(private readonly directory: string) {
  }

  public getVotingImagesFilenames(): string[] {
    return readdirSync(this.directory, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .filter((entry) => entry.name.endsWith('.png'))
      .map((entry) => entry.name);
  }

  public getFilepath(votingFilename: string): string {
    return path.join(this.directory, votingFilename);
  }

  public loadVotingImage(filePath: string): PixelMatrix {
    // Decode without color management: canvas libraries convert the Display-P3 screenshots to sRGB,
    // which made a test run misread 63% of abstentions as votes against.
    const image = decode(readFileSync(filePath));
    if (image.depth !== 8 || image.palette || image.channels < 3) {
      throw new Error(`Voting image "${filePath}" must be an 8-bit RGB or RGBA PNG.`);
    }

    return { width: image.width, channels: image.channels, data: image.data };
  }
}
