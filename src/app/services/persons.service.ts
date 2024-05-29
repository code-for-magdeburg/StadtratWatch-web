import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PersonDetailsDto, PersonLightDto } from '../model/Person';


@Injectable({ providedIn: 'root' })
export class PersonsService {


  constructor(private readonly http: HttpClient) {
  }


  public async fetchPersons(electionPeriod: number): Promise<PersonLightDto[]> {

    return firstValueFrom(
      this.http.get<PersonLightDto[]>(`/assets/election-period-${electionPeriod}/persons/all-persons.json`)
    );

  }


  public async fetchPerson(electionPeriod: number, id: string): Promise<PersonDetailsDto> {

    return firstValueFrom(
      this.http.get<PersonDetailsDto>(`/assets/election-period-${electionPeriod}/persons/${id}.json`)
    );

  }


  public async fetchPersonsByFraction(electionPeriod: number, fractionId: string): Promise<PersonLightDto[]> {

    const allPersons = await this.fetchPersons(electionPeriod);
    return allPersons.filter(person => person.fractionId === fractionId);

  }


  public async fetchPersonsByParty(electionPeriod: number, partyId: string): Promise<PersonLightDto[]> {

    const allPersons = await this.fetchPersons(electionPeriod);
    return allPersons.filter(person => person.partyId === partyId);

  }


  public async fetchAllPersonsForces(electionPeriod: number): Promise<any> {

    return firstValueFrom(
      this.http.get<any>(`/assets/election-period-${electionPeriod}/persons/all-persons-forces.json`)
    );

  }


}
