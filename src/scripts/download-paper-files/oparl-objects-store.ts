import type { OparlFile, OparlMeeting, OparlPaper, OparlConsultation } from '../shared/model/oparl.ts';
import * as path from '@std/path';


export interface IOparlObjectsStore {
  getStadtratMeetings(year: number): OparlMeeting[];
  getFiles(meeting_id: string): OparlFile[];
}


export class OparlObjectsFileStore implements IOparlObjectsStore {


  private meetings: OparlMeeting[];
  private consultations: OparlConsultation[];
  private papers: OparlPaper[];
  private files: OparlFile[];


  constructor(private readonly organizationId: string, directory: string) {
    this.meetings = JSON.parse(Deno.readTextFileSync(path.join(directory, 'meetings.json'))) as OparlMeeting[];
    this.consultations = JSON.parse(
      Deno.readTextFileSync(path.join(directory, 'consultations.json'))
    ) as OparlConsultation[];
    this.papers = JSON.parse(Deno.readTextFileSync(path.join(directory, 'papers.json'))) as OparlPaper[];
    this.files = JSON.parse(Deno.readTextFileSync(path.join(directory, 'files.json'))) as OparlFile[];
  }


  public getStadtratMeetings(year: number): OparlMeeting[] {
    return this.meetings
      .filter(meeting => meeting.organization.includes(this.organizationId))
      .filter(meeting => meeting.start.startsWith(`${year}`))
      .filter(meeting => !meeting.cancelled);
  }


  public getFiles(meetingId: string): OparlFile[] {

    const paperIds = this.consultations
      .filter(consultation => consultation.meeting === meetingId)
      .map(consultation => consultation.paper)
      .filter(paperId => !!paperId)
      .map(paperId => this.papers.find(paper => paper.id === paperId))
      .filter(paper => !!paper)
      .map(paper => paper.id);

    return this.files
      .filter(file => !!file.paper)
      .filter(file => file.paper.some(paperId => paperIds.includes(paperId)));

  }


}
