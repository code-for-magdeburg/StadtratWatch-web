import { SessionConfig } from '../shared/model/session-config.ts';
import { IVotingImagesSource } from './voting-images-source.ts';
import { SessionScan } from '../shared/model/session-scan.ts';
import { ISessionScanStore } from './session-scan-store.ts';
import { ITextRecognizer } from './text-recognizer.ts';
import { IVotesRecognizer } from './votes-recognizer.ts';


export class VotingImagesScanner {


  constructor(private readonly imagesSource: IVotingImagesSource, private readonly sessionScanStore: ISessionScanStore,
              private readonly textRecognizer: ITextRecognizer, private readonly votesRecognizer: IVotesRecognizer) {
  }


  public async processSession(session: string, config: SessionConfig): Promise<void> {

    const summary: SessionScan = [];

    const votingFilenames = this.imagesSource.getVotingImagesFilenames();

    for (const votingFilename of votingFilenames) {

      console.log(`Analyzing ${votingFilename}...`);

      const votingFilepath = this.imagesSource.getFilepath(votingFilename);

      const videoTimestamp = await this.textRecognizer.getVideoTimestamp(votingFilepath, config.layout);
      const votingSubject = await this.textRecognizer.getVotingSubject(votingFilepath, config.layout);
      const votes = this.votesRecognizer.getVotesForNames(votingFilepath, config);
      const confirmations = {
        videoTimestamp: false,
        agendaItem: false,
        applicationId: false,
        title: false,
        votes: false,
        context: false
      };

      summary.push({
        votingFilename,
        videoTimestamp,
        votingSubject,
        votes,
        confirmations
      });

    }

    summary.sort((a, b) => a.videoTimestamp.localeCompare(b.videoTimestamp));

    this.sessionScanStore.writeSessionScan(session, summary);

  }


}