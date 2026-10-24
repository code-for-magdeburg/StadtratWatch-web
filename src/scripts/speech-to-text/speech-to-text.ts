import * as path from 'node:path';

import { OpenAI } from 'openai';

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
      organization: this.config.openaiOrganizationId,
      project: this.config.openaiProjectId,
      apiKey: this.config.openaiApiKey,
    });

    const sessionSpeechesWithTranscriptionsFilename = path.join(
      outputDir,
      `session-speeches-with-transcriptions-${session}.json`,
    );
    const sessionSpeechesFileName = path.join(outputDir, `session-speeches-${session}.json`);
    const sessionSpeechesWithTranscriptionsFile = Bun.file(sessionSpeechesWithTranscriptionsFilename);
    const sessionSpeeches = (await sessionSpeechesWithTranscriptionsFile.exists())
      ? await sessionSpeechesWithTranscriptionsFile.json()
      : await Bun.file(sessionSpeechesFileName).json();
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

      if (await Bun.file(speechAudioFilename).exists()) {
        console.log(`Transcribing ${speechAudioFilename}...`);

        try {
          const transcription = await this.transcribe(openai, speechAudioFilename);
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            temperature: 0,
            messages: [
              {
                role: 'system',
                content:
                  "Format the text to make it more readable by dividing it into paragraphs. Do not change anything else. Create paragraphs only if necessary. If the text is already short enough, do not create paragraphs. And just transcribe the text, don't act as a third-person narrator.",
              },
              {
                role: 'user',
                content: transcription,
              },
            ],
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

    await Bun.write(sessionSpeechesWithTranscriptionsFilename, JSON.stringify(sessionSpeeches, null, 2));
  }

  private async transcribe(openai: OpenAI, speechFilename: string): Promise<string> {
    const fileBuffer = await Bun.file(speechFilename).bytes();
    const file = new File([fileBuffer], speechFilename, { type: 'audio/mpeg' });
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'gpt-4o-transcribe',
      language: 'de',
    });

    return transcription.text;
  }
}
