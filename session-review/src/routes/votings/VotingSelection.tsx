import type { Voting } from '../../types';
import styles from '../../components/SelectionList.module.css';

interface Props {
  votings: Voting[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

// Sorted by videoTimestamp for display; selection maps back to the original index.
export function VotingSelection({ votings, selectedIndex, onSelect }: Props) {
  const sorted = votings
    .map((voting, index) => ({ voting, index }))
    .sort((a, b) => a.voting.videoTimestamp.localeCompare(b.voting.videoTimestamp));

  return (
    <ul className={styles.list}>
      {sorted.map(({ voting, index }) => (
        <li key={index}>
          <button
            type="button"
            className={`${styles.item} ${index === selectedIndex ? styles.selected : ''}`}
            onClick={() => onSelect(index)}
          >
            {voting.videoTimestamp}: {voting.votingSubject.agendaItem} - {voting.votingSubject.motionId}
          </button>
        </li>
      ))}
    </ul>
  );
}
