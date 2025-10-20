import type { OparlAgendaItem, OparlConsultation, OparlFile, OparlMeeting, OparlPaper } from '../model/oparl.ts';
import * as path from '@std/path';

export interface OparlObjectsStore {
  loadMeetings(): OparlMeeting[];
  loadAgendaItems(): OparlAgendaItem[];
  loadConsultations(): OparlConsultation[];
  loadPapers(): OparlPaper[];
  loadFiles(): OparlFile[];
}

export class OparlObjectsFileStore implements OparlObjectsStore {
  constructor(private readonly directory: string) {
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
}
