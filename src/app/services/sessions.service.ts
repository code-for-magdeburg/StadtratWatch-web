import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionDetailsDto, SessionLightDto } from '../model/Session';


@Injectable({ providedIn: 'root' })
export class SessionsService {


  constructor(private readonly http: HttpClient) {
  }


  public fetchSessions = (): Observable<SessionLightDto[]> =>
    this.http.get<SessionLightDto[]>(`assets/generated/sessions/all-sessions.json`);


  public fetchSession = (id: string): Observable<SessionDetailsDto> =>
    this.http.get<SessionDetailsDto>(`assets/generated/sessions/${id}.json`);


}
