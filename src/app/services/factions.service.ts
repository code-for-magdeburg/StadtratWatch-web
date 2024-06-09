import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FactionDetailsDto, FactionLightDto } from '../model/Faction';


@Injectable({ providedIn: 'root' })
export class FactionsService {


  constructor(private readonly http: HttpClient) {
  }


  public async fetchFactions(electionPeriod: number): Promise<FactionLightDto[]> {

    return firstValueFrom(
      this.http.get<FactionLightDto[]>(`/assets/election-period-${electionPeriod}/factions/all-factions.json`)
    );

  }


  public async fetchFaction(electionPeriod: number, id: string): Promise<FactionDetailsDto> {

    return firstValueFrom(
      this.http.get<FactionDetailsDto>(`/assets/election-period-${electionPeriod}/factions/${id}.json`)
    );

  }


}
