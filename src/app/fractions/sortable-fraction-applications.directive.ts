import { Directive, EventEmitter, Input, Output } from '@angular/core';


export interface FractionApplication {
  votingDate: string;
  typeAndId: string;
  title: string;
  result: string;
}


export type SortFractionApplicationsColumn = keyof FractionApplication | '';
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


export interface SortFractionApplicationsEvent {
  column: SortFractionApplicationsColumn;
  direction: SortDirection;
}


@Directive({
  selector: 'th[sortableFractionApplications]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()',
  },
})
export class SortableFractionApplicationsDirective {


  @Input() sortableFractionApplications: SortFractionApplicationsColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortFractionApplicationsEvent>();


  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortableFractionApplications, direction: this.direction });
  }


}
