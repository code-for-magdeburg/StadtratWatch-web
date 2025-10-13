import { ScanConfig } from './scan-config.ts';
import { IVotingImagesSource } from './voting-images-source.ts';
import { SessionScan } from '@srw-astro/models/session-scan';
import { ISessionScanStore } from './session-scan-store.ts';
import { ITextRecognizer } from './text-recognizer.ts';
import { IVotesRecognizer } from './votes-recognizer.ts';

export class VotingImagesScanner {
  constructor(
    private readonly imagesSource: IVotingImagesSource,
    private readonly sessionScanStore: ISessionScanStore,
    private readonly textRecognizer: ITextRecognizer,
    private readonly votesRecognizer: IVotesRecognizer,
  ) {
  }

  public async processSession(session: string, config: ScanConfig): Promise<void> {
    const summary: SessionScan = [];

    const votingFilenames = this.imagesSource.getVotingImagesFilenames();

    for (const votingFilename of votingFilenames) {
      console.log(`Analyzing ${votingFilename}...`);

      const votingFilepath = this.imagesSource.getFilepath(votingFilename);

      const videoTimestamp = await this.textRecognizer.getVideoTimestamp(votingFilepath, config.layout);
      const votingSubject = await this.textRecognizer.getVotingSubject(votingFilepath, config.layout);
      const votes = this.votesRecognizer.getVotesForNames(votingFilepath, config);

      summary.push({
        votingFilename,
        videoTimestamp,
        votingSubject,
        votes,
      });
    }

    summary.sort((a, b) => a.videoTimestamp.localeCompare(b.videoTimestamp));

    this.sessionScanStore.writeSessionScan(session, summary);
  }
}
