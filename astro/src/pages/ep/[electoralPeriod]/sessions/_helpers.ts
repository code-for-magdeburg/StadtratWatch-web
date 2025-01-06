import { getEntry } from 'astro:content';
import type { RegistrySession } from '../../../../model/registry.ts';


export function groupSessionsByYearAndMonth(sessions: RegistrySession[]): Record<string, RegistrySession[]> {

  return sessions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .reduce((acc: Record<string, typeof sessions>, session) => {
      const dateParts = session.date.split('-');
      const key = `${dateParts[0]}-${dateParts[1]}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(session);
      return acc;
    }, {});

}


export async function getSessionSummary(electoralPeriodId: string, sessionId: string) {

  const sessionScanEntry = await getEntry('sessionScans', `${electoralPeriodId}/${sessionId}`);
  if (!sessionScanEntry) {
    throw new Error(`Session scan not available for session ${sessionId}`);
  }
  const sessionScan = sessionScanEntry.data;

  const sessionSpeechesEntry = await getEntry('sessionSpeeches', `${electoralPeriodId}/${sessionId}`);
  if (!sessionSpeechesEntry) {
    throw new Error(`Session speeches not available for session ${sessionId}`);
  }
  const sessionSpeeches = sessionSpeechesEntry.data.filter(
    speech => !speech.isChairPerson && !!speech.transcription
  );

  const totalSpeakingTime = sessionSpeeches.reduce(
    (acc, speech) => acc + speech.duration,
    0
  );

  return {
    votings: sessionScan.length,
    speeches: sessionSpeeches.length,
    speakingTime: formatSpeakingTime(totalSpeakingTime)
  };

}


function formatSpeakingTime(totalSeconds: number): string {

  const roundedSpeakingTime = Math.round(totalSeconds / 10) * 10;
  const hours = Math.floor(roundedSpeakingTime / 60 / 60);
  const minutes = Math.floor((roundedSpeakingTime % 3600) / 60);

  return `${hours}h ${minutes}m`;

}
