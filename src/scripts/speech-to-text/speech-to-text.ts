import * as fs from '@std/fs';
import * as path from '@std/path';
import { OpenAI } from 'npm:openai';


export type SpeechTranscriberConfig = {
  openaiOrganizationId: string;
  openaiProjectId: string;
  openaiApiKey: string;
  skipExisting: boolean;
};


export class SpeechToText {


  constructor(private readonly config: SpeechTranscriberConfig) {}


  public async convert(speechesDir: string, session: string, outputDir: string) {

    const openai = new OpenAI({
      organization: this. config.openaiOrganizationId,
      project: this.config.openaiProjectId,
      apiKey: this.config.openaiApiKey
    });

    const sessionSpeechesWithTranscriptionsFilename = path.join(
      outputDir,
      `session-speeches-with-transcriptions-${session}.json`
    );
    const sessionSpeechesFileName = path.join(outputDir, `session-speeches-${session}.json`);
    const sessionSpeeches = fs.existsSync(sessionSpeechesWithTranscriptionsFilename)
      ? JSON.parse(Deno.readTextFileSync(sessionSpeechesWithTranscriptionsFilename))
      : JSON.parse(Deno.readTextFileSync(sessionSpeechesFileName));
    for (const speech of sessionSpeeches) {

      const { start, speaker, isChairPerson, transcription } = speech;

      if (this.config.skipExisting && transcription) {
        console.log(`Skipping existing transcription for ${speaker} at ${start}.`);
        continue;
      }

      if (isChairPerson) {
        speech.transcription = null;
        continue;
      }

      const startPadded = start.toString().padStart(6, '0');
      const speakerName = speaker.replaceAll(' ', '_');
      const speechAudioFilename = path.join(speechesDir, `${startPadded}-${speakerName}.mp3`);

      if (fs.existsSync(speechAudioFilename)) {

        console.log(`Transcribing ${speechAudioFilename}...`);

        try {

          const transcription  = await this.transcribe(openai, speechAudioFilename);
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            temperature: 0,
            messages: [
              {
                role: 'system',
                content: 'Format the text to make it more readable by dividing it into paragraphs. Do not change anything else. Create paragraphs only if necessary. If the text is already short enough, do not create paragraphs.'
              },
              {
                role: 'user',
                content: transcription
              }
            ]
          });
          speech.transcription = completion.choices[0].message.content;

        } catch (e) {
          console.error(`Error transcribing ${speechAudioFilename}`, e);
        }

      } else {
        console.warn(`Audio file ${speechAudioFilename} not found.`);
        speech.transcription = null;
      }

    }

    Deno.writeTextFileSync(
      sessionSpeechesWithTranscriptionsFilename,
      JSON.stringify(sessionSpeeches, null, 2)
    );

  }


  private async transcribe(openai: OpenAI, speechFilename: string): Promise<string> {

    const fileBuffer = await Deno.readFile(speechFilename);
    const file = new File([fileBuffer], speechFilename, { type: 'audio/mpeg' });
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'de'
    });

    return transcription.text;

  }


}
