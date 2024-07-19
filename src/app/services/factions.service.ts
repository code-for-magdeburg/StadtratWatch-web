import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FactionDetailsDto, FactionLightDto } from '../model/Faction';


@Injectable({ providedIn: 'root' })
export class FactionsService {


  constructor(private readonly http: HttpClient) {
  }


  public async fetchFactions(electoralPeriod: string): Promise<FactionLightDto[]> {

    return firstValueFrom(
      this.http.get<FactionLightDto[]>(`/assets/electoral-periods/${electoralPeriod}/factions/all-factions.json`)
    );

  }


  public async fetchFaction(electoralPeriod: string, id: string): Promise<FactionDetailsDto> {

    return firstValueFrom(
      this.http.get<FactionDetailsDto>(`/assets/electoral-periods/${electoralPeriod}/factions/${id}.json`)
    );

  }


}
