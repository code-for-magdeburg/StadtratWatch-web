import { getEntry } from 'astro:content';
import type { SessionSpeech } from '../../../../../model/session-speech.ts';
import type { SessionConfig } from '../../../../../model/session-config.ts';

export type SpeakingTimesChartDataPoint = {
    value: number;
    speakerId: string;
    label: string;
};

export async function getSpeakingTimesChartData(sessionSpeeches: SessionSpeech[], sessionConfig: SessionConfig): Promise<SpeakingTimesChartDataPoint[]> {

  const registryEntry = await getEntry('electoralPeriods', 'magdeburg-8');
  const registry = registryEntry?.data!;

  const speechesGroupedBySpeaker = sessionSpeeches
    .filter(speech => !speech.isChairPerson && speech.duration && speech.transcription)
    .filter(speech => sessionConfig.names.some(name => name.name === speech.speaker))
    .reduce((obj, speech) => {
        obj[speech.speaker] = (obj[speech.speaker] || 0) + speech.duration;
        return obj;
    }, {} as Record<string, number>);

  return Object
    .entries(speechesGroupedBySpeaker)
    .map(([speaker, totalDurationSeconds]) => ({
      speakerId: registry.persons.find(person => person.name === speaker)?.id,
      speaker,
      totalDurationSeconds: Math.round(totalDurationSeconds / 10) * 10
    }))
    .filter(speech => !!speech.speakerId)
    .toSorted((a, b) => b.totalDurationSeconds - a.totalDurationSeconds)
    .map(speech => ({
      value: speech.totalDurationSeconds,
      speakerId: speech.speakerId!,
      label: generateLabel(speech.speaker, speech.totalDurationSeconds)
    }));

}

function generateLabel(speaker: string, totalDurationSeconds: number): string {
  const hours = Math.floor(totalDurationSeconds / 3600);
  const minutes = Math.floor((totalDurationSeconds % 3600) / 60);
  const seconds = Math.floor(totalDurationSeconds % 60);

  const durationLabel = hours > 0
    ? `${hours}h ${minutes}m ${seconds}s`
    : `${minutes}m ${seconds}s`;

  return `${speaker} ${durationLabel}`;
}
