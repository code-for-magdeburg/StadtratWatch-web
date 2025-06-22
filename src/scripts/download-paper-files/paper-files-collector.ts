import { ScrapedMeeting, ScrapedSession } from '@srw-astro/models/scraped-session';
import { IPaperFilesDownloader } from './paper-files-downloader.ts';


export class PaperFilesCollector {


  constructor(private readonly scrapedSession: ScrapedSession, private readonly downloader: IPaperFilesDownloader) {
  }


  public async collectFiles(year: number): Promise<void> {

    const meetings = this.scrapedSession.meetings.filter(
      meeting =>
        !meeting.cancelled &&
        !!meeting.original_id &&
        meeting.start.startsWith(`${year}`) &&
        meeting.organization_name === 'Stadtrat'
    );

    if (meetings.length === 0) {
      console.log('No meetings found for year: ', year);
      return;
    }

    for (const meeting of meetings) {
      await this.processMeeting(meeting);
    }

  }


  private async processMeeting(meeting: ScrapedMeeting): Promise<void> {

    const paperIds = this.scrapedSession.agenda_items
      .filter(agendaItem => agendaItem.meeting_id === meeting.original_id)
      .filter(agendaItem => !!agendaItem.paper_original_id)
      .map(agendaItem => agendaItem.paper_original_id!);
    const files = this.scrapedSession.files.filter(
      file => paperIds.includes(file.paper_original_id)
    );

    for (const file of files) {
      await this.downloader.downloadFile(file.url, file.original_id);
    }

  }


}
