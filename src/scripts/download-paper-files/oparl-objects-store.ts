import type { ScrapedSession, ScrapedMeeting, ScrapedFile } from '@srw-astro/models/scraped-session';


export interface IOparlObjectsStore {
  getStadtratMeetings(year: number): ScrapedMeeting[];
  getFiles(meeting: ScrapedMeeting): ScrapedFile[];
}


export class OparlObjectsFileStore implements IOparlObjectsStore {


  constructor(private readonly scrapedSession: ScrapedSession) {}


  public getStadtratMeetings(year: number): ScrapedMeeting[] {
    return this.scrapedSession.meetings
      .filter(meeting => !meeting.cancelled)
      .filter(meeting => !!meeting.original_id)
      .filter(meeting => meeting.start.startsWith(`${year}`))
      .filter(meeting => meeting.organization_name === 'Stadtrat');
  }


  public getFiles(meeting: ScrapedMeeting): ScrapedFile[] {

    const paperIds = this.scrapedSession.agenda_items
      .filter(agendaItem => agendaItem.meeting_id === meeting.original_id)
      .filter(agendaItem => !!agendaItem.paper_original_id)
      .map(agendaItem => agendaItem.paper_original_id!);
    return this.scrapedSession.files.filter(file => paperIds.includes(file.paper_original_id));

  }


}
