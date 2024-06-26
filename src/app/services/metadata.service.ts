import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MetadataDto } from '../model/Metadata';


@Injectable({ providedIn: 'root' })
export class MetadataService {


  constructor(private readonly http: HttpClient) {
  }


  public async fetchMetadata(electoralPeriod: number): Promise<MetadataDto> {
    return firstValueFrom(this.http.get<MetadataDto>(`/assets/electoral-period-${electoralPeriod}/metadata.json`));
  }


}
