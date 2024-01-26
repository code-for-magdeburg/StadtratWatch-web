import * as fs from 'fs';
import * as path from 'path';
import {FILES_DIR, IDS_TO_SKIP_FILE, KNOWN_WORDS_FILE, OUTPUT_DIR} from './constants.js';
import PDFParser from 'pdf2json';
import natural from 'natural';


if (!fs.existsSync(KNOWN_WORDS_FILE)) {
  fs.writeFileSync(KNOWN_WORDS_FILE, '');
}


async function run(years) {

  const knownWords = fs.readFileSync(KNOWN_WORDS_FILE, 'utf8').split('\n');

  for (const year of years) {
    console.log(`Processing year ${year}...`);
    await processYear(year, knownWords);
    console.log(`Done processing year ${year}.`);
  }

}


async function processYear(year, knownWords) {

  const yearOutputDir = path.join(OUTPUT_DIR, year);
  if (!fs.existsSync(yearOutputDir)) {
    fs.mkdirSync(yearOutputDir);
  }

  const processedFiles = fs
    .readdirSync(yearOutputDir, { withFileTypes: true })
    .filter(dirent => dirent.isFile() && dirent.name.endsWith('.raw.txt'));
  const idsToSkip = fs.readFileSync(IDS_TO_SKIP_FILE, 'utf8').split('\n');
  const filesToSkip = idsToSkip.map(id => `${id}.pdf`);
  filesToSkip.push(...processedFiles.map(file => file.name.replace('.raw.txt', '')));

  const yearFiles = fs
    .readdirSync(path.join(FILES_DIR, year), { withFileTypes: true })
    .filter(
      dirent => dirent.isFile() && dirent.name.endsWith('.pdf') && !filesToSkip.includes(dirent.name)
    );

  for (const yearFile of yearFiles) {
    await processFile(yearFile, knownWords, yearOutputDir);
  }

}


async function processFile(file, knownWords, yearOutputDir) {

  return new Promise((resolve, reject) => {

    const fileStats = fs.statSync(path.join(file.path, file.name));
    if (fileStats.size > 10000000) {
      console.info(`${file.name} is too big (${fileStats.size} bytes), skipping.`);
      resolve([]);
      return;
    }

    const pdfParser = new PDFParser(this, 1);

    pdfParser.on('pdfParser_dataError', errData => {
      console.error(`error with ${file.name}:`);
      console.error(errData);
      reject(errData);
    });

    pdfParser.on('pdfParser_dataReady', pdfData => {

      const rawTextContent = pdfParser.getRawTextContent();
      fs.writeFileSync(path.join(yearOutputDir, `${file.name}.raw.txt`), rawTextContent);

      const tokenizer = new natural.AggressiveTokenizerDe();
      const tokens = [...new Set(tokenizer.tokenize(rawTextContent))];
      const validTokens = tokens
        .filter(token => token.length > 2 && isNaN(+token))
        // Token should have more letters than non-letters
        .filter(token => {
          const letters = token.replace(/[^a-z]/gi, '');
          return letters.length > token.length - letters.length;
        })
        .map(token => token.toLowerCase())
        .sort();
      const unknownTokens = validTokens.filter(token => !knownWords.includes(token));
      console.log(`${file.name}: new tokens`, unknownTokens.length);

      fs.writeFileSync(path.join(yearOutputDir, `${file.name}.tokens.txt`), unknownTokens.join('\n'));

      if (unknownTokens.length > 0) {
        knownWords.push(...unknownTokens);
        knownWords.sort();
        fs.writeFileSync(KNOWN_WORDS_FILE, knownWords.join('\n'));
      }

      resolve(unknownTokens);

    });

    pdfParser.loadPDF(path.join(file.path, file.name));

  });

}


(async () => {
  const years = [
    '2003',
    '2004',
    '2005',
    '2006',
    '2007',
    '2008',
    '2009',
    '2010',
    '2011',
    '2012',
    '2013',
    '2014',
    '2015',
    '2016',
    '2017',
    '2018',
    '2019',
    '2020',
    '2021',
    '2022',
    '2023',
    '2024'
  ];
  await run(years);
  console.log('Done.');
})();
