import { Directive, EventEmitter, Input, Output } from '@angular/core';


export interface Party {
  name: string;
  seats: number;
  votingsSuccessRate: number;
  uniformityScore: number;
  participationRate: number;
  abstentionRate: number;
  speakingTime: number;
}


export type SortPartiesColumn = keyof Party | '';
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


export interface SortPartiesEvent {
  column: SortPartiesColumn;
  direction: SortDirection;
}


@Directive({
  selector: 'th[sortableParties]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()',
  },
})
export class SortablePartiesDirective {


  @Input() sortableParties: SortPartiesColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortPartiesEvent>();


  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortableParties, direction: this.direction });
  }


}
