import * as fs from '@std/fs';
import * as path from '@std/path';
import { ScrapedFile, ScrapedMeeting } from '../shared/model/scraped-session.ts';


export interface IPaperFilesStore {
  getFileSize(meeting: ScrapedMeeting, file: ScrapedFile): number | null;
}


export class PaperFilesStore implements IPaperFilesStore {


  constructor(private readonly papersDir: string) {}


  getFileSize(meeting: ScrapedMeeting, file: ScrapedFile): number | null {

    const year = meeting.start.split('-')[0];
    const paperFilename = path.join(this.papersDir, year, `${file.original_id}.pdf`);

    return fs.existsSync(paperFilename) ? Deno.statSync(paperFilename).size : null;

  }


}
