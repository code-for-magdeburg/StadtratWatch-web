import { Component } from '@angular/core';
import { SessionsService } from '../services/sessions.service';
import { SessionLightDto } from '../model/Session';


@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent {


  public sessions: SessionLightDto[] = [];


  constructor(private readonly sessionsService: SessionsService) {
  }


  //noinspection JSUnusedGlobalSymbols
  ngOnInit() {
    this.sessionsService
      .fetchSessions()
      .subscribe(sessions => {
        this.sessions = sessions;
        this.sessions.sort((a, b) => b.date.localeCompare(a.date));
      });
  }


}
