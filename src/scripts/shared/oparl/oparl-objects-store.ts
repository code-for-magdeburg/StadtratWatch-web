import type { OparlAgendaItem, OparlConsultation, OparlFile, OparlMeeting, OparlPaper } from '../model/oparl.ts';
import * as path from '@std/path';

export interface IOparlObjectsStore {
  loadMeetings(): OparlMeeting[];
  loadAgendaItems(): OparlAgendaItem[];
  loadConsultations(): OparlConsultation[];
  loadPapers(): OparlPaper[];
  loadFiles(): OparlFile[];

  getMeetings(): OparlMeeting[];
  getConsultations(meetingId: string): OparlConsultation[];
  getPapers(meetingId: string): OparlPaper[];
  getFiles(meetingId: string): OparlFile[];
}

export class OparlObjectsFileStore implements IOparlObjectsStore {
  private meetings: OparlMeeting[];
  private consultations: OparlConsultation[];
  private papers: OparlPaper[];
  private files: OparlFile[];

  constructor(private readonly organizationId: string, private readonly directory: string) {
    this.meetings = this.loadMeetings();
    this.consultations = this.loadConsultations();
    this.papers = this.loadPapers();
    this.files = this.loadFiles();
  }

  public loadMeetings(): OparlMeeting[] {
    return JSON.parse(Deno.readTextFileSync(path.join(this.directory, 'meetings.json'))) as OparlMeeting[];
  }

  public loadAgendaItems(): OparlAgendaItem[] {
    return JSON.parse(Deno.readTextFileSync(path.join(this.directory, 'agenda-items.json'))) as OparlAgendaItem[];
  }

  public loadConsultations(): OparlConsultation[] {
    return JSON.parse(Deno.readTextFileSync(path.join(this.directory, 'consultations.json'))) as OparlConsultation[];
  }

  public loadPapers(): OparlPaper[] {
    return JSON.parse(Deno.readTextFileSync(path.join(this.directory, 'papers.json'))) as OparlPaper[];
  }

  public loadFiles(): OparlFile[] {
    return JSON.parse(Deno.readTextFileSync(path.join(this.directory, 'files.json'))) as OparlFile[];
  }

  public getMeetings(): OparlMeeting[] {
    return this.meetings
      .filter((meeting) => (meeting.organization || []).includes(this.organizationId))
      .filter((meeting) => !meeting.cancelled);
  }

  public getConsultations(meetingId: string): OparlConsultation[] {
    return this.consultations.filter((consultation) => consultation.meeting === meetingId);
  }

  public getPapers(meetingId: string): OparlPaper[] {
    return this.papers.filter(
      (paper) =>
        (paper.consultation || []).some(
          (consultation) =>
            (consultation.organization || []).includes(this.organizationId) &&
            consultation.meeting === meetingId,
        ),
    );
  }

  public getFiles(meetingId: string): OparlFile[] {
    const paperIds = this.papers
      .filter(
        (paper) =>
          (paper.consultation || []).some(
            (consultation) => consultation.meeting === meetingId,
          ),
      )
      .map((paper) => paper.id);

    return this.files.filter(
      (file) => (file.paper || []).some((paperId) => paperIds.includes(paperId)),
    );
  }
}
