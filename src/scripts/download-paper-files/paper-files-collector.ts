import type { IPaperFilesDownloader } from './paper-files-downloader.ts';
import type { IOparlObjectsStore } from './oparl-objects-store.ts';
import type { OparlMeeting } from '../shared/model/oparl.ts';


export class PaperFilesCollector {


  constructor(private readonly oparlObjectsStore:  IOparlObjectsStore,
              private readonly downloader: IPaperFilesDownloader) {
  }


  public async collectFiles(year: number): Promise<void> {
    const meetings = this.oparlObjectsStore.getStadtratMeetings(year);
    for (const meeting of meetings) {
      await this.processMeeting(meeting);
    }
  }


  private async processMeeting(meeting: OparlMeeting): Promise<void> {
    const files = this.oparlObjectsStore.getFiles(meeting.id);
    for (const file of files) {
      await this.downloader.downloadFile(file.id);
    }
  }


}
