import { Component, QueryList, ViewChildren } from '@angular/core';
import { FractionDto } from '../model/Fraction';
import { FractionsService } from '../services/fractions.service';
import { compare, SortableFractionsDirective, SortFractionsEvent } from './sortable-fractions.directive';


@Component({
  selector: 'app-fractions',
  templateUrl: './fractions.component.html',
  styleUrls: ['./fractions.component.scss']
})
export class FractionsComponent {


  private data: FractionDto[] = [];

  public fractions: FractionDto[] = [];
  public sortedFractions: FractionDto[] = [];

  @ViewChildren(SortableFractionsDirective) headers: QueryList<SortableFractionsDirective> | undefined;


  constructor(private readonly fractionsService: FractionsService) {
  }


  //noinspection JSUnusedGlobalSymbols
  ngOnInit() {

    this.fractionsService
      .fetchFractions()
      .subscribe(fractions => {
        this.fractions = this.sortedFractions = this.data = fractions;
        this.sortedFractions.sort((a, b) => b.membersCount - a.membersCount);
      });

  }


  onSort(sortEvent: SortFractionsEvent) {

    if (!this.headers) {
      return;
    }

    this.headers.forEach((header) => {
      if (header.sortableFractions !== sortEvent.column) {
        header.direction = '';
      }
    });

    if (sortEvent.direction === '' || sortEvent.column === '') {
      this.sortedFractions = this.data;
    } else {
      this.sortedFractions = [...this.data].sort((a, b) => {
        const aValue = sortEvent.column === '' ? '' : a[sortEvent.column];
        const bValue = sortEvent.column === '' ? '' : b[sortEvent.column];
        const res = compare(aValue, bValue);
        return sortEvent.direction === 'asc' ? res : -res;
      });
    }

  }


}
