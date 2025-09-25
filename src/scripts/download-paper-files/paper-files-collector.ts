import type { ScrapedMeeting } from '@srw-astro/models/scraped-session';
import type { IPaperFilesDownloader } from './paper-files-downloader.ts';
import type { IOparlObjectsStore } from './oparl-objects-store.ts';


export class PaperFilesCollector {


  constructor(private readonly oparlObjectsStore:  IOparlObjectsStore,
              private readonly downloader: IPaperFilesDownloader) {
  }


  public async collectFiles(year: number): Promise<void> {

    const meetings = this.oparlObjectsStore.getStadtratMeetings(year);
    if (meetings.length === 0) {
      console.log('No meetings found for year: ', year);
      return;
    }

    for (const meeting of meetings) {
      await this.processMeeting(meeting);
    }

  }


  private async processMeeting(meeting: ScrapedMeeting): Promise<void> {
    const files = this.oparlObjectsStore.getFiles(meeting);
    for (const file of files) {
      await this.downloader.downloadFile(file.url, file.original_id);
    }
  }


}
