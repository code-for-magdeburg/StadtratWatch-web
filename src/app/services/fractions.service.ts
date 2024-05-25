import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FractionDetailsDto, FractionLightDto } from '../model/Fraction';


@Injectable({ providedIn: 'root' })
export class FractionsService {


  constructor(private readonly http: HttpClient) {
  }


  public async fetchFractions(electionPeriod: number): Promise<FractionLightDto[]> {

    return firstValueFrom(
      this.http.get<FractionLightDto[]>(`/assets/election-period-${electionPeriod}/fractions/all-fractions.json`)
    );

  }


  public async fetchFraction(electionPeriod: number, id: string): Promise<FractionDetailsDto> {

    return firstValueFrom(
      this.http.get<FractionDetailsDto>(`/assets/election-period-${electionPeriod}/fractions/${id}.json`)
    );

  }


}
