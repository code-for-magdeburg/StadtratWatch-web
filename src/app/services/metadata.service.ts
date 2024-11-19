import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MetadataDto } from '../../interfaces/Metadata';


@Injectable({ providedIn: 'root' })
export class MetadataService {


  constructor(private readonly http: HttpClient) {
  }


  public async fetchMetadata(electoralPeriod: string): Promise<MetadataDto> {
    return firstValueFrom(this.http.get<MetadataDto>(`/assets/electoral-periods/${electoralPeriod}/metadata.json`));
  }


}
