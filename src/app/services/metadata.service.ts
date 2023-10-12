import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MetadataDto } from '../model/Metadata';


@Injectable({ providedIn: 'root' })
export class MetadataService {


  constructor(private readonly http: HttpClient) {
  }


  public fetchMetadata = (): Observable<MetadataDto> =>
    this.http.get<MetadataDto>(`assets/generated/metadata.json`);


}
