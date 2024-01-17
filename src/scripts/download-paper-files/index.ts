import * as fs from 'fs';
import { OUTPUT_DIR, SCRAPED_SESSION_FILENAME } from './constants';
import * as https from 'https';
import * as path from 'path';
import { ScrapedMeeting, ScrapedSession } from '../shared/model/scraped-session';


async function run(years: number[]) {
  for (const year of years) {
    await runYear(year);
  }
}


async function runYear(year: number): Promise<void> {

  console.log('Running year: ', year);

  const outputDir = path.join(OUTPUT_DIR, `${year}`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const magdeburg = JSON.parse(fs.readFileSync(SCRAPED_SESSION_FILENAME, 'utf8')) as ScrapedSession;
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
  await run([
    2003,
    2004,
    2005,
    2006,
    2007,
    2008,
    2009,
    2010,
    2011,
    2012,
    2013,
    2014,
    2015,
    2016,
    2017,
    2018,
    2019,
    2020,
    2021,
    2022,
    2023,
    2024,
  ]);
  console.log('Done.');
})();
