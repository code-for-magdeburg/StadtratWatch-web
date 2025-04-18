import type { SessionConfig } from '@models/session-config.ts';
import type { SessionSpeech } from '@models/session-speech.ts';
import type { Registry } from '@models/registry.ts';
import { formatSpeakingTime } from '@utils/format-time.ts';

export function getFactionName(
  speaker: string,
  config: SessionConfig,
): string | null {
  return config.names.find((name) => name.name === speaker)?.faction || null;
}

export function getYoutubeUrl(baseUrl: string, start: number): string {
  return `${baseUrl}?t=${start}`;
}

export function getLinkTitle(speaker: string, date: string): string {
  const formattedDate = new Date(date).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return `Redebeitrag von ${speaker} am ${formattedDate}`;
}

export function getHintMailHref(speech: SessionSpeech, date: string): string {
  const formattedDate = new Date(date).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const subject = encodeURIComponent(
    `Hinweis zum Redebeitrag von ${speech.speaker} am ${formattedDate}`,
  );
  const hintMailBodyText = encodeURIComponent(
    `Hallo StadtratWatch-Team!

Ich habe einen Hinweis zum Redebeitrag von ${speech.speaker} aus der Sitzung vom ${formattedDate} (Zeitmarke: ${speech.start}):




Mit freundlichen Grüßen,

`,
  );
  return `mailto:stadtratwatch@gmail.com?subject=${subject}&body=${hintMailBodyText}`;
}

export function getHintMailTitle(speech: SessionSpeech): string {
  return `Hinweis zum Redebeitrag von ${speech.speaker} geben`;
}

export type SpeakingTimesChartDataPoint = {
  value: number;
  speakerId: string;
  label: string;
};

export async function getSpeakingTimesChartData(
  registry: Registry,
  sessionSpeeches: SessionSpeech[],
  sessionConfig: SessionConfig,
): Promise<SpeakingTimesChartDataPoint[]> {
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
    .map((speech) => ({
      value: speech.totalDurationSeconds,
      speakerId: speech.speakerId!,
      label: generateSpeakingTimesBarLabel(
        speech.speaker,
        speech.totalDurationSeconds,
      ),
    }));
}

function generateSpeakingTimesBarLabel(
  speaker: string,
  totalDurationSeconds: number,
): string {
  return `${speaker} ${formatSpeakingTime(totalDurationSeconds, { showZeroHours: false })}`;
}
