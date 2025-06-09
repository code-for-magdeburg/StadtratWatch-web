import type { SessionConfig } from '@models/session-config.ts';
import type { SessionSpeech } from '@models/session-speech.ts';
import type { Registry } from '@models/registry.ts';
import { formatSpeakingTime } from '@utils/format-time.ts';

export type SpeakingTimesChartDataPoint = {
  value: number;
  speakerId: string;
  label: string;
};

export function getSpeakingTimesChartData(
  registry: Registry,
  sessionSpeeches: SessionSpeech[],
  sessionConfig: SessionConfig,
): SpeakingTimesChartDataPoint[] {
  const speechesGroupedBySpeaker = sessionSpeeches
    .filter(
      (speech) =>
        !speech.isChairPerson && speech.duration && speech.transcription,
    )
    .filter((speech) =>
      sessionConfig.names.some((name) => name.name === speech.speaker),
    )
    .reduce(
      (obj, speech) => {
        obj[speech.speaker] = (obj[speech.speaker] || 0) + speech.duration;
        return obj;
      },
      {} as Record<string, number>,
    );

  return Object.entries(speechesGroupedBySpeaker)
    .map(([speaker, totalDurationSeconds]) => ({
      speakerId: registry.persons.find((person) => person.name === speaker)?.id,
      speaker,
      totalDurationSeconds: Math.round(totalDurationSeconds / 10) * 10,
    }))
    .filter((speech) => !!speech.speakerId)
    .toSorted((a, b) => b.totalDurationSeconds - a.totalDurationSeconds)
    .map((speech) => {
      const faction = sessionConfig.names.find(
        (name) => name.name === speech.speaker,
      )?.faction || null;
      return {
        value: speech.totalDurationSeconds,
        speakerId: speech.speakerId!,
        label: generateSpeakingTimesBarLabel(
          speech.speaker,
          faction,
          speech.totalDurationSeconds,
        ),
      };
    });
}

function generateSpeakingTimesBarLabel(
  speaker: string,
  faction: string | null,
  totalDurationSeconds: number,
): string {
  return faction
    ? `${speaker} (${faction}) ${formatSpeakingTime(totalDurationSeconds, { showZeroHours: false })}`
    : `${speaker} ${formatSpeakingTime(totalDurationSeconds, { showZeroHours: false })}`;
}
