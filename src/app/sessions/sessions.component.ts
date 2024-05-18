import { Component, OnInit } from '@angular/core';
import { SessionsService } from '../services/sessions.service';
import { SessionLightDto } from '../model/Session';


@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit {


  public sessions: SessionLightDto[] = [];


  constructor(private readonly sessionsService: SessionsService) {
  }


  async ngOnInit() {
    this.sessions = await this.sessionsService.fetchSessions();
    this.sessions.sort((a, b) => b.date.localeCompare(a.date));
  }


}
