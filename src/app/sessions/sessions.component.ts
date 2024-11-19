import { Component, OnInit } from '@angular/core';
import { SessionsService } from '../services/sessions.service';
import { SessionLightDto } from '../../interfaces/Session';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { ELECTORAL_PERIOD_PATH } from '../app-routing.module';
import { SPEAKING_TIMES_TAB, SPEECHES_TAB, VOTINGS_TAB } from '../session/session.component';


type MonthYearGroup = {
  month: string;
  year: number;
  sessions: SessionLightDto[];
};


@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit {


  protected readonly ELECTORAL_PERIOD_PATH = ELECTORAL_PERIOD_PATH;
  protected readonly VOTINGS_TAB = VOTINGS_TAB;
  protected readonly SPEECHES_TAB = SPEECHES_TAB;
  protected readonly SPEAKING_TIMES_TAB = SPEAKING_TIMES_TAB;

  public electoralPeriod = environment.currentElectoralPeriod;
  public sessions: SessionLightDto[] = [];
  public monthYearGroups: MonthYearGroup[] = [];


  constructor(private readonly route: ActivatedRoute, private readonly sessionsService: SessionsService) {
  }


  async ngOnInit() {

    this.route.params.subscribe(async params => {

      const { electoralPeriod } = params;

      this.electoralPeriod = electoralPeriod;
      this.sessions = await this.sessionsService.fetchSessions(electoralPeriod);
      this.sessions.sort(this.compareSessionsForTimeline);

      this.monthYearGroups = this.sessions.reduce((acc, session) => {

        const date = new Date(session.date);
        const month = date.toLocaleString('de', { month: 'long' });
        const year = date.getFullYear();

        const group = acc.find(g => g.month === month && g.year === year);

        if (group) {
          group.sessions.push(session);
        } else {
          acc.push({ month, year, sessions: [session] });
        }

        return acc;

      }, [] as MonthYearGroup[]);

    });

  }


  private compareSessionsForTimeline(a: SessionLightDto, b: SessionLightDto) {

    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    if (dateA.getFullYear() !== dateB.getFullYear()) {
      return dateB.getFullYear() - dateA.getFullYear();
    }

    if (dateA.getMonth() !== dateB.getMonth()) {
      return dateB.getMonth() - dateA.getMonth();
    }

    return dateA.getDate() - dateB.getDate();

  }


}
