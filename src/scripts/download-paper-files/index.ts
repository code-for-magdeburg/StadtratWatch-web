import * as fs from '@std/fs';
import * as path from '@std/path';
import { ScrapedMeeting, ScrapedSession } from '../shared/model/scraped-session.ts';
import { checkArgs, parseArgs, printHelpText } from './cli.ts';


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


await runYear(args.papersDir, parseInt(args.year));
console.log('Done.');


async function runYear(outputBaseDir: string, year: number): Promise<void> {

  const outputDir = path.join(outputBaseDir, `${year}`);
  fs.ensureDirSync(outputDir);

  const magdeburg = JSON.parse(Deno.readTextFileSync(args.scrapedSessionFilename)) as ScrapedSession;
  await runMeetings(year, magdeburg, outputDir);

}


async function runMeetings(year: number, magdeburg: ScrapedSession, outputDir: string): Promise<void> {

  const meetings = magdeburg.meetings.filter(
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
    await runMeeting(magdeburg, outputDir, meeting);
  }

}


async function runMeeting(magdeburg: ScrapedSession, outputDir: string, meeting: ScrapedMeeting): Promise<void> {

  const agendaItemsWithPaper = magdeburg.agenda_items.filter(
    agendaItem => agendaItem.meeting_id === meeting.original_id && !!agendaItem.paper_original_id
  );
  const paperIds = agendaItemsWithPaper
    .filter(agendaItem => !!agendaItem)
    .map(agendaItem => agendaItem.paper_original_id);
  const files = magdeburg.files.filter(file => paperIds.includes(file.paper_original_id));

  const dirents = Deno.readDirSync(outputDir);
  const existingFiles = Array
    .from(dirents)
    .filter(dirent => dirent.isFile && dirent.name.endsWith('.pdf'))
    .map(dirent => dirent.name);

  const filesToDownload = files.filter(
    file => !existingFiles.includes(`${file.original_id}.pdf`)
  );
  for (const file of filesToDownload) {
    await downloadFile(file.url, file.original_id, outputDir);
  }

}


async function downloadFile(url: string, id: number, outputDir: string): Promise<void> {

  const filename = `${id}.pdf`;

  const fileResponse = await fetch(url);
  if (fileResponse.body) {
    const file = await Deno.open(path.join(outputDir, filename), { write: true, create: true });
    await fileResponse.body.pipeTo(file.writable);
    console.log('Download finished: ', filename);
  }

}
