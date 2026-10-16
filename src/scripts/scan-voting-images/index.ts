import type { ScanConfig } from './scan-config.ts';
import { createWorker } from 'tesseract.js';
import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { VotingImagesScanner } from './voting-images-scanner.ts';
import { VotingImagesSource } from './voting-images-source.ts';
import { SessionScanStore } from './session-scan-store.ts';
import { TextRecognizer } from './text-recognizer.ts';
import { VotesRecognizer } from './votes-recognizer.ts';

const args = parseArgs(Bun.argv.slice(2));

if (args.help) {
  printHelpText();
  process.exit(0);
}

checkArgs(args);

const worker = await createWorker('deu');

const imagesSource = new VotingImagesSource(args.votingImagesDir);
const sessionScanStore = new SessionScanStore(args.outputDir);
const textRecognizer = new TextRecognizer(worker);
const votesRecognizer = new VotesRecognizer(imagesSource);
const scanner = new VotingImagesScanner(
  imagesSource,
  sessionScanStore,
  textRecognizer,
  votesRecognizer,
);
const scanConfig = (await Bun.file(args.scanConfigFile).json()) as ScanConfig;
await scanner.processSession(args.session, scanConfig);

await worker.terminate();

console.log('Done.');
