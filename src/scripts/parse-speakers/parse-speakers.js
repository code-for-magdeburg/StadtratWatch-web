const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');


const SESSIONS = [
    // '2022-09-01',
    // '2022-10-06',
    // '2022-10-10',
    // '2022-11-10',
    // '2022-11-14',
    // '2022-12-08',
    // '2022-12-12',
    // '2023-01-19',
    // '2023-02-16',
    // '2023-03-16',
    // '2023-04-20',
    // '2023-04-24',
    // '2023-05-25',
    // '2023-05-30',
    // '2023-06-22',
    // '2023-06-26',
    // '2023-08-17',
    // '2023-08-21'
    // '2023-09-14',
    // '2023-09-18',
    // '2023-10-12',
    // '2023-10-16',
    // '2023-11-16',
    // '2023-11-20',
    // '2023-12-07',
    // '2023-12-11',
    // '2024-01-18',
    // '2024-02-15',
    // '2024-03-07',
    // '2024-03-11',
    // '2024-04-04',
    // '2024-04-08',
    // '2024-03-11',
    // '2024-05-02',
    // '2024-05-06',
    // '2024-06-13',
    // '2024-06-17',
    // '2024-07-08',
    // '2024-08-15',
    // '2024-09-12',
    // '2024-10-17',
    // '2024-10-21',
];
const SESSIONS_BASE_DIRECTORY = './sessions-media-files';
const SESSIONS_SCAN_RESULTS_DIRECTORY = './output/sessions-scan-results';


function processSession(session) {

    const rttmFiles = fs
        .readdirSync(path.join(SESSIONS_BASE_DIRECTORY, session))
        .filter(file => file.endsWith('.rttm'));

    const outputDirectory = path.join(SESSIONS_SCAN_RESULTS_DIRECTORY, session);
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory);
    }

    const speakers = rttmFiles.map(rttmFile => processRttmFile(session, rttmFile)).flat();
    console.log(`Writing session-speakers-${session}.json`);
    fs.writeFileSync(
        path.join(outputDirectory, `session-speakers-${session}.json`),
        JSON.stringify(speakers, null, 4)
    );

}


function processRttmFile(session, rttmFile) {

    const filename = path.join(SESSIONS_BASE_DIRECTORY, session, rttmFile);
    const rttmFileContent = fs.readFileSync(filename, 'utf8');

    const parseConfig = {
        header: false,
        delimiter: ' ',
    };
    const parsed = Papa.parse(rttmFileContent, parseConfig);

    const part = rttmFile.replace('.rttm', '').split('-').pop();
    const json = parsed.data
        .filter(line => !!line[7])
        .filter(line => parseFloat(line[4]) > 1)
        .map(line => {
            const startOffset = +part * 4 * 60 * 60;
            return {
                speaker: `${part}_${line[7]}`,
                start: startOffset + parseFloat(line[3]),
                duration: parseFloat(line[4]),
            };
        })
        .sort((a, b) => a.speaker.localeCompare(b.speaker));

    const bySpeaker = json.reduce((acc, line) => {
        if (!acc[line.speaker]) {
            acc[line.speaker] = [];
        }
        acc[line.speaker].push({ start: line.start, duration: line.duration });
        return acc;
    }, {});

    return Object
        .keys(bySpeaker)
        .map(speaker => ({ speaker, segments: bySpeaker[speaker] }));

}


function run(sessions) {
    for (const session of sessions) {
        processSession(session);
    }
}


run(SESSIONS);
console.log('Done.');
