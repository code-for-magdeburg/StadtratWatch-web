import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PartyDto } from '../model/Party';
import { HttpClient } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class PartiesService {


  constructor(private readonly http: HttpClient) {
  }


  public async fetchParties(electionPeriod: number): Promise<PartyDto[]> {

    return firstValueFrom(
      this.http.get<PartyDto[]>(`/assets/election-period-${electionPeriod}/parties/all-parties.json`)
    );

  }


  public async fetchParty(electionPeriod: number, id: string): Promise<PartyDto> {

    return firstValueFrom(this.http.get<PartyDto>(`/assets/election-period-${electionPeriod}/parties/${id}.json`));

  }


}
