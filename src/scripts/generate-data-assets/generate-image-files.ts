import { Registry } from '../shared/model/registry';
import { SessionDetailsDto, SessionPersonDto, SessionVotingDto } from '../../app/model/Session';
import * as fs from 'fs';
import * as path from 'path';
import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';


type VotingPerFaction = {
  faction: string;
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  notVoted: number;
};

type Voting = {
  date: string;
  applicationType: string;
  applicationId: string;
  subjectTitle: string;
  votes: VotingPerFaction[]
};


const TOTAL_WIDTH = 1200;
const TOTAL_HEIGHT = 630;
const COLUMN_WIDTH = 540;

const PADDING_LEFT = 40;
const PADDING_TOP = 40;
const PADDING_RIGHT = 40;
const PADDING_BOTTOM = 40;
const GAP = TOTAL_WIDTH - PADDING_LEFT - PADDING_RIGHT - 2 * COLUMN_WIDTH;

const BACKGROUND_COLOR = '#3C3C3C';
const VOTED_FOR_FILL_COLOR = '#4EA72E';
const VOTED_AGAINST_FILL_COLOR = '#ED5642';
const ABSTENTIONS_FILL_COLOR = '#DDDDDD';
const TEXT_COLOR = '#DDDDDD';
const TEXT_COLOR_DARK = '#3C3C3C';


export function generateImageFiles(imagesOutputDir: string, registry: Registry, sessions: SessionDetailsDto[]) {
  console.log('Generating images...');
  sessions.forEach(session => generateVotingImages(registry, session, imagesOutputDir));
}


function generateVotingImages(registry: Registry, session: SessionDetailsDto, outputDir: string) {
  console.log(`Generating voting images for session ${session.id}`);
  session.votings.forEach(voting => generateVotingImage(voting, registry, session, outputDir));
}


function generateVotingImage(sessionVoting: SessionVotingDto, registry: Registry, session: SessionDetailsDto,
                             outputDir: string) {

  const canvas = createCanvas(TOTAL_WIDTH, TOTAL_HEIGHT);
  const context = canvas.getContext('2d');

  const factionNames = [...registry.factions]
    .sort((a, b) => b.seats - a.seats)
    .map(faction => faction.name);

  const votes = getVotingForFactions(sessionVoting, factionNames, session.persons);

  const voting: Voting = {
    date: session.date,
    applicationType: sessionVoting.votingSubject.type,
    applicationId: sessionVoting.votingSubject.applicationId,
    subjectTitle: sessionVoting.votingSubject.title,
    votes
  };

  fillCanvas(context);

  const summaryCanvas = drawSummaryCanvas(voting);
  context.drawImage(summaryCanvas, PADDING_LEFT, PADDING_TOP);

  const votingDistributionCanvas = drawVotingDistributionCanvas(voting);
  context.drawImage(votingDistributionCanvas, PADDING_LEFT + summaryCanvas.width + GAP, PADDING_TOP);

  saveToFile(canvas, session.id, sessionVoting, outputDir);

}


function fillCanvas(context: CanvasRenderingContext2D) {

  const MAIN_BORDER_WIDTH = 3;

  context.fillStyle = TEXT_COLOR;
  context.fillRect(0, 0, TOTAL_WIDTH, TOTAL_HEIGHT);

  context.beginPath();
  context.fillStyle = BACKGROUND_COLOR;
  // noinspection JSSuspiciousNameCombination
  context.roundRect(
    MAIN_BORDER_WIDTH,
    MAIN_BORDER_WIDTH,
    TOTAL_WIDTH - 2 * MAIN_BORDER_WIDTH,
    TOTAL_HEIGHT - 2 * MAIN_BORDER_WIDTH,
    8
  );
  context.fill();

}


function drawSummaryCanvas(voting: Voting): Canvas {

  const canvasHeight = TOTAL_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const canvas = createCanvas(COLUMN_WIDTH, canvasHeight);
  const context = canvas.getContext('2d');

  const votingHeaderCanvas = writeVotingHeader(voting);
  context.drawImage(votingHeaderCanvas, 0, 0);

  const applicationIdCanvas = writeApplicationId(voting);
  context.drawImage(applicationIdCanvas, 0, votingHeaderCanvas.height + 20);

  const subjectLines = getWrappedLines(voting.subjectTitle, COLUMN_WIDTH);
  const subjectLinesCanvas = writeSubject(subjectLines);
  context.drawImage(subjectLinesCanvas, 0, votingHeaderCanvas.height + 20 + applicationIdCanvas.height);

  const votingResultCanvas = drawVotingResult(voting);
  context.drawImage(votingResultCanvas, 0, canvasHeight - votingResultCanvas.height);

  return canvas;

}


function writeVotingHeader(voting: Voting): Canvas {

  const canvas = createCanvas(COLUMN_WIDTH, 30);
  const context = canvas.getContext('2d');

  context.font = '14pt Verdana';
  context.fillStyle = TEXT_COLOR;
  const formattedDate = new Date(voting.date).toLocaleDateString(
    'de-DE',
    { year: 'numeric', month: '2-digit', day: '2-digit' }
  );
  context.fillText(`Abstimmung am ${formattedDate}`, 0, 20);

  return canvas;

}


function writeApplicationId(voting: Voting): Canvas {

  let text = '';
  let skip = false;
  switch (voting.applicationType) {

    case 'Änderungsantrag':
      text = voting.applicationId ? `Änderungsantrag ${voting.applicationId}` : 'Änderungsantrag';
      break;

    case 'Antrag':
      text = voting.applicationId ? `Antrag ${voting.applicationId}` : 'Antrag';
      break;

    case 'Beschlussvorlage':
      text = voting.applicationId ? `Beschlussvorlage ${voting.applicationId}` : 'Beschlussvorlage';
      break;

    case 'Delegation':
      skip = true;
      break;

    case 'Geschäftsordnung':
      text = voting.applicationId ? `Geschäftsordnungsantrag zu ${voting.applicationId}` : 'Geschäftsordnungsantrag';
      break;

    case 'Niederschrift':
      skip = true;
      break;

    case 'Redaktionelle Änderung':
      text = voting.applicationId ? `Redaktionelle Änderung zu ${voting.applicationId}` : 'Redaktionelle Änderung';
      break;

    case 'Sonstige':
      skip = true;
      break;

    case 'Tagesordnung':
      text = `Abstimmung zur Tagesordnung`;
      break;

  }

  const canvas = createCanvas(COLUMN_WIDTH, skip ? 0 : 30);

  if (!skip) {
    const context = canvas.getContext('2d');
    context.font = 'italic 14pt Verdana';
    context.fillStyle = TEXT_COLOR;
    context.fillText(text, 0, 20);
  }

  return canvas;

}


function writeSubject(lines: string[]): Canvas {

  const canvas = createCanvas(COLUMN_WIDTH, lines.length * 30);
  const context = canvas.getContext('2d');

  context.font = 'bold 18pt Verdana';
  context.fillStyle = TEXT_COLOR;

  lines.forEach((line, index) => context.fillText(line, 0, index * 30 + 20));

  return canvas;

}


function drawVotingResult(voting: Voting) {

  const votedFor = voting.votes.reduce((sum, faction) => sum + faction.votesFor, 0);
  const votedAgainst = voting.votes.reduce((sum, faction) => sum + faction.votesAgainst, 0);
  const abstentions = voting.votes.reduce((sum, faction) => sum + faction.abstentions, 0);

  const canvas = createCanvas(COLUMN_WIDTH, 170);
  const context = canvas.getContext('2d');

  drawVotesSummary(context, votedFor, 'Dafür', 80, VOTED_FOR_FILL_COLOR);
  drawVotesSummary(context, votedAgainst, 'Dagegen', 270, VOTED_AGAINST_FILL_COLOR);
  drawVotesSummary(context, abstentions, 'Enthalten', 460, ABSTENTIONS_FILL_COLOR);

  if (votedFor > votedAgainst) {
    drawTotalVotingSummary(context, 'Angenommen', VOTED_FOR_FILL_COLOR);
  } else {
    drawTotalVotingSummary(context, 'Abgelehnt', VOTED_AGAINST_FILL_COLOR);
  }

  return canvas;

}


function drawVotesSummary(context: CanvasRenderingContext2D, votes: number, text: string, xCenter: number,
                          fillColor: string) {

  const RECT_WIDTH = 160;
  const RECT_HEIGHT = 40;

  context.font = '14pt Verdana';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.fillText(text, xCenter, 20);

  context.beginPath();
  context.fillStyle = fillColor;
  context.roundRect(xCenter - RECT_WIDTH / 2, 35, RECT_WIDTH, RECT_HEIGHT, 5);
  context.fill();

  context.font = 'bold 18pt Verdana';
  context.fillStyle = TEXT_COLOR_DARK;
  context.textAlign = 'center';
  context.fillText(`${votes}`, xCenter, 65)

}


function drawTotalVotingSummary(context: CanvasRenderingContext2D, text: string, fillColor: string) {

  context.beginPath();
  context.fillStyle = fillColor;
  context.roundRect(0, 90, COLUMN_WIDTH, 80, 10);
  context.fill();

  context.font = 'bold 24pt Verdana';
  context.fillStyle = TEXT_COLOR_DARK;
  context.textAlign = 'center';
  context.fillText(text, COLUMN_WIDTH / 2, 140);

}


function drawVotingDistributionCanvas(voting: Voting): Canvas {

  const canvas = createCanvas(COLUMN_WIDTH, TOTAL_HEIGHT);
  const context = canvas.getContext('2d');

  context.font = '14pt Verdana';

  voting.votes.forEach((faction, index: number) => {

    context.fillStyle = TEXT_COLOR;
    context.fillText(faction.faction, 0, index * 70 + 20);

    const seats = faction.votesFor + faction.abstentions + faction.votesAgainst + faction.notVoted;

    for (let i = 1; i <= seats; i++) {
      context.beginPath();
      if (i > faction.votesFor + faction.abstentions + faction.votesAgainst) {
        context.fillStyle = 'transparent';
      } else if (i > faction.votesFor + faction.votesAgainst) {
        context.fillStyle = ABSTENTIONS_FILL_COLOR;
      } else if (i > faction.votesFor) {
        context.fillStyle = VOTED_AGAINST_FILL_COLOR;
      } else {
        context.fillStyle = VOTED_FOR_FILL_COLOR;
      }

      context.roundRect((i-1) * 35, index * 70 + 30, 30, 30, 5);
      context.fill();
      if (i > faction.votesFor + faction.abstentions + faction.votesAgainst) {
        context.lineWidth = 2;
        context.strokeStyle = TEXT_COLOR;
        context.stroke();
      }

    }

  });

  return canvas;

}


function saveToFile(canvas: Canvas, sessionId: string, voting: SessionVotingDto, imagesDir: string) {

  const sessionOutputDir = path.join(imagesDir, 'votings', sessionId);
  if (!fs.existsSync(sessionOutputDir)) {
    fs.mkdirSync(sessionOutputDir, { recursive: true });
  }

  const buffer = canvas.toBuffer('image/png');
  const filename = `${sessionId}-${voting.id.toString().padStart(3, '0')}.png`;
  fs.writeFileSync(path.join(sessionOutputDir, filename), buffer);

}


function getWrappedLines(text: string, maxWidth: number) {

  const canvas = createCanvas(maxWidth, 1000);
  const context = canvas.getContext('2d');

  context.font = 'bold 18pt Verdana';

  const words = text.split(' ');
  const lines = [];

  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = context.measureText(`${currentLine} ${word}`).width;
    if (width < maxWidth) {
      currentLine = `${currentLine} ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);

  return lines;

}


function getVotingForFactions(sessionVoting: SessionVotingDto, factionNames: string[],
                              persons: SessionPersonDto[]): VotingPerFaction[] {
  return factionNames.map(faction => getVotingForFaction(faction, sessionVoting, persons));
}


function getVotingForFaction(faction: string, sessionVoting: SessionVotingDto,
                             persons: SessionPersonDto[]): VotingPerFaction {

  const factionPersons = persons.filter(person => person.faction === faction);
  const votesFor = sessionVoting.votes.filter(
    vote => vote.vote === 'J' && factionPersons.some(person => person.id === vote.personId)
  ).length;
  const votesAgainst = sessionVoting.votes.filter(
    vote => vote.vote === 'N' && factionPersons.some(person => person.id === vote.personId)
  ).length;
  const abstentions = sessionVoting.votes.filter(
    vote => vote.vote === 'E' && factionPersons.some(person => person.id === vote.personId)
  ).length;
  const notVoted = sessionVoting.votes.filter(
    vote => vote.vote === 'O' && factionPersons.some(person => person.id === vote.personId)
  ).length;

  return { faction, votesFor, votesAgainst, abstentions, notVoted };

}
