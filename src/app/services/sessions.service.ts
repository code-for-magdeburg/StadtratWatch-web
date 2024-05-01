import { Inject, Injectable, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { SessionDetailsDto, SessionLightDto } from '../model/Session';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';


const sessionsStateKey = makeStateKey<SessionLightDto[]>('sessions')
const sessionStateKey = makeStateKey<SessionDetailsDto>('session')


@Injectable({ providedIn: 'root' })
export class SessionsService {


  private readonly isServer: boolean = false;
  private readonly isBrowser: boolean = false;


  constructor(private readonly http: HttpClient, private readonly transferState: TransferState,
              @Inject(PLATFORM_ID) platformId: Object) {
    this.isServer = isPlatformServer(platformId);
    this.isBrowser = isPlatformBrowser(platformId);
  }


  public async fetchSessions(): Promise<SessionLightDto[]> {

    if (this.isServer) {
      console.log('[SERVER] fetching sessions');
      const sessions = await firstValueFrom(this.http.get<SessionLightDto[]>(`/assets/generated/sessions/all-sessions.json`));
      console.log(sessions);
      this.transferState.set(sessionsStateKey, sessions);
      return sessions;
    } else {
      const storedData = this.transferState.get(sessionsStateKey, null);
      if (storedData) {
        console.log('[BROWSER] fetching sessions from transfer state');
        return storedData;
      }
      console.log('[BROWSER] fetching sessions from http');
      return firstValueFrom(this.http.get<SessionLightDto[]>(`/assets/generated/sessions/all-sessions.json`));
    }

  }


  public async fetchSession(id: string): Promise<SessionDetailsDto> {

    if (this.isServer) {
      const session = await firstValueFrom(this.http.get<SessionDetailsDto>(`/assets/generated/sessions/${id}.json`));
      this.transferState.set(sessionStateKey, session);
      return session;
    } else {
      const storedData = this.transferState.get(sessionStateKey, null);
      if (storedData) {
        return storedData;
      }
      return firstValueFrom(this.http.get<SessionDetailsDto>(`/assets/generated/sessions/${id}.json`));
    }

  }


}
