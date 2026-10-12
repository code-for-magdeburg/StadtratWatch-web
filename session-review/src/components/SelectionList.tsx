import type { ReactNode } from 'react';
import styles from './SelectionList.module.css';

interface Props<T> {
  items: T[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  render: (item: T) => ReactNode;
}

// Single-select list, index-based selection.
export function SelectionList<T>({ items, selectedIndex, onSelect, render }: Props<T>) {
  return (
    <ul className={styles.list}>
      {items.map((item, index) => (
        <li key={index}>
          <button
            type="button"
            className={`${styles.item} ${index === selectedIndex ? styles.selected : ''}`}
            onClick={() => onSelect(index)}
          >
            {render(item)}
          </button>
        </li>
      ))}
    </ul>
  );
}
