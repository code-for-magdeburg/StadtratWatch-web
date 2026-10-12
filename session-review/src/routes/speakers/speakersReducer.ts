import { produce } from 'immer';
import type { Speaker, Speech } from '../../types';

export interface SpeakersState {
  speakers: Speaker[];
  selectedIndex: number;
}

export type SpeakersAction =
  | { type: 'init'; speakers: Speaker[] }
  | { type: 'select'; index: number }
  | { type: 'rename'; name: string }
  | { type: 'remove' }
  | { type: 'compact' };

export const initialSpeakersState: SpeakersState = { speakers: [], selectedIndex: -1 };

export const speakersReducer = produce(
  (draft: SpeakersState, action: SpeakersAction) => {
    switch (action.type) {
      case 'init':
        draft.speakers = action.speakers;
        draft.selectedIndex = action.speakers.length > 0 ? 0 : -1;
        break;

      case 'select':
        draft.selectedIndex = action.index;
        break;

      case 'rename': {
        const current = draft.speakers[draft.selectedIndex];
        if (current) current.speaker = action.name;
        break;
      }

      case 'remove': {
        // Verbatim: filter out every entry sharing the selected speaker's name.
        const selected = draft.speakers[draft.selectedIndex];
        if (!selected) break;
        draft.speakers = draft.speakers.filter((s) => s.speaker !== selected.speaker);
        draft.selectedIndex = draft.speakers.length > 0 ? 0 : -1;
        break;
      }

      case 'compact': {
        // Merge entries sharing a speaker name (keep first), concat + sort segments.
        const merged = new Map<string, Speaker>();
        for (const speaker of draft.speakers) {
          const existing = merged.get(speaker.speaker);
          if (existing) {
            existing.segments = existing.segments.concat(speaker.segments);
            existing.segments.sort((a, b) => a.start - b.start);
          } else {
            merged.set(speaker.speaker, speaker);
          }
        }
        draft.speakers = Array.from(merged.values());
        draft.selectedIndex = draft.speakers.length > 0 ? 0 : -1;
        break;
      }
    }
  },
);

// generateSpeeches — ported verbatim from speakers.component.ts:106.
export function generateSpeeches(speakers: Speaker[]): Speech[] {
  const speeches: Speech[] = [];

  speakers.forEach((speakingTime) => {
    const speechesOfSpeaker: Speaker['segments'][] = [];

    let speechSegments: Speaker['segments'] = [];
    for (let i = 0; i < speakingTime.segments.length; i++) {
      const segment = speakingTime.segments[i];
      const nextSegment = speakingTime.segments[i + 1];
      speechSegments.push(segment);
      if (nextSegment && nextSegment.start - segment.start - segment.duration > 10) {
        speechesOfSpeaker.push(speechSegments);
        speechSegments = [];
      }
      if (!nextSegment) {
        speechesOfSpeaker.push(speechSegments);
      }
    }

    const relevantSpeeches = speechesOfSpeaker
      .map((segs) => {
        const firstSegment = segs[0];
        const lastSegment = segs[segs.length - 1];
        return {
          speaker: speakingTime.speaker,
          start: Math.floor(firstSegment.start),
          duration: Math.ceil(lastSegment.start + lastSegment.duration - firstSegment.start),
        };
      })
      .filter((speech) => speech.duration > 5);

    speeches.push(...relevantSpeeches);
  });

  speeches.sort((a, b) => a.start - b.start);

  return speeches;
}
