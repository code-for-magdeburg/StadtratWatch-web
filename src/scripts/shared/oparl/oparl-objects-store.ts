import type {
  OparlAgendaItem,
  OparlConsultation,
  OparlFile,
  OparlMeeting,
  OparlOrganization,
  OparlPaper,
} from '@srw-astro/models/oparl';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';

export interface OparlObjectsStore {
  loadMeetings(): OparlMeeting[];
  loadAgendaItems(): OparlAgendaItem[];
  loadConsultations(): OparlConsultation[];
  loadPapers(): OparlPaper[];
  loadFiles(): OparlFile[];
  loadOrganizations(): OparlOrganization[];
}

export class OparlObjectsFileStore implements OparlObjectsStore {
  constructor(private readonly directory: string) {
  }

  public loadMeetings(): OparlMeeting[] {
    return JSON.parse(readFileSync(path.join(this.directory, 'meetings.json'), 'utf-8')) as OparlMeeting[];
  }

  public loadAgendaItems(): OparlAgendaItem[] {
    return JSON.parse(readFileSync(path.join(this.directory, 'agenda-items.json'), 'utf-8')) as OparlAgendaItem[];
  }

  public loadConsultations(): OparlConsultation[] {
    return JSON.parse(readFileSync(path.join(this.directory, 'consultations.json'), 'utf-8')) as OparlConsultation[];
  }

  public loadPapers(): OparlPaper[] {
    return JSON.parse(readFileSync(path.join(this.directory, 'papers.json'), 'utf-8')) as OparlPaper[];
  }

  public loadFiles(): OparlFile[] {
    return JSON.parse(readFileSync(path.join(this.directory, 'files.json'), 'utf-8')) as OparlFile[];
  }

  public loadOrganizations(): OparlOrganization[] {
    return JSON.parse(readFileSync(path.join(this.directory, 'organizations.json'), 'utf-8')) as OparlOrganization[];
  }
}
