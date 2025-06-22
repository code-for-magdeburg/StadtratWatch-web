import { SessionConfig, SessionConfigLayout, SessionConfigPerson } from '@srw-astro/models/session-config';
import { IVotingImagesSource } from './voting-images-source.ts';
import { SessionVote } from '@srw-astro/models/session-scan';
import { CanvasRenderingContext2D } from '@gfx/canvas';
import { VoteResult } from '@srw-astro/models/session';


type CategorizedColor = 'red' | 'green' | 'yellow' | 'white' | 'unknown';
type VoteCode = VoteResult.VOTE_FOR | VoteResult.VOTE_AGAINST | VoteResult.VOTE_ABSTENTION | VoteResult.DID_NOT_VOTE;


export interface IVotesRecognizer {
  getVotesForNames(votingFilepath: string, config: SessionConfig): SessionVote[];
}


export class VotesRecognizer implements IVotesRecognizer {


  constructor(private readonly imagesSource: IVotingImagesSource) {
  }


  public getVotesForNames(votingFilepath: string, config: SessionConfig): SessionVote[] {
    const ctx = this.imagesSource.loadVotingImage(votingFilepath);
    return config.names.map(name => this.getVoteForName(ctx, name, config.layout));
  }


  private getVoteForName(ctx: CanvasRenderingContext2D, name: SessionConfigPerson, layout: SessionConfigLayout): SessionVote {

    const position = this.getTestPositionForName(name, layout);
    const color = this.getColorAtPosition(ctx, position.x, position.y);
    const categorizedColor = this.categorizeColor(color);
    const vote = this.categoryToVote(categorizedColor);

    return { name: name.name, vote };

  }


  private getTestPositionForName(name: SessionConfigPerson, layout: SessionConfigLayout) {
    const nameColumn = layout.namesColumns[name.columnIndex];
    return {
      x: nameColumn.left + nameColumn.testPixelXOffset,
      y: nameColumn.top + nameColumn.testPixelYOffset + (name.rowIndex * layout.namesRowHeight),
    };
  }


  private getColorAtPosition(ctx: CanvasRenderingContext2D, sx: number, sy: number): number[] {
    const pixelMatrix = ctx.getImageData(sx - 1, sy - 1, 3, 3).data;
    const r = Math.round((pixelMatrix[0] + pixelMatrix[4] + pixelMatrix[8] + pixelMatrix[12] + pixelMatrix[16] + pixelMatrix[20] + pixelMatrix[24] + pixelMatrix[28] + pixelMatrix[32]) / 9);
    const g = Math.round((pixelMatrix[1] + pixelMatrix[5] + pixelMatrix[9] + pixelMatrix[13] + pixelMatrix[17] + pixelMatrix[21] + pixelMatrix[25] + pixelMatrix[29] + pixelMatrix[33]) / 9);
    const b = Math.round((pixelMatrix[2] + pixelMatrix[6] + pixelMatrix[10] + pixelMatrix[14] + pixelMatrix[18] + pixelMatrix[22] + pixelMatrix[26] + pixelMatrix[30] + pixelMatrix[34]) / 9);

    return [r, g, b];
  }


  private categorizeColor(color: number[]): CategorizedColor {
    const [r, g, b] = color;

    if (r > 90 && g > 90 && b > 90 && Math.abs(r - g) < 10 && Math.abs(r - b) < 10 && Math.abs(g - b) < 10) {
      return 'white';
    }

    if (r > 80 && g > 80 && b < 50 && Math.abs(r - g) < 30) {
      return 'yellow';
    }

    if (g > r && g > b) {
      return 'green';
    }

    if (r > g && r > b) {
      return 'red';
    }

    return 'unknown';
  }


  private categoryToVote(category: CategorizedColor): VoteCode {
    switch (category) {
      case 'red':
        return VoteResult.VOTE_AGAINST;
      case 'green':
        return VoteResult.VOTE_FOR;
      case 'yellow':
        return VoteResult.VOTE_ABSTENTION;
      case 'white':
        return VoteResult.DID_NOT_VOTE;
      default:
        return VoteResult.DID_NOT_VOTE;
    }
  }


}
