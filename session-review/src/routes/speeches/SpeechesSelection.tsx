import type { Speech } from '../../types';
import { secondsToTimestamp } from '../../utils/time';
import { splitColumns } from './speechesReducer';
import styles from '../../components/SelectionList.module.css';

interface Props {
  speeches: Speech[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function speechColor(speech: Speech): string {
  if (speech.isChairPerson) return 'lightgrey';
  if (speech.duration < 10 && !speech.isChairPerson) return 'red';
  return '';
}

export function SpeechesSelection({ speeches, selectedIndex, onSelect }: Props) {
  const columns = splitColumns(speeches);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {columns.map((column, ci) => (
        <ul key={ci} className={styles.list} style={{ flex: 1 }}>
          {column.items.map((speech, i) => {
            const globalIndex = column.offset + i;
            return (
              <li key={globalIndex}>
                <button
                  type="button"
                  className={`${styles.item} ${globalIndex === selectedIndex ? styles.selected : ''}`}
                  style={{ color: speechColor(speech) }}
                  onClick={() => onSelect(globalIndex)}
                >
                  {secondsToTimestamp(speech.start)} - {speech.speaker} ({speech.duration}s)
                </button>
              </li>
            );
          })}
        </ul>
      ))}
    </div>
  );
}
