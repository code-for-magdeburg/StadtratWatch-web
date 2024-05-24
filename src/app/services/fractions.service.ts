import { Inject, Injectable, makeStateKey, PLATFORM_ID, StateKey, TransferState } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FractionDetailsDto, FractionLightDto } from '../model/Fraction';
import { isPlatformServer } from '@angular/common';


const fractionsStateKey = makeStateKey<FractionLightDto[]>('fractions');
const fractionStateKeys = new Map<string, StateKey<FractionDetailsDto>>();


@Injectable({ providedIn: 'root' })
export class FractionsService {


  private readonly isServer: boolean = false;


  constructor(private readonly http: HttpClient, private readonly transferState: TransferState,
              @Inject(PLATFORM_ID) platformId: Object) {
    this.isServer = isPlatformServer(platformId);
  }


  public async fetchFractions(electionPeriod: number): Promise<FractionLightDto[]> {

    if (this.isServer) {
      const fractions = await firstValueFrom(
        this.http.get<FractionLightDto[]>(`/assets/election-period-${electionPeriod}/fractions/all-fractions.json`)
      );
      this.transferState.set(fractionsStateKey, fractions);
      return fractions;
    } else {
      const storedData = this.transferState.get(fractionsStateKey, null);
      if (storedData) {
        return storedData;
      }
      return firstValueFrom(
        this.http.get<FractionLightDto[]>(`/assets/election-period-${electionPeriod}/fractions/all-fractions.json`)
      );
    }

  }


  public async fetchFraction(electionPeriod: number, id: string): Promise<FractionDetailsDto> {

    const fractionStateKey = fractionStateKeys.get(id)
      || makeStateKey<FractionDetailsDto>(`fraction-${id}`);

    if (this.isServer) {

      const fraction = await firstValueFrom(
        this.http.get<FractionDetailsDto>(`/assets/election-period-${electionPeriod}/fractions/${id}.json`)
      );
      this.transferState.set(fractionStateKey, fraction);

      return fraction;

    } else {

      const storedData = this.transferState.get(fractionStateKey, null);
      if (storedData) {
        return storedData;
      }

      return firstValueFrom(
        this.http.get<FractionDetailsDto>(`/assets/election-period-${electionPeriod}/fractions/${id}.json`)
      );

    }

  }


}
