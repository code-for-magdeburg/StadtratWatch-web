import type { OparlAgendaItem, OparlConsultation, OparlFile, OparlMeeting, OparlPaper } from '../model/oparl.ts';
import * as path from '@std/path';
import { OparlPapersInMemoryRepository } from './oparl-papers-repository.ts';
import { OparlFilesInMemoryRepository } from './oparl-files-repository.ts';
import { OparlMeetingsInMemoryRepository } from './oparl-meetings-repository.ts';

export interface IOparlObjectsStore {
  loadMeetings(): OparlMeeting[];
  loadAgendaItems(): OparlAgendaItem[];
  loadConsultations(): OparlConsultation[];
  loadPapers(): OparlPaper[];
  loadFiles(): OparlFile[];

  getMeetings(): OparlMeeting[];
  getFiles(meetingId: string): OparlFile[];
}

export class OparlObjectsFileStore implements IOparlObjectsStore {
  private meetings: OparlMeeting[];
  private papers: OparlPaper[];
  private files: OparlFile[];

  constructor(private readonly organizationId: string, private readonly directory: string) {
    this.meetings = this.loadMeetings();
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
    const meetingsRepository = new OparlMeetingsInMemoryRepository(this.meetings);
    return meetingsRepository.getMeetingsByOrganization(this.organizationId);
  }

  public getFiles(meetingId: string): OparlFile[] {
    const papersRepository = new OparlPapersInMemoryRepository(this.papers);
    const filesRepository = new OparlFilesInMemoryRepository(this.files, papersRepository);
    return filesRepository.getFilesByMeeting(meetingId);
  }
}
