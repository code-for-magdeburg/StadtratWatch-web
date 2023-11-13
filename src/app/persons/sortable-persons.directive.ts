import { Directive, EventEmitter, Input, Output } from '@angular/core';


export interface Person {
  name: string;
  fraction: string;
  party: string;
  votingAttendance: number;
  votingSuccessRate: number;
  abstentionRate: number;
}


export type SortPersonsColumn = keyof Person | '';
export type SortDirection = 'asc' | 'desc' | '';


const rotate: { [key: string]: SortDirection } = {
  asc: 'desc',
  desc: '',
  '': 'asc',
};

export const compare = (
  v1: string | number | boolean | Date,
  v2: string | number | boolean | Date
) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);


export interface SortPersonsEvent {
  column: SortPersonsColumn;
  direction: SortDirection;
}


@Directive({
  selector: 'th[sortablePersons]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()',
  },
})
export class SortablePersonsDirective {


  @Input() sortablePersons: SortPersonsColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortPersonsEvent>();


  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortablePersons, direction: this.direction });
  }


}
