import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SessionsService } from '../services/sessions.service';
import { DID_NOT_VOTE_COLOR, VOTED_ABSTENTION_COLOR, VOTED_AGAINST_COLOR, VOTED_FOR_COLOR } from '../utilities/ui';
import { SessionVotingDto, Vote, VoteResult } from '../model/Session';
import { ELECTORAL_PERIOD_PATH } from '../app-routing.module';
import { MetaTagsService } from '../services/meta-tags.service';
import { environment } from '../../environments/environment';
import { BreadcrumbItem } from '../components/breadcrumb/breadcrumb.component';
import { DatePipe } from '@angular/common';


type FactionMember = {
  personId: string;
  name: string;
  vote: VoteResult;
};

type Faction = {
  factionId: string;
  name: string;
  members: FactionMember[];
};

type VotingViewModel = {
  sessionId: string;
  sessionDate: string;
  breadcrumbSubItems: BreadcrumbItem[];
  agendaItem: string;
  applicationId: string;
  votingTitle: string;
  votingType: string;
  authorNames: string[];
  applicationUrl: string | null;
  youtubeUrl: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstained: number;
};


@Component({
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss']
})
export class VotingComponent implements OnInit {


  protected readonly ELECTORAL_PERIOD_PATH = ELECTORAL_PERIOD_PATH;

  public electoralPeriod = environment.currentElectoralPeriod;
  public votingViewModel: VotingViewModel | undefined;
  public factions: Faction[] = [];

  public VoteResult = VoteResult;


  constructor(private readonly route: ActivatedRoute, private readonly sessionsService: SessionsService,
              private readonly metaTagsService: MetaTagsService) {
  }


  ngOnInit(): void {

    this.route.paramMap.subscribe(async params => {

      this.electoralPeriod = params.get('electoralPeriod') || this.electoralPeriod;
      if (!this.electoralPeriod) {
        // TODO: Handle missing electoral period
        return;
      }

      const sessionId = params.get('session-id');
      if (!sessionId) {
        // TODO: Handle missing session date
        return;
      }

      const votingId = +(params.get('voting-id') || '0');
      if (!votingId) {
        // TODO: Handle missing voting id
        return;
      }

      const session = await this.sessionsService.fetchSession(this.electoralPeriod, sessionId);

      const votingDto = session.votings.find(
        (votingDto: SessionVotingDto) => votingDto.id === votingId
      );
      if (!votingDto) {
        // TODO: Handle missing voting data
        return;
      }

      this.votingViewModel = {
        sessionId: session.id,
        sessionDate: session.date,
        breadcrumbSubItems:  [
          { title: 'Sitzungen', path: ['sessions'] },
          { title: new DatePipe('de-DE').transform(session.date) || '', path: ['session', session.id] },
        ],
        agendaItem: votingDto.votingSubject.agendaItem,
        applicationId: votingDto.votingSubject.applicationId,
        votingTitle: votingDto.votingSubject.title,
        votingType: votingDto.votingSubject.type,
        authorNames: votingDto.votingSubject.authors,
        applicationUrl: votingDto.votingSubject.documents.applicationUrl,
        youtubeUrl: this.generateYoutubeUrl(session.youtubeUrl, votingDto.videoTimestamp),
        votesFor: this.countVotes(votingDto.votes, VoteResult.VOTE_FOR),
        votesAgainst: this.countVotes(votingDto.votes, VoteResult.VOTE_AGAINST),
        votesAbstained: this.countVotes(votingDto.votes, VoteResult.VOTE_ABSTENTION)
      }

      const votes = new Map(votingDto.votes.map(vote => [vote.personId, vote.vote]));
      this.factions = session.factions.map(faction => ({
        factionId: faction.id,
        name: faction.name,
        members: session.persons
          .filter(personDto => personDto.faction === faction.name)
          .map(personDto => ({
            personId: personDto.id,
            name: personDto.name,
            vote: votes.get(personDto.id) || VoteResult.DID_NOT_VOTE
          }))
      }));

      this.factions.sort((a, b) =>
        a.members.length === b.members.length
          ? a.name.localeCompare(b.name)
          : b.members.length - a.members.length);

      this.metaTagsService.updateTags({
        title: this.getTitleForMetaTags(votingDto, session.date),
        description: votingDto.votingSubject.title,
        image: `${environment.awsCloudFrontBaseUrl}/web-assets/electoral-periods/${this.electoralPeriod}/images/votings/${sessionId}/${sessionId}-${votingId.toString().padStart(3, '0')}.png`
      });

    });

  }


  public getVoteColor = (vote: VoteResult): string =>
    vote === VoteResult.VOTE_FOR
      ? VOTED_FOR_COLOR
      : vote === VoteResult.VOTE_AGAINST
        ? VOTED_AGAINST_COLOR
        : vote === VoteResult.VOTE_ABSTENTION
          ? VOTED_ABSTENTION_COLOR
          : DID_NOT_VOTE_COLOR;


  private generateYoutubeUrl(youtubeBaseUrl: string, videoTimestamp: string): string {
    const timeParts = videoTimestamp.split(':');
    if (timeParts.length === 3) {
      const secs = parseInt(timeParts[0]) * 3600 + parseInt(timeParts[1]) * 60 + parseInt(timeParts[2]) - 10;
      return `${youtubeBaseUrl}?t=${secs}s`;
    } else {
      return youtubeBaseUrl;
    }
  }


  private countVotes = (votes: Vote[], voteResult: VoteResult): number =>
    votes.filter(vote => vote.vote === voteResult).length;


  private getTitleForMetaTags(votingDto: SessionVotingDto, sessionDate: string): string {

    switch (votingDto.votingSubject.type) {

      case 'Änderungsantrag':
        return votingDto.votingSubject.applicationId
          ? `Änderungsantrag ${votingDto.votingSubject.applicationId}`
          : 'Änderungsantrag';

      case 'Antrag':
        return votingDto.votingSubject.applicationId
          ? `Antrag ${votingDto.votingSubject.applicationId}`
          : 'Antrag';

      case 'Beschlussvorlage':
        return votingDto.votingSubject.applicationId
          ? `Beschlussvorlage ${votingDto.votingSubject.applicationId}`
          : 'Beschlussvorlage';

      case 'Delegation':
        return 'Abstimmung zur Delegation';

      case 'Geschäftsordnung':
        return votingDto.votingSubject.applicationId
          ? `Geschäftsordnungsantrag zu ${votingDto.votingSubject.applicationId}`
          : 'Geschäftsordnungsantrag';

      case 'Niederschrift':
        return 'Abstimmung zur Niederschrift';

      case 'Redaktionelle Änderung':
        return votingDto.votingSubject.applicationId
          ? `Redaktionelle Änderung zu ${votingDto.votingSubject.applicationId}`
          : 'Redaktionelle Änderung';

      case 'Sonstige':
        return 'Sonstige Abstimmung';

      case 'Tagesordnung':
        return `Abstimmung zur Tagesordnung`;

    }

    const formattedSessionDate = new Date(sessionDate).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return `StadtratWatch: Abstimmung am ${formattedSessionDate}`;

  }


}
