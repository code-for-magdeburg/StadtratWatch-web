import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PartyDto } from '../../interfaces/Party';
import { HttpClient } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class PartiesService {


  constructor(private readonly http: HttpClient) {
  }


  public async fetchParties(electoralPeriod: string): Promise<PartyDto[]> {

    return firstValueFrom(
      this.http.get<PartyDto[]>(`/assets/electoral-periods/${electoralPeriod}/parties/all-parties.json`)
    );

  }


  public async fetchParty(electoralPeriod: string, id: string): Promise<PartyDto> {

    return firstValueFrom(this.http.get<PartyDto>(`/assets/electoral-periods/${electoralPeriod}/parties/${id}.json`));

  }


}
