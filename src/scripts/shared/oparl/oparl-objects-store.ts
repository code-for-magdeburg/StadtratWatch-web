import type { OparlFile, OparlAgendaItem, OparlMeeting, OparlPaper, OparlConsultation } from '../model/oparl.ts';
import * as path from '@std/path';


export interface IOparlObjectsStore {
  getMeetings(): OparlMeeting[];
  getAgendaItems(meetingId: string): OparlAgendaItem[];
  getConsultations(meetingId: string): OparlConsultation[];
  getPapers(meetingId: string): OparlPaper[];
  getFiles(meetingId: string): OparlFile[];
}


export class OparlObjectsFileStore implements IOparlObjectsStore {


  private meetings: OparlMeeting[];
  private consultations: OparlConsultation[];
  private agendaItems: OparlAgendaItem[];
  private papers: OparlPaper[];
  private files: OparlFile[];


  constructor(private readonly organizationId: string, directory: string) {
    this.meetings = JSON.parse(Deno.readTextFileSync(path.join(directory, 'meetings.json'))) as OparlMeeting[];
    this.consultations = JSON.parse(
      Deno.readTextFileSync(path.join(directory, 'consultations.json'))
    ) as OparlConsultation[];
    this.agendaItems = JSON.parse(
      Deno.readTextFileSync(path.join(directory, 'agenda-items.json'))
    ) as OparlAgendaItem[];
    this.papers = JSON.parse(Deno.readTextFileSync(path.join(directory, 'papers.json'))) as OparlPaper[];
    this.files = JSON.parse(Deno.readTextFileSync(path.join(directory, 'files.json'))) as OparlFile[];
  }


  public getMeetings(): OparlMeeting[] {
    return this.meetings
      .filter(meeting => (meeting.organization || []).includes(this.organizationId))
      .filter(meeting => !meeting.cancelled);
  }


  public getAgendaItems(meetingId: string): OparlAgendaItem[] {
    return this.agendaItems.filter(agendaItem => agendaItem.meeting === meetingId);
  }


  public getConsultations(meetingId: string): OparlConsultation[] {
    return this.consultations.filter(consultation => consultation.meeting === meetingId);
  }


  public getPapers(meetingId: string): OparlPaper[] {
    return this.papers.filter(
      paper => (paper.consultation || []).some(
        consultation =>
          (consultation.organization || []).includes(this.organizationId)
          && consultation.meeting === meetingId
      )
    );
  }


  public getFiles(meetingId: string): OparlFile[] {

    const paperIds = this.consultations
      .filter(consultation => consultation.meeting === meetingId)
      .map(consultation => consultation.paper)
      .filter(paperId => !!paperId)
      .map(paperId => this.papers.find(paper => paper.id === paperId))
      .filter(paper => !!paper)
      .map(paper => paper.id);

    return this.files.filter(
      file => (file.paper || []).some(paperId => paperIds.includes(paperId))
    );

  }


}
