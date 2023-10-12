import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PartyDto } from '../model/Party';
import { HttpClient } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class PartiesService {

  constructor(private readonly http: HttpClient) { }


  public fetchParties = (): Observable<PartyDto[]> =>
    this.http.get<PartyDto[]>(`assets/generated/parties/all-parties.json`);


  public fetchParty = (id: string): Observable<PartyDto> =>
    this.http.get<PartyDto>(`assets/generated/parties/${id}.json`);


}
