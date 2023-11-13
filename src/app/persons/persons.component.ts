import { Component, QueryList, ViewChildren } from '@angular/core';
import { PersonsService } from '../services/persons.service';
import { PersonLightDto } from '../model/Person';
import { compare, SortablePersonsDirective, SortPersonsEvent } from './sortable-persons.directive';


@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss']
})
export class PersonsComponent {


  private data: PersonLightDto[] = [];

  public sortedPersons: PersonLightDto[] = [];


  @ViewChildren(SortablePersonsDirective) headers: QueryList<SortablePersonsDirective> | undefined;


  constructor(private readonly personsService: PersonsService) {
  }


  //noinspection JSUnusedGlobalSymbols
  ngOnInit() {
    this.personsService
      .fetchPersons()
      .subscribe(persons => {
        this.sortedPersons = this.data = persons;
        this.sortedPersons.sort((a, b) => a.name.localeCompare(b.name));
      });
  }


  onSort(sortEvent: SortPersonsEvent) {

    if (!this.headers) {
      return;
    }

    this.headers.forEach((header) => {
      if (header.sortablePersons !== sortEvent.column) {
        header.direction = '';
      }
    });

    if (sortEvent.direction === '' || sortEvent.column === '') {
      this.sortedPersons = this.data;
    } else {
      this.sortedPersons = [...this.data].sort((a, b) => {
        const aValue = sortEvent.column === '' ? '' : a[sortEvent.column];
        const bValue = sortEvent.column === '' ? '' : b[sortEvent.column];
        const res = compare(aValue, bValue);
        return sortEvent.direction === 'asc' ? res : -res;
      });
    }

  }


}
