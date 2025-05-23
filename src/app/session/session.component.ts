import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionsService } from '../services/sessions.service';
import { ACCEPTED_COLOR, REJECTED_COLOR } from '../utilities/ui';
import { SessionSpeechDto, SessionVotingDto, Vote, VoteResult } from '../../interfaces/web-assets/Session';
import { SpeakingTimeChartData } from '../components/speaking-time-chart/speaking-time-chart.component';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { DatePipe } from '@angular/common';
import { MetaTagsService } from '../services/meta-tags.service';
import { ELECTORAL_PERIOD_PATH } from '../app-routing.module';
import { environment } from '../../environments/environment';


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


export const VOTINGS_TAB = 'votings';
export const SPEECHES_TAB = 'speeches';
export const SPEAKING_TIMES_TAB = 'speaking-times';


type SpeechViewModel = SessionSpeechDto & {
  transcriptionParagraphs: string[];
  anchorId: string;
  permaLinkTitle: string;
  hintMailHref: string;
  hintMailTitle: string;
};


@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {


  private isInitializing = true;

  public electoralPeriod = environment.currentElectoralPeriod;
  public sessionDate = '';
  public votings: Voting[] = [];
  public speakingTimes: SpeakingTimeChartData[] = [];
  public speeches: SpeechViewModel[] = [];
  public meetingMinutesUrl = '';
  public youtubeUrl = '';

  @ViewChild('tabs', { static: true }) tabs?: TabsetComponent;

  protected readonly VotingResult = VotingResult;
  protected readonly ACCEPTED_COLOR = ACCEPTED_COLOR;
  protected readonly REJECTED_COLOR = REJECTED_COLOR;
  protected readonly ELECTORAL_PERIOD_PATH = ELECTORAL_PERIOD_PATH;
  protected readonly VOTINGS_TAB = VOTINGS_TAB;
  protected readonly SPEECHES_TAB = SPEECHES_TAB;
  protected readonly SPEAKING_TIMES_TAB = SPEAKING_TIMES_TAB;


  constructor(private readonly route: ActivatedRoute, private readonly router: Router,
              private readonly sessionsService: SessionsService, private readonly metaTagsService: MetaTagsService) {
  }


  ngOnInit() {

    this.route.queryParams.subscribe(query => {
      if (this.isInitializing) return;
      const { tab } = query;
      this.openTab(tab || VOTINGS_TAB);
    });

    this.route.fragment.subscribe(fragment => {
      const { tab } = this.route.snapshot.queryParams;
      if (tab === 'speeches' && fragment) {
        setTimeout(() => document.getElementById(fragment)?.scrollIntoView({ behavior: 'instant' }), 200);
      }
    });

    this.route.paramMap.subscribe(async params => {

      this.electoralPeriod = params.get('electoralPeriod') || this.electoralPeriod;
      if (!this.electoralPeriod) {
        // TODO: Handle missing electoral period
        return;
      }

      const sessionId = params.get('id');
      if (!sessionId) {
        // TODO: Handle missing session date
        return;
      }

      const session = await this.sessionsService.fetchSession(this.electoralPeriod, sessionId);

      this.sessionDate = new DatePipe('de-DE').transform(session.date) || '';
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
      this.votings.sort((a, b) => a.id - b.id);
      this.speakingTimes = SpeakingTimeChartData.fromSession(session);
      this.speeches = session.speeches.map(speech => {

        const transcriptionParagraphs = (speech.transcription || '')
          .split('\n\n')
          .filter(paragraph => paragraph.trim().length > 0);
        const permaLinkTitle = `Link zum Redebeitrag von ${speech.speaker} am ${this.sessionDate}`;
        const subject = encodeURIComponent(`Hinweis zum Redebeitrag von ${speech.speaker} am ${this.sessionDate}`);
        const hintMailBodyText = encodeURIComponent(
          `Hallo StadtratWatch-Team!

Ich habe einen Hinweis zum Redebeitrag von ${speech.speaker} aus der Sitzung vom ${this.sessionDate} (Zeitmarke: ${speech.start}):




Mit freundlichen Grüßen,

`);
        const hintMailHref = `mailto:stadtratwatch@gmail.com?subject=${subject}&body=${hintMailBodyText}`
        const hintMailTitle = `Hinweis zum Redebeitrag von ${speech.speaker} geben`;
        return {
          ...speech,
          transcriptionParagraphs,
          anchorId: `speech-${speech.start}`,
          permaLinkTitle,
          hintMailHref,
          hintMailTitle,
        } as SpeechViewModel;

      });

      this.tabs ? this.tabs.tabs[2].active = true : null;
      setTimeout(() => {
        const { tab } = this.route.snapshot.queryParams;
        this.openTab(tab || VOTINGS_TAB);
        this.isInitializing = false;
      }, 1);

      const sessionDateDisplay = new DatePipe('de-DE').transform(session.date);
      const title = `StadtratWatch: Sitzung vom ${sessionDateDisplay}`;
      const description = `${sessionDateDisplay}: Abstimmungen, Redebeiträge und andere Daten und Analysen der Sitzung des Magdeburger Stadtrates`;
      this.metaTagsService.updateTags({ title, description });

    });

  }


  async onSelectTab(tab: string) {
    if (this.isInitializing) return;
    await this.router.navigate([], { relativeTo: this.route, queryParams: { tab } });
  }


  private openTab(tab: string) {

    switch (tab) {
      case VOTINGS_TAB:
        this.tabs ? this.tabs.tabs[0].active = true : null;
        break;
      case SPEECHES_TAB:
        this.tabs ? this.tabs.tabs[1].active = true : null;
        break;
      case SPEAKING_TIMES_TAB:
        this.tabs ? this.tabs.tabs[2].active = true : null;
        break;
      default:
        this.tabs ? this.tabs.tabs[0].active = true : null;
    }

  }


  private getVotingResult(votes: Vote[]): VotingResult {
    const votesFor = votes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
    const votesAgainst = votes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;

    return votesFor > votesAgainst ? VotingResult.ACCEPTED : VotingResult.REJECTED;
  }


}
