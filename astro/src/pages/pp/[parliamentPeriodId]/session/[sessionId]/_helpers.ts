import type { SessionSpeech } from '@models/session-speech.ts';
import type { Registry, RegistrySession } from '@models/registry.ts';
import { formatSpeakingTime } from '@utils/format-time.ts';
import { getFactionOfPerson, getPersonByName } from '@utils/session-utils.ts';

export type SpeakingTimesChartDataPoint = {
  value: number;
  speakerId: string;
  label: string;
};

export function getSpeakingTimesChartData(
  parliamentPeriod: Registry,
  session: RegistrySession,
  sessionSpeeches: SessionSpeech[],
): SpeakingTimesChartDataPoint[] {
  const speechesGroupedBySpeaker = sessionSpeeches
    .filter(
      (speech) =>
        !speech.isChairPerson && speech.duration && speech.transcription,
    )
    .filter((speech) => !!getPersonByName(parliamentPeriod, session, speech.speaker))
    .reduce(
      (obj, speech) => {
        obj[speech.speaker] = (obj[speech.speaker] || 0) + speech.duration;
        return obj;
      },
      {} as Record<string, number>,
    );

  return Object.entries(speechesGroupedBySpeaker)
    .map(([speaker, totalDurationSeconds]) => ({
      person: getPersonByName(parliamentPeriod, session, speaker),
      totalDurationSeconds: Math.round(totalDurationSeconds / 10) * 10,
    }))
    .filter((speech) => !!speech.person)
    .map((speech) => ({
      ...speech,
      person: speech.person!
    }))
    .toSorted((a, b) => b.totalDurationSeconds - a.totalDurationSeconds)
    .map((speech) => {
      const faction = getFactionOfPerson(parliamentPeriod, session, speech.person)
      return {
        value: speech.totalDurationSeconds,
        speakerId: speech.person.id,
        label: generateSpeakingTimesBarLabel(
          speech.person.name,
          faction?.name || null,
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
