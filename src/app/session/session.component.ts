import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SessionsService } from '../services/sessions.service';
import { ACCEPTED_COLOR, REJECTED_COLOR } from '../utilities/ui';
import { SessionVotingDto, SessionSpeechDto, Vote, VoteResult } from '../model/Session';
import { SpeakingTimeChartData } from '../components/speaking-time-chart/speaking-time-chart.component';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { Meta, Title } from '@angular/platform-browser';


enum VotingResult {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}


type Voting = {
  id: number;
  agendaItem: string;
  applicationId: string;
  title: string;
  type: string;
  authorNames: string[];
  result: VotingResult;
};


@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {


  public sessionDate: string | null = null;
  public votings: Voting[] = [];
  public speakingTimes: SpeakingTimeChartData[] = [];
  public speeches: SessionSpeechDto[] = [];
  public meetingMinutesUrl = '';
  public youtubeUrl = '';

  @ViewChild('tabs', { static: true }) tabs?: TabsetComponent;

  protected VotingResult = VotingResult;
  protected ACCEPTED_COLOR = ACCEPTED_COLOR;
  protected REJECTED_COLOR = REJECTED_COLOR;


  constructor(private readonly route: ActivatedRoute, private readonly sessionsService: SessionsService,
              private readonly meta: Meta, private readonly titleService: Title) {
  }


  ngOnInit() {

    this.route.paramMap.subscribe(async params => {

      const sessionId = params.get('id');
      if (!sessionId) {
        // TODO: Handle missing session date
        return;
      }

      const session = await this.sessionsService.fetchSession(sessionId);

      this.sessionDate = session.date;
      this.meetingMinutesUrl = session.meetingMinutesUrl;
      this.youtubeUrl = session.youtubeUrl;
      this.votings = session.votings.map((votingDto: SessionVotingDto) => ({
        id: votingDto.id,
        agendaItem: votingDto.votingSubject.agendaItem,
        applicationId: votingDto.votingSubject.applicationId,
        title: votingDto.votingSubject.title,
        type: votingDto.votingSubject.type,
        authorNames: votingDto.votingSubject.authors,
        result: this.getVotingResult(votingDto.votes),
      }));
      this.speakingTimes = SpeakingTimeChartData.fromSession(session);
      this.speeches = session.speeches;

      this.tabs ? this.tabs.tabs[1].active = true : null;
      setTimeout(() => this.tabs ? this.tabs.tabs[0].active = true : null, 1);

      const description = `${session.date} - Abstimmungen, Anwesenheiten und andere Daten und Analysen der Sitzung des Magdeburger Stadtrates`;
      const title = `StadtratWatch: Sitzung vom ${session.date}`;
      this.titleService.setTitle(title);
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ name: 'twitter:title', content: title });
      this.meta.updateTag({ name: 'twitter:description', content: description });
      // TODO: Add property og:url
      // TODO: Add property og:image
      // TODO: Add name twitter:image
      // TODO: Add name twitter:card
      // TODO: Add name twitter:domain
      // TODO: Add name twitter:url

    });

  }


  private getVotingResult(votes: Vote[]): VotingResult {
    const votesFor = votes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
    const votesAgainst = votes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;

    return votesFor > votesAgainst ? VotingResult.ACCEPTED : VotingResult.REJECTED;
  }


}
