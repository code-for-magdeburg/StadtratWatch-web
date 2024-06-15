import { Component, OnInit } from '@angular/core';
import { SessionsService } from '../services/sessions.service';
import { SessionLightDto } from '../model/Session';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { ELECTORAL_PERIOD_PATH } from '../app-routing.module';


@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit {


  protected readonly ELECTORAL_PERIOD_PATH = ELECTORAL_PERIOD_PATH;

  public electoralPeriod = environment.currentElectoralPeriod;
  public sessions: SessionLightDto[] = [];


  constructor(private readonly route: ActivatedRoute, private readonly sessionsService: SessionsService) {
  }


  async ngOnInit() {

    this.route.params.subscribe(async params => {
      const { electoralPeriod } = params as { electoralPeriod: number };
      this.electoralPeriod = electoralPeriod;
      this.sessions = await this.sessionsService.fetchSessions(electoralPeriod);
      this.sessions.sort((a, b) => b.date.localeCompare(a.date));
    });

  }


}
