import { Directive, EventEmitter, Input, Output } from '@angular/core';


export interface Faction {
  name: string;
  seats: number;
  applicationsSuccessRate: number;
  votingsSuccessRate: number;
  uniformityScore: number;
  participationRate: number;
  abstentionRate: number;
  speakingTime: number;
}


export type SortFactionsColumn = keyof Faction | '';
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


export interface SortFactionsEvent {
  column: SortFactionsColumn;
  direction: SortDirection;
}


@Directive({
  selector: 'th[sortableFactions]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()',
  },
})
export class SortableFactionsDirective {


  @Input() sortableFactions: SortFactionsColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortFactionsEvent>();


  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortableFactions, direction: this.direction });
  }


}
