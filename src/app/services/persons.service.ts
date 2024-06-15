import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PersonDetailsDto, PersonLightDto } from '../model/Person';


@Injectable({ providedIn: 'root' })
export class PersonsService {


  constructor(private readonly http: HttpClient) {
  }


  public async fetchPersons(electoralPeriod: number): Promise<PersonLightDto[]> {

    return firstValueFrom(
      this.http.get<PersonLightDto[]>(`/assets/electoral-period-${electoralPeriod}/persons/all-persons.json`)
    );

  }


  public async fetchPerson(electoralPeriod: number, id: string): Promise<PersonDetailsDto> {

    return firstValueFrom(
      this.http.get<PersonDetailsDto>(`/assets/electoral-period-${electoralPeriod}/persons/${id}.json`)
    );

  }


  public async fetchPersonsByFaction(electoralPeriod: number, factionId: string): Promise<PersonLightDto[]> {

    const allPersons = await this.fetchPersons(electoralPeriod);
    return allPersons.filter(person => person.factionId === factionId);

  }


  public async fetchPersonsByParty(electoralPeriod: number, partyId: string): Promise<PersonLightDto[]> {

    const allPersons = await this.fetchPersons(electoralPeriod);
    return allPersons.filter(person => person.partyId === partyId);

  }


  public async fetchAllPersonsForces(electoralPeriod: number): Promise<any> {

    return firstValueFrom(
      this.http.get<any>(`/assets/electoral-period-${electoralPeriod}/persons/all-persons-forces.json`)
    );

  }


}
