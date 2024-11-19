import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PersonDetailsDto, PersonLightDto, PersonsForcesDto } from '../../interfaces/Person';


@Injectable({ providedIn: 'root' })
export class PersonsService {


  constructor(private readonly http: HttpClient) {
  }


  public async fetchPersons(electoralPeriod: string): Promise<PersonLightDto[]> {

    return firstValueFrom(
      this.http.get<PersonLightDto[]>(`/assets/electoral-periods/${electoralPeriod}/persons/all-persons.json`)
    );

  }


  public async fetchPerson(electoralPeriod: string, id: string): Promise<PersonDetailsDto> {

    return firstValueFrom(
      this.http.get<PersonDetailsDto>(`/assets/electoral-periods/${electoralPeriod}/persons/${id}.json`)
    );

  }


  public async fetchPersonsByFaction(electoralPeriod: string, factionId: string): Promise<PersonLightDto[]> {

    const allPersons = await this.fetchPersons(electoralPeriod);
    return allPersons.filter(person => person.factionId === factionId);

  }


  public async fetchPersonsByParty(electoralPeriod: string, partyId: string): Promise<PersonLightDto[]> {

    const allPersons = await this.fetchPersons(electoralPeriod);
    return allPersons.filter(person => person.partyId === partyId);

  }


  public async fetchAllPersonsForces(electoralPeriod: string): Promise<PersonsForcesDto> {

    return firstValueFrom(
      this.http.get<PersonsForcesDto>(`/assets/electoral-periods/${electoralPeriod}/persons/all-persons-forces.json`)
    );

  }


}
