import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PersonDetailsDto, PersonLightDto } from '../model/Person';


@Injectable({ providedIn: 'root' })
export class PersonsService {


  constructor(private readonly http: HttpClient) {
  }


  public fetchPersons = (): Observable<PersonLightDto[]> =>
    this.http.get<PersonLightDto[]>(`/assets/generated/persons/all-persons.json`);


  public fetchPerson = (id: string): Observable<PersonDetailsDto> =>
    this.http.get<PersonDetailsDto>(`/assets/generated/persons/${id}.json`);


  public fetchPersonsByFraction = (fractionId: string): Observable<PersonLightDto[]> =>
    this.http
      .get<PersonLightDto[]>(`/assets/generated/persons/all-persons.json`)
      .pipe(
        map(allPersons =>
          allPersons.filter(person => person.fractionId === fractionId)
        )
      );


  public fetchPersonsByParty = (partyId: string): Observable<PersonLightDto[]> =>
    this.http
      .get<PersonLightDto[]>(`/assets/generated/persons/all-persons.json`)
      .pipe(
        map(allPersons =>
          allPersons.filter(person => person.partyId === partyId)
        )
      );


  public fetchAllPersonsForces = (): Observable<any> =>
    this.http.get<any>(`/assets/generated/persons/all-persons-forces.json`);


}
