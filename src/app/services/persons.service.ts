import { Inject, Injectable, makeStateKey, PLATFORM_ID, StateKey, TransferState } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PersonDetailsDto, PersonLightDto } from '../model/Person';
import { isPlatformServer } from '@angular/common';


const personsStateKey = makeStateKey<PersonLightDto[]>('persons');
const personByFractionStateKeys = new Map<string, StateKey<PersonLightDto[]>>();
const personByPartyStateKeys = new Map<string, StateKey<PersonLightDto[]>>();
const personStateKeys = new Map<string, StateKey<PersonDetailsDto>>();
const personsForcesStateKey = makeStateKey<any>('personsForces');


@Injectable({ providedIn: 'root' })
export class PersonsService {


  private readonly isServer: boolean = false;


  constructor(private readonly http: HttpClient, private readonly transferState: TransferState,
              @Inject(PLATFORM_ID) platformId: Object) {
    this.isServer = isPlatformServer(platformId);
  }


  public async fetchPersons(): Promise<PersonLightDto[]> {

    if (this.isServer) {

      const persons = await firstValueFrom(
        this.http.get<PersonLightDto[]>(`/assets/generated/persons/all-persons.json`)
      );
      this.transferState.set(personsStateKey, persons);

      return persons;

    } else {

      const storedData = this.transferState.get(personsStateKey, null);
      if (storedData) {
        return storedData;
      }

      return firstValueFrom(this.http.get<PersonLightDto[]>(`/assets/generated/persons/all-persons.json`));

    }

  }


  public async fetchPerson(id: string): Promise<PersonDetailsDto> {

    const personStateKey = personStateKeys.get(id)
      || makeStateKey<PersonDetailsDto>(`person-${id}`);

    if (this.isServer) {

      const person = await firstValueFrom(
        this.http.get<PersonDetailsDto>(`/assets/generated/persons/${id}.json`)
      );
      this.transferState.set(personStateKey, person);

      return person;

    } else {

      const storedData = this.transferState.get(personStateKey, null);
      if (storedData) {
        return storedData;
      }

      return firstValueFrom(this.http.get<PersonDetailsDto>(`/assets/generated/persons/${id}.json`));

    }

  }


  public async fetchPersonsByFraction(fractionId: string): Promise<PersonLightDto[]> {

    const personsByFractionStateKey = personByFractionStateKeys.get(fractionId)
      || makeStateKey<PersonLightDto[]>(`persons-by-fraction-${fractionId}`);

    if (this.isServer) {

      const allPersons = await this.fetchPersons();
      const persons = allPersons.filter(person => person.fractionId === fractionId);
      this.transferState.set(personsByFractionStateKey, persons);

      return persons;

    } else {

      const storedData = this.transferState.get(personsByFractionStateKey, null);
      if (storedData) {
        return storedData;
      }

      const allPersons = await this.fetchPersons();
      return allPersons.filter(person => person.fractionId === fractionId);

    }

  }


  public async fetchPersonsByParty(partyId: string): Promise<PersonLightDto[]> {

    const personsByPartyStateKey = personByPartyStateKeys.get(partyId)
      || makeStateKey<PersonLightDto[]>(`persons-by-party-${partyId}`);

    if (this.isServer) {

      const allPersons = await this.fetchPersons();
      const persons = allPersons.filter(person => person.partyId === partyId);
      this.transferState.set(personsByPartyStateKey, persons);

      return persons;

    } else {

      const storedData = this.transferState.get(personsByPartyStateKey, null);
      if (storedData) {
        return storedData;
      }

      const allPersons = await this.fetchPersons();
      return allPersons.filter(person => person.partyId === partyId);

    }

  }


  public async fetchAllPersonsForces(): Promise<any> {

    if (this.isServer) {

      const personsForces = await firstValueFrom(
        this.http.get<any>(`/assets/generated/persons/all-persons-forces.json`)
      );
      this.transferState.set(personsForcesStateKey, personsForces);

    } else {

      const storedData = this.transferState.get(personsForcesStateKey, null);
      if (storedData) {
        return storedData;
      }

      return firstValueFrom(this.http.get<any>(`/assets/generated/persons/all-persons-forces.json`));

    }

  }


}
