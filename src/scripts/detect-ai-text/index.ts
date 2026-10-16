import type { SessionSpeech } from '@srw-astro/models/session-speech';
import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { executeDetectAiTextRun, planDetectAiTextRun } from './detect-ai-text-processor.ts';
import { tryGetDetectAiTextEnv } from './env.ts';
import { PangramHttpClient } from './pangram-client.ts';
import { serializeSpeeches } from './speeches-file.ts';

const args = parseArgs(Bun.argv.slice(2));

if (args.help) {
  printHelpText();
  process.exit(0);
}

checkArgs(args);

const speeches: SessionSpeech[] = await Bun.file(args.speechesFile).json();
const plan = planDetectAiTextRun(speeches, args.starts, args.skipExisting);

for (const start of plan.notFoundStarts) {
  console.warn(`No speech found with start ${start} in ${args.speechesFile}.`);
}

for (const speech of plan.skippedExisting) {
  console.log(`Skipping ${speech.speaker} at ${speech.start}: already assessed and transcript unchanged.`);
}

if (plan.toAssess.length === 0) {
  console.log('Nothing to assess.');
  process.exit(0);
}

console.log(
  `About to assess ${plan.toAssess.length} speech(es), ~${plan.totalWordCount} words, ` +
    `estimated cost: $${plan.estimatedCostUsd.toFixed(2)}.`,
);

// Pangram is paid: piped stdin must not confirm the requests (Bun's confirm() would accept it).
if (!process.stdin.isTTY || !confirm('Proceed with the Pangram request(s)?')) {
  console.log('Aborted. No changes written.');
  process.exit(0);
}

const env = tryGetDetectAiTextEnv();
const pangramClient = new PangramHttpClient(env.pangramApiKey);
const result = await executeDetectAiTextRun(plan.toAssess, pangramClient, () => new Date().toISOString());

await Bun.write(args.speechesFile, serializeSpeeches(speeches));

console.log(
  `Done. Assessed: ${result.assessedCount}, skipped (too short): ${result.skippedTooShortCount}, ` +
    `failed: ${result.failedCount}.`,
);
