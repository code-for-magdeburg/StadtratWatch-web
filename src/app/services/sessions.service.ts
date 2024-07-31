import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SessionDetailsDto, SessionLightDto } from '../model/Session';


@Injectable({ providedIn: 'root' })
export class SessionsService {


  constructor(private readonly http: HttpClient) {
  }


  public async fetchSessions(electoralPeriod: string): Promise<SessionLightDto[]> {

    return firstValueFrom(
      this.http.get<SessionLightDto[]>(`/assets/electoral-periods/${electoralPeriod}/sessions/all-sessions.json`)
    );

  }


  public async fetchSession(electoralPeriod: string, id: string): Promise<SessionDetailsDto> {

    return firstValueFrom(
      this.http.get<SessionDetailsDto>(`/assets/electoral-periods/${electoralPeriod}/sessions/${id}.json`)
    );

  }


}
