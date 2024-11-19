import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PapersDto } from '../../interfaces/web-assets/Paper';
import { HttpClient } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class PapersService {


  constructor(private readonly http: HttpClient) { }


  public async getPaper(paperId: number) {

    const batchNo = `${Math.floor(paperId / 1000)}`.padStart(4, '0');
    const papers = await firstValueFrom(
      this.http.get<PapersDto>(`/assets/papers/papers-${batchNo}.json`)
    );
    return papers.find(paper => paper.id === paperId);

  }


}
