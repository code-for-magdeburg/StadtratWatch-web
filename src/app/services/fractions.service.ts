import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FractionDetailsDto, FractionLightDto } from '../model/Fraction';


@Injectable({ providedIn: 'root' })
export class FractionsService {

  constructor(private readonly http: HttpClient) {
  }


  public fetchFractions = (): Observable<FractionLightDto[]> =>
    this.http.get<FractionLightDto[]>(`/assets/generated/fractions/all-fractions.json`);


  public fetchFraction = (id: string): Observable<FractionDetailsDto> =>
    this.http.get<FractionDetailsDto>(`/assets/generated/fractions/${id}.json`);


}
