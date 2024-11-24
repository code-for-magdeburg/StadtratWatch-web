import * as fs from '@std/fs';
import * as path from '@std/path';
import { SessionConfig, SessionConfigLayout, SessionConfigPerson } from '../shared/model/session-config.ts';
import { VoteResult } from '@scope/interfaces-web-assets';
import { SessionScan, SessionScanVotingSubject } from '../shared/model/session-scan.ts';
import { CanvasRenderingContext2D, createCanvas, Image } from '@gfx/canvas';
import { createWorker, Worker } from 'npm:tesseract.js';
import { checkArgs, parseArgs, printHelpText } from './cli.ts';


type CategorizedColor = 'red' | 'green' | 'yellow' | 'white' | 'unknown';
type VoteCode = VoteResult.VOTE_FOR | VoteResult.VOTE_AGAINST | VoteResult.VOTE_ABSTENTION | VoteResult.DID_NOT_VOTE;


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


const worker = await createWorker('deu');
await processSession(args.session, worker);
await worker.terminate();

console.log('Done.');


function getTestPositionForName(name: SessionConfigPerson, layout: SessionConfigLayout) {
    const nameColumn = layout.namesColumns[name.columnIndex];
    return {
        x: nameColumn.left + nameColumn.testPixelXOffset,
        y: nameColumn.top + nameColumn.testPixelYOffset + (name.rowIndex * layout.namesRowHeight),
    };
}


function getColorAtPosition(ctx: CanvasRenderingContext2D, sx: number, sy: number): number[] {
    const pixelMatrix = ctx.getImageData(sx - 1, sy - 1, 3, 3).data;
    const r = Math.round((pixelMatrix[0] + pixelMatrix[4] + pixelMatrix[8] + pixelMatrix[12] + pixelMatrix[16] + pixelMatrix[20] + pixelMatrix[24] + pixelMatrix[28] + pixelMatrix[32]) / 9);
    const g = Math.round((pixelMatrix[1] + pixelMatrix[5] + pixelMatrix[9] + pixelMatrix[13] + pixelMatrix[17] + pixelMatrix[21] + pixelMatrix[25] + pixelMatrix[29] + pixelMatrix[33]) / 9);
    const b = Math.round((pixelMatrix[2] + pixelMatrix[6] + pixelMatrix[10] + pixelMatrix[14] + pixelMatrix[18] + pixelMatrix[22] + pixelMatrix[26] + pixelMatrix[30] + pixelMatrix[34]) / 9);

    return [r, g, b];
}


function categorizeColor(color: number[]): CategorizedColor {
    const [r, g, b] = color;

    if (r > 90 && g > 90 && b > 90 && Math.abs(r - g) < 10 && Math.abs(r - b) < 10 && Math.abs(g - b) < 10) {
        return 'white';
    }

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


function categoryToVote(category: CategorizedColor): VoteCode {
    switch (category) {
        case 'red':
            return VoteResult.VOTE_AGAINST;
        case 'green':
            return VoteResult.VOTE_FOR;
        case 'yellow':
            return VoteResult.VOTE_ABSTENTION;
        case 'white':
            return VoteResult.DID_NOT_VOTE;
        default:
            return VoteResult.DID_NOT_VOTE;
    }
}


function getVoteForName(ctx: CanvasRenderingContext2D, name: SessionConfigPerson, layout: SessionConfigLayout) {

    const position = getTestPositionForName(name, layout);
    const color = getColorAtPosition(ctx, position.x, position.y);
    const categorizedColor = categorizeColor(color);
    const vote = categoryToVote(categorizedColor);

    return { name: name.name, vote };

}


async function processSession(session: string, worker: Worker) {

    const summary: SessionScan = [];

    const config = loadConfig(args.sessionConfigFile);
    const votingFilenames = getVotingImagesFilenames(args.votingImagesDir);

    for (const votingFilename of votingFilenames) {

        console.log(`Analyzing ${votingFilename}...`);

        const votingFilepath = path.join(args.votingImagesDir, votingFilename);

        const ctx = loadVotingImage(votingFilepath);
        const videoTimestamp = await getVideoTimestamp(votingFilepath, config.layout, worker);
        const votingSubject = await getVotingSubject(votingFilepath, config.layout, worker);
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

    summary.sort((a, b) => a.videoTimestamp.localeCompare(b.videoTimestamp));

    fs.ensureDirSync(args.outputDir);

    Deno.writeTextFileSync(
        path.join(args.outputDir, `session-scan-${session}.json`),
        JSON.stringify(summary, null, 4)
    );

}


function loadConfig(sessionConfigFile: string): SessionConfig {
    return JSON.parse(Deno.readTextFileSync(sessionConfigFile)) as SessionConfig;
}


function getVotingImagesFilenames(sessionsDirectory: string): string[] {
    return Array
      .from(Deno.readDirSync(sessionsDirectory))
      .filter(entry => entry.isFile)
      .map(entry => entry.name)
      .filter(filename => filename.endsWith('.png'));
}


function loadVotingImage(filename: string): CanvasRenderingContext2D {

    const image = Image.loadSync(filename);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    return ctx;

}


function getVotesForNames(ctx: CanvasRenderingContext2D, config: SessionConfig) {
    return config.names.map(name => getVoteForName(ctx, name, config.layout));
}


async function getVideoTimestamp(votingFilepath: string, layout: SessionConfigLayout, worker: Worker) {

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


async function getVotingSubject(votingFilepath: string, layout: SessionConfigLayout,
                              worker: Worker): Promise<SessionScanVotingSubject> {

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
