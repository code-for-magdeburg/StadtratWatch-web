import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SessionDetailsDto, SessionLightDto } from '../model/Session';


@Injectable({ providedIn: 'root' })
export class SessionsService {


  constructor(private readonly http: HttpClient) {
  }


  public async fetchSessions(electionPeriod: number): Promise<SessionLightDto[]> {

    return firstValueFrom(
      this.http.get<SessionLightDto[]>(`/assets/election-period-${electionPeriod}/sessions/all-sessions.json`)
    );

  }


  public async fetchSession(electionPeriod: number, id: string): Promise<SessionDetailsDto> {

    return firstValueFrom(
      this.http.get<SessionDetailsDto>(`/assets/election-period-${electionPeriod}/sessions/${id}.json`)
    );

  }


}
