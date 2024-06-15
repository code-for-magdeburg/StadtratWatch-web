import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FactionDetailsDto, FactionLightDto } from '../model/Faction';


@Injectable({ providedIn: 'root' })
export class FactionsService {


  constructor(private readonly http: HttpClient) {
  }


  public async fetchFactions(electoralPeriod: number): Promise<FactionLightDto[]> {

    return firstValueFrom(
      this.http.get<FactionLightDto[]>(`/assets/electoral-period-${electoralPeriod}/factions/all-factions.json`)
    );

  }


  public async fetchFaction(electoralPeriod: number, id: string): Promise<FactionDetailsDto> {

    return firstValueFrom(
      this.http.get<FactionDetailsDto>(`/assets/electoral-period-${electoralPeriod}/factions/${id}.json`)
    );

  }


}
