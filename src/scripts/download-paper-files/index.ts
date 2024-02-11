import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import { ScrapedMeeting, ScrapedSession } from '../shared/model/scraped-session';


const inputDir = process.argv[2];
const outputDir = process.argv[3];
const year = process.argv[4];

if (!inputDir || !outputDir || !year) {
  console.error('Usage: node index.js <inputDir> <outputDir> <year>');
  process.exit(1);
}

const scrapedSessionFilename = `${inputDir}/Magdeburg.json`;
if (!fs.existsSync(scrapedSessionFilename) || !fs.lstatSync(scrapedSessionFilename).isFile()) {
  console.error(`Scraped session file "${scrapedSessionFilename}" does not exist or is not a file.`);
  process.exit(1);
}


if (isNaN(parseInt(year))) {
  console.error('Year must be a number.');
  process.exit(1);
}


async function runYear(outputBaseDir: string, year: number): Promise<void> {

  const outputDir = path.join(outputBaseDir, `${year}`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const magdeburg = JSON.parse(fs.readFileSync(scrapedSessionFilename, 'utf8')) as ScrapedSession;
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

  const dirents = fs.readdirSync(outputDir, { withFileTypes: true });
  const existingFiles = dirents
    .filter(dirent => dirent.isFile() && dirent.name.endsWith('.pdf'))
    .map(dirent => dirent.name);

  const filesToDownload = files.filter(
    file => !existingFiles.includes(`${file.original_id}.pdf`)
  );
  for (const file of filesToDownload) {
    await downloadFile(file.url, file.original_id!, outputDir);
  }

}


async function downloadFile(url: string, id: number, outputDir: string): Promise<void> {

  return new Promise((resolve) => {

    const filename = `${id}.pdf`;

    https.get(url, (res) => {
      const fileStream = fs.createWriteStream(path.join(outputDir, filename));
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log('Download finished: ', filename);
        resolve();
      });
    })

  });
}


(async () => {
  await runYear(outputDir, parseInt(year));
  console.log('Done.');
})();
