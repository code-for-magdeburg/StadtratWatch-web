import { Component, OnInit } from '@angular/core';
import { SessionsService } from '../services/sessions.service';
import { SessionLightDto } from '../model/Session';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { ELECTION_PERIOD_PATH } from '../app-routing.module';


@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit {


  protected readonly ELECTION_PERIOD_PATH = ELECTION_PERIOD_PATH;

  public electionPeriod = environment.currentElectionPeriod;
  public sessions: SessionLightDto[] = [];


  constructor(private readonly route: ActivatedRoute, private readonly sessionsService: SessionsService) {
  }


  async ngOnInit() {

    this.route.params.subscribe(async params => {
      const { electionPeriod } = params as { electionPeriod: number };
      this.electionPeriod = electionPeriod;
      this.sessions = await this.sessionsService.fetchSessions(electionPeriod);
      this.sessions.sort((a, b) => b.date.localeCompare(a.date));
    });

  }


}
