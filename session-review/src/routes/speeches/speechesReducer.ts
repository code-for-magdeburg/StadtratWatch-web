import { produce } from 'immer';
import type { Speech } from '../../types';

export interface SpeechesState {
  speeches: Speech[];
  selectedIndex: number;
}

export type SpeechesAction =
  | { type: 'init'; speeches: Speech[] }
  | { type: 'select'; index: number }
  | { type: 'setChairPerson'; value: boolean }
  | { type: 'setOnBehalfOf'; value: string }
  | { type: 'toggleChairByName'; name: string };

export const initialSpeechesState: SpeechesState = { speeches: [], selectedIndex: -1 };

export const speechesReducer = produce(
  (draft: SpeechesState, action: SpeechesAction) => {
    switch (action.type) {
      case 'init':
        draft.speeches = action.speeches;
        draft.selectedIndex = action.speeches.length > 0 ? 0 : -1;
        break;

      case 'select':
        draft.selectedIndex = action.index;
        break;

      case 'setChairPerson': {
        const current = draft.speeches[draft.selectedIndex];
        if (current) current.isChairPerson = action.value;
        break;
      }

      case 'setOnBehalfOf': {
        const current = draft.speeches[draft.selectedIndex];
        if (current) current.onBehalfOf = action.value;
        break;
      }

      case 'toggleChairByName':
        // Verbatim: flip isChairPerson across all speeches of that speaker.
        draft.speeches
          .filter((s) => s.speaker === action.name)
          .forEach((s) => {
            s.isChairPerson = !s.isChairPerson;
          });
        break;
    }
  },
);

// Strip isChairPerson when false before serializing (verbatim save behavior).
export function speechesForSave(speeches: Speech[]): Speech[] {
  return speeches.map((speech) => {
    if (speech.isChairPerson === false) {
      const { isChairPerson, ...rest } = speech;
      return rest;
    }
    return speech;
  });
}

// 5-column split — sequential splice, verbatim from speeches-selection.component.ts:25.
// NOT an even split (8 → 2/2/2/1/1). Returns each column with its global start offset.
export function splitColumns(speeches: Speech[]): { items: Speech[]; offset: number }[] {
  const rest = speeches.slice();
  const list1 = rest.splice(0, Math.ceil(rest.length / 5));
  const offset1 = list1.length;
  const list2 = rest.splice(0, Math.ceil(rest.length / 4));
  const offset2 = offset1 + list2.length;
  const list3 = rest.splice(0, Math.ceil(rest.length / 3));
  const offset3 = offset2 + list3.length;
  const list4 = rest.splice(0, Math.ceil(rest.length / 2));
  const offset4 = offset3 + list4.length;
  const list5 = rest;
  return [
    { items: list1, offset: 0 },
    { items: list2, offset: offset1 },
    { items: list3, offset: offset2 },
    { items: list4, offset: offset3 },
    { items: list5, offset: offset4 },
  ];
}
