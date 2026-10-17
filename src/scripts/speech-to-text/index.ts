import { tryGetSpeechToTextEnv } from './env.ts';
import { checkArgs, parseCliArgs, printHelpText } from './cli.ts';
import { SpeechToText, type SpeechTranscriberConfig } from './speech-to-text.ts';

const args = parseCliArgs(Bun.argv.slice(2));

if (args.help) {
  printHelpText();
  process.exit(0);
}

checkArgs(args);

const env = tryGetSpeechToTextEnv();
const config: SpeechTranscriberConfig = {
  openaiOrganizationId: env.openaiOrganizationId,
  openaiProjectId: env.openaiProjectId,
  openaiApiKey: env.openaiApiKey,
  skipExisting: args.skipExisting,
};
const speechToText = new SpeechToText(config);
await speechToText.convert(args.speechesDir, args.session, args.outputDir);

console.log('Done.');
