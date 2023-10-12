import { Component, QueryList, ViewChildren } from '@angular/core';
import { PersonsService } from '../services/persons.service';
import { PersonLightDto } from '../model/Person';
import { compare, SortablePersonsDirective, SortPersonsEvent } from '../directives/sortable-persons.directive';


@Component({
  selector: 'app-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss']
})
export class PersonsComponent {


  private data: PersonLightDto[] = [];

  public persons: PersonLightDto[] = [];


  @ViewChildren(SortablePersonsDirective) headers: QueryList<SortablePersonsDirective> | undefined;


  constructor(private readonly personsService: PersonsService) {
  }


  //noinspection JSUnusedGlobalSymbols
  ngOnInit() {
    this.personsService
      .fetchPersons()
      .subscribe(persons => {
        this.persons = this.data = persons;
        this.persons.sort((a, b) => a.name.localeCompare(b.name));
      });
  }


  onSort(sortEvent: SortPersonsEvent) {

    if (!this.headers) {
      return;
    }

    this.headers.forEach((header) => {
      if (header.sortable !== sortEvent.column) {
        header.direction = '';
      }
    });

    if (sortEvent.direction === '' || sortEvent.column === '') {
      this.persons = this.data;
    } else {
      this.persons = [...this.data].sort((a, b) => {
        const aValue = sortEvent.column === '' ? '' : a[sortEvent.column];
        const bValue = sortEvent.column === '' ? '' : b[sortEvent.column];
        const res = compare(aValue, bValue);
        return sortEvent.direction === 'asc' ? res : -res;
      });
    }

  }


}
