import { Inject, Injectable, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PartyDto } from '../model/Party';
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';


const partiesStateKey = makeStateKey<PartyDto[]>('parties');
const partyStateKey = makeStateKey<PartyDto>('party');


@Injectable({ providedIn: 'root' })
export class PartiesService {


  private readonly isServer: boolean = false;


  constructor(private readonly http: HttpClient, private readonly transferState: TransferState,
              @Inject(PLATFORM_ID) platformId: Object) {
    this.isServer = isPlatformServer(platformId);
  }


  public async fetchParties(): Promise<PartyDto[]> {

    if (this.isServer) {
      const parties = await firstValueFrom(this.http.get<PartyDto[]>(`/assets/generated/parties/all-parties.json`));
      this.transferState.set(partiesStateKey, parties);
      return parties;
    } else {
      const storedData = this.transferState.get(partiesStateKey, null);
      if (storedData) {
        return storedData;
      }
      return firstValueFrom(this.http.get<PartyDto[]>(`/assets/generated/parties/all-parties.json`));
    }

  }


  public async fetchParty(id: string): Promise<PartyDto> {

    console.log('a');
    if (this.isServer) {
      console.log('b');
      const party = await firstValueFrom(this.http.get<PartyDto>(`/assets/generated/parties/${id}.json`));
      console.log('c');
      this.transferState.set(partyStateKey, party);
      console.log('d');
      return party;
    } else {
      console.log('e');
      const storedData = this.transferState.get(partyStateKey, null);
      console.log('f');
      if (storedData) {
        console.log('g');
        return storedData;
      }
      console.log('h');
      return firstValueFrom(this.http.get<PartyDto>(`/assets/generated/parties/${id}.json`));
    }

  }


}
