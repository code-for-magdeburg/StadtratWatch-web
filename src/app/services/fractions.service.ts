import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FractionDto } from '../model/Fraction';


@Injectable({ providedIn: 'root' })
export class FractionsService {

  constructor(private readonly http: HttpClient) {
  }


  public fetchFractions = (): Observable<FractionDto[]> =>
    this.http.get<FractionDto[]>(`assets/generated/fractions/all-fractions.json`);


  public fetchFraction = (id: string): Observable<FractionDto> =>
    this.http.get<FractionDto>(`assets/generated/fractions/${id}.json`);


}
