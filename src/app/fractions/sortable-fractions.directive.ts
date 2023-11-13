import { Directive, EventEmitter, Input, Output } from '@angular/core';


export interface Fraction {
  name: string;
  membersCount: number;
  applicationsSuccessRate: number;
  uniformityScore: number;
}


export type SortFractionsColumn = keyof Fraction | '';
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


export interface SortFractionsEvent {
  column: SortFractionsColumn;
  direction: SortDirection;
}


@Directive({
  selector: 'th[sortableFractions]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()',
  },
})
export class SortableFractionsDirective {


  @Input() sortableFractions: SortFractionsColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortFractionsEvent>();


  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortableFractions, direction: this.direction });
  }


}
