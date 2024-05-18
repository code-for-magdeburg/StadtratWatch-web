import { Inject, Injectable, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MetadataDto } from '../model/Metadata';
import { isPlatformServer } from '@angular/common';


const metadataStateKey = makeStateKey<MetadataDto>('data')


@Injectable({ providedIn: 'root' })
export class MetadataService {


  private readonly isServer: boolean = false;


  constructor(private readonly http: HttpClient, private readonly transferState: TransferState,
              @Inject(PLATFORM_ID) platformId: Object) {
    this.isServer = isPlatformServer(platformId);
  }


  public async fetchMetadata(): Promise<MetadataDto> {

    if (this.isServer) {
      const metadata = await firstValueFrom(
        this.http.get<MetadataDto>(`/assets/generated/metadata.json`)
      );
      this.transferState.set(metadataStateKey, metadata);
      return metadata;
    } else {
      const storedData = this.transferState.get(metadataStateKey, null);
      if (storedData) {
        return storedData;
      }
      return firstValueFrom(this.http.get<MetadataDto>(`/assets/generated/metadata.json`));
    }

  }


}
