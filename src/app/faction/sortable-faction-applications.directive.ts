import { Directive, EventEmitter, Input, Output } from '@angular/core';


export interface FactionApplication {
  votingDate: string;
  typeAndId: string;
  title: string;
  result: string;
}


export type SortFactionApplicationsColumn = keyof FactionApplication | '';
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


export interface SortFactionApplicationsEvent {
  column: SortFactionApplicationsColumn;
  direction: SortDirection;
}


@Directive({
  selector: 'th[sortableFactionApplications]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()',
  },
})
export class SortableFactionApplicationsDirective {


  @Input() sortableFactionApplications: SortFactionApplicationsColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortFactionApplicationsEvent>();


  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortableFactionApplications, direction: this.direction });
  }


}
