import { Component, QueryList, ViewChildren } from '@angular/core';
import { PartiesService } from '../services/parties.service';
import { PartyDto } from '../model/Party';
import { compare, SortablePartiesDirective, SortPartiesEvent } from './sortable-parties.directive';


@Component({
  selector: 'app-parties',
  templateUrl: './parties.component.html',
  styleUrls: ['./parties.component.scss']
})
export class PartiesComponent {


  private data: PartyDto[] = [];

  public parties: PartyDto[] = [];
  public sortedParties: PartyDto[] = [];

  @ViewChildren(SortablePartiesDirective) headers: QueryList<SortablePartiesDirective> | undefined;


  constructor(private readonly partiesService: PartiesService) {
  }


  //noinspection JSUnusedGlobalSymbols
  ngOnInit() {

    this.partiesService
      .fetchParties()
      .subscribe(parties => {
        this.parties = this.sortedParties = this.data = parties;
        this.sortedParties.sort((a, b) => b.seats - a.seats);
      });

  }


  onSort(sortEvent: SortPartiesEvent) {

    if (!this.headers) {
      return;
    }

    this.headers.forEach((header) => {
      if (header.sortableParties !== sortEvent.column) {
        header.direction = '';
      }
    });

    if (sortEvent.direction === '' || sortEvent.column === '') {
      this.sortedParties = this.data;
    } else {
      this.sortedParties = [...this.data].sort((a, b) => {
        const aValue = sortEvent.column === '' ? '' : a[sortEvent.column];
        const bValue = sortEvent.column === '' ? '' : b[sortEvent.column];
        const res = compare(aValue, bValue);
        return sortEvent.direction === 'asc' ? res : -res;
      });
    }

  }


}
