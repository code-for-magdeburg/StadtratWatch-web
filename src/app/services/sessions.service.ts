import { Inject, Injectable, makeStateKey, PLATFORM_ID, StateKey, TransferState } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SessionDetailsDto, SessionLightDto } from '../model/Session';
import { isPlatformServer } from '@angular/common';


const sessionsStateKey = makeStateKey<SessionLightDto[]>('sessions')
const sessionStateKeys = new Map<string, StateKey<SessionDetailsDto>>()


@Injectable({ providedIn: 'root' })
export class SessionsService {


  private readonly isServer: boolean = false;


  constructor(private readonly http: HttpClient, private readonly transferState: TransferState,
              @Inject(PLATFORM_ID) platformId: Object) {
    this.isServer = isPlatformServer(platformId);
  }


  public async fetchSessions(): Promise<SessionLightDto[]> {

    if (this.isServer) {
      const sessions = await firstValueFrom(
        this.http.get<SessionLightDto[]>(`/assets/election-period-7/sessions/all-sessions.json`)
      );
      this.transferState.set(sessionsStateKey, sessions);
      return sessions;
    } else {
      const storedData = this.transferState.get(sessionsStateKey, null);
      if (storedData) {
        return storedData;
      }
      return firstValueFrom(this.http.get<SessionLightDto[]>(`/assets/election-period-7/sessions/all-sessions.json`));
    }

  }


  public async fetchSession(id: string): Promise<SessionDetailsDto> {

    const sessionStateKey = sessionStateKeys.get(id)
      || makeStateKey<SessionDetailsDto>(`session-${id}`);

    if (this.isServer) {

      const session = await firstValueFrom(
        this.http.get<SessionDetailsDto>(`/assets/election-period-7/sessions/${id}.json`)
      );
      this.transferState.set(sessionStateKey, session);

      return session;

    } else {

      const storedData = this.transferState.get(sessionStateKey, null);
      if (storedData) {
        return storedData;
      }

      return firstValueFrom(this.http.get<SessionDetailsDto>(`/assets/election-period-7/sessions/${id}.json`));

    }

  }


}
