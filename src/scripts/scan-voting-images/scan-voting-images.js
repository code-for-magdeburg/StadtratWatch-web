const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { createWorker } = require('tesseract.js');


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
    // '2023-10-16'
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
const SESSIONS_CONFIGS_DIRECTORY = './sessions-configs';
const SESSIONS_BASE_DIRECTORY = './sessions-media-files';
const SESSIONS_SCAN_RESULTS_DIRECTORY = './output/sessions-scan-results';


function getTestPositionForName(name, layout) {
    const nameColumn = layout.namesColumns[name.columnIndex];
    return {
        x: nameColumn.left + nameColumn.testPixelXOffset,
        y: nameColumn.top + nameColumn.testPixelYOffset + (name.rowIndex * layout.namesRowHeight),
    };
}


function getColorAtPosition(ctx, sx, sy) {
    const pixelMatrix = ctx.getImageData(sx - 1, sy - 1, 3, 3).data;
    const r = Math.round((pixelMatrix[0] + pixelMatrix[4] + pixelMatrix[8] + pixelMatrix[12] + pixelMatrix[16] + pixelMatrix[20] + pixelMatrix[24] + pixelMatrix[28] + pixelMatrix[32]) / 9);
    const g = Math.round((pixelMatrix[1] + pixelMatrix[5] + pixelMatrix[9] + pixelMatrix[13] + pixelMatrix[17] + pixelMatrix[21] + pixelMatrix[25] + pixelMatrix[29] + pixelMatrix[33]) / 9);
    const b = Math.round((pixelMatrix[2] + pixelMatrix[6] + pixelMatrix[10] + pixelMatrix[14] + pixelMatrix[18] + pixelMatrix[22] + pixelMatrix[26] + pixelMatrix[30] + pixelMatrix[34]) / 9);

    return [r, g, b];
}


function categorizeColor(color) {
    const [r, g, b] = color;

    if (r > 90 && g > 90 && b > 90 && Math.abs(r - g) < 10 && Math.abs(r - b) < 10 && Math.abs(g - b) < 10) {
        return 'white';
    }

    // return 'yellow' when color is yellow
    if (r > 80 && g > 80 && b < 50 && Math.abs(r - g) < 30) {
        return 'yellow';
    }

    if (g > r && g > b) {
        return 'green';
    }

    if (r > g && r > b) {
        return 'red';
    }

    return 'unknown';
}


function categoryToVote(category) {
    switch (category) {
        case 'red':
            return 'N';
        case 'green':
            return 'J';
        case 'yellow':
            return 'E';
        case 'white':
            return 'O';
        default:
            return 'U';
    }
}


function getVoteForName(ctx, name, layout) {

    const position = getTestPositionForName(name, layout);
    const color = getColorAtPosition(ctx, position.x, position.y);
    const categorizedColor = categorizeColor(color);
    const vote = categoryToVote(categorizedColor);

    return { name: name.name, vote };

}


async function processSession(session, worker) {

    const summary = [];

    const config = loadConfig(session);
    const sessionDirectory = path.join(SESSIONS_BASE_DIRECTORY, session);
    const votingFilenames = getPollImagesFilenames(sessionDirectory);

    for (const votingFilename of votingFilenames) {

        console.log(`Analyzing ${votingFilename}...`);

        const votingFilepath = path.join(sessionDirectory, votingFilename);

        const ctx = await loadPollImage(votingFilepath);
        const videoTimestamp = await getVideoTimestamp(votingFilepath, config.layout, worker);
        const votingSubject = await getPollSubject(votingFilepath, config.layout, worker);
        const votes = getVotesForNames(ctx, config);
        const confirmations = {
            videoTimestamp: false,
            agendaItem: false,
            applicationId: false,
            title: false,
            votes: false,
            context: false
        };

        summary.push({
            votingFilename,
            videoTimestamp,
            votingSubject,
            votes,
            confirmations
        });

    }

    sortSummary(summary);

    const outputDirectory = path.join(SESSIONS_SCAN_RESULTS_DIRECTORY, session);
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
    }

    fs.writeFileSync(
        path.join(outputDirectory, `session-scan-${session}.json`),
        JSON.stringify(summary, null, 4)
    );

}


function loadConfig(session) {
    return JSON.parse(
        fs.readFileSync(
            path.join(SESSIONS_CONFIGS_DIRECTORY, `config-${session}.json`),
            'utf8'
        )
    );
}


function getPollImagesFilenames(sessionsDirectory) {
    const filenames = fs.readdirSync(sessionsDirectory);
    return filenames.filter(filename => filename.endsWith('.png'))
}


async function loadPollImage(filename) {

    return new Promise((resolve, reject) => {

        fs.readFile(filename, async (err, data) => {

            if (err) return reject(err);

            const image = await loadImage(data);
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            resolve(ctx);

        });

    });

}


function getVotesForNames(ctx, config) {
    return config.names.map(name => getVoteForName(ctx, name, config.layout));
}


async function getVideoTimestamp(votingFilepath, layout, worker) {

    const { data: { text } } = await worker.recognize(
        votingFilepath,
        { rectangle: layout.videoTimestampRectangle }
    );
    const timestamp = text.split('/')[0].trim();

    const timestampParts = timestamp.split(':');
    if (timestampParts[0].length === 1) {
        timestampParts[0] = `0${timestampParts[0]}`;
    }

    if (timestampParts.length === 2) {
        timestampParts.unshift('00');
    }

    return timestampParts.join(':');

}


async function getPollSubject(votingFilepath, layout, worker) {

    const votingSubjectId = await worker.recognize(
        votingFilepath,
        { rectangle: layout.votingSubjectIdRectangle }
    );

    const votingSubjectTitle = await worker.recognize(
        votingFilepath,
        { rectangle: layout.votingSubjectTitleRectangle }
    );

    const title = votingSubjectTitle.data.text
        .replace(/(\r\n|\n|\r)/gm, ' ')
        .trim();

    const parts = votingSubjectId.data.text.split('-');
    return {
        agendaItem: parts[0].trim(),
        applicationId: parts.length > 1 ? parts[1].trim() : '',
        title,
        type: null,
        authors: []
    };

}


function sortSummary(summary) {
    summary.sort((a, b) => a.videoTimestamp.localeCompare(b.videoTimestamp));
}


async function run(sessions) {

    const worker = await createWorker('deu');

    for (const session of sessions) {
        await processSession(session, worker);
    }

    await worker.terminate();

}


run(SESSIONS)
    .then(() => console.log('Done.'))
    .catch(console.error);
