import { Inject, Injectable, makeStateKey, PLATFORM_ID, StateKey, TransferState } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PartyDto } from '../model/Party';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';


const partiesStateKey = makeStateKey<PartyDto[]>('parties');
const partyStateKeys = new Map<string, StateKey<PartyDto>>();


@Injectable({ providedIn: 'root' })
export class PartiesService {


  private readonly isServer: boolean = false;


  constructor(private readonly http: HttpClient, private readonly transferState: TransferState,
              @Inject(PLATFORM_ID) platformId: Object) {
    this.isServer = isPlatformServer(platformId);
  }


  public async fetchParties(electionPeriod: number): Promise<PartyDto[]> {

    if (this.isServer) {
      const parties = await firstValueFrom(
        this.http.get<PartyDto[]>(`/assets/election-period-${electionPeriod}/parties/all-parties.json`)
      );
      this.transferState.set(partiesStateKey, parties);
      return parties;
    } else {
      const storedData = this.transferState.get(partiesStateKey, null);
      if (storedData) {
        return storedData;
      }
      return firstValueFrom(
        this.http.get<PartyDto[]>(`/assets/election-period-${electionPeriod}/parties/all-parties.json`)
      );
    }

  }


  public async fetchParty(electionPeriod: number, id: string): Promise<PartyDto> {

    const partyStateKey = partyStateKeys.get(id) || makeStateKey<PartyDto>(`party-${id}`);

    if (this.isServer) {

      const party = await firstValueFrom(
        this.http.get<PartyDto>(`/assets/election-period-${electionPeriod}/parties/${id}.json`)
      );
      this.transferState.set(partyStateKey, party);

      return party;

    } else {

      const storedData = this.transferState.get(partyStateKey, null);
      if (storedData) {
        return storedData;
      }

      return firstValueFrom(
        this.http.get<PartyDto>(`/assets/election-period-${electionPeriod}/parties/${id}.json`)
      );

    }

  }


}
