import { tryGetSpeechToTextEnv } from './env.ts';
import { checkArgs, parseArgs, printHelpText } from './cli.ts';
import { SpeechToText, SpeechTranscriberConfig } from './speech-to-text.ts';


const args = parseArgs(Deno.args);

if (args.help) {
  printHelpText();
  Deno.exit(0);
}

checkArgs(args);


const env = tryGetSpeechToTextEnv();
const config: SpeechTranscriberConfig = {
  openaiOrganizationId: env.openaiOrganizationId,
  openaiProjectId: env.openaiProjectId,
  openaiApiKey: env.openaiApiKey,
  skipExisting: args.skipExisting
};
const speechToText = new SpeechToText(config);
await speechToText.convert(args.speechesDir, args.session, args.outputDir);

console.log('Done.');
