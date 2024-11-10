const fs = require('fs');
const path = require('path');
const OpenAI = require('openai').OpenAI;
const dotenv = require('dotenv');

dotenv.config();


const SESSION = '2022-09-01';
const SPEECHES_BASE_DIRECTORY = './output/speeches';
const SESSIONS_SCAN_RESULTS_DIRECTORY = './output/sessions-scan-results';
const SKIP_EXISTING = true;


async function run(session) {

    const openai = new OpenAI({
        organization: process.env.OPENAI_ORGANIZATION_ID,
        project: process.env.OPENAI_PROJECT_ID,
        apiKey: process.env.OPENAI_API_KEY,
    });

    const sessionSpeechesWithTranscriptionsFilename = path.join(
        SESSIONS_SCAN_RESULTS_DIRECTORY,
        session,
        `session-speeches-with-transcriptions-${session}.json`
    );
    const sessionSpeechesFileName = path.join(
        SESSIONS_SCAN_RESULTS_DIRECTORY,
        session,
        `session-speeches-${session}.json`
    );
    const sessionSpeeches = fs.existsSync(sessionSpeechesWithTranscriptionsFilename)
        ? JSON.parse(fs.readFileSync(sessionSpeechesWithTranscriptionsFilename, 'utf8'))
        : JSON.parse(fs.readFileSync(sessionSpeechesFileName, 'utf8'));
    for (const speech of sessionSpeeches) {

        const { start, speaker, isChairPerson, transcription } = speech;

        if (SKIP_EXISTING && transcription) {
            console.log(`Skipping existing transcription for ${speaker} at ${start}.`);
            continue;
        }

        if (isChairPerson) {
            speech.transcription = null;
            continue;
        }

        const startPadded = start.toString().padStart(6, '0');
        const speakerName = speaker.replaceAll(' ', '_');
        const speechAudioFilename = path.join(
            SPEECHES_BASE_DIRECTORY,
            session,
            `${startPadded}-${speakerName}.mp3`
        );

        if (fs.existsSync(speechAudioFilename)) {

            console.log(`Transcribing ${speechAudioFilename}...`);

            try {

                const transcription  = await transcribe(openai, session, speechAudioFilename);
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
                console.error(`Error transcribing ${speechAudioFilename}: ${e.message}`);
            }

        } else {
            console.warn(`Audio file ${speechAudioFilename} not found.`);
            speech.transcription = null;
        }

    }

    fs.writeFileSync(sessionSpeechesWithTranscriptionsFilename, JSON.stringify(sessionSpeeches, null, 2));

}


async function transcribe(openai, session, speechFile) {

    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(speechFile),
        model: 'whisper-1',
        language: 'de'
    });

    return transcription.text;

}


run(SESSION).then(_ => console.log('Done.'));
