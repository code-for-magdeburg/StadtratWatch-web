import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SessionsService } from '../services/sessions.service';
import { DID_NOT_VOTE_COLOR, VOTED_ABSTENTION_COLOR, VOTED_AGAINST_COLOR, VOTED_FOR_COLOR } from '../utilities/ui';
import { SessionVotingDto, Vote, VoteResult } from '../model/Session';


type FractionMember = {
  personId: string;
  name: string;
  vote: VoteResult;
};

type Fraction = {
  fractionId: string;
  name: string;
  members: FractionMember[];
};

type VotingViewModel = {
  sessionId: string;
  sessionDate: string;
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
export class VotingComponent {


  public electionPeriod = 0;
  public votingViewModel: VotingViewModel | undefined;
  public fractions: Fraction[] = [];

  public VoteResult = VoteResult;


  constructor(private readonly route: ActivatedRoute, private readonly sessionsService: SessionsService) {
  }


  //noinspection JSUnusedGlobalSymbols
  ngOnInit(): void {

    this.route.paramMap.subscribe(async params => {

      this.electionPeriod = +(params.get('electionPeriod') || '0');
      if (!this.electionPeriod) {
        // TODO: Handle missing election period
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

      const session = await this.sessionsService.fetchSession(this.electionPeriod, sessionId);

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
      this.fractions = session.fractions.map(fraction => ({
        fractionId: fraction.id,
        name: fraction.name,
        members: session.persons
          .filter(personDto => personDto.fraction === fraction.name)
          .map(personDto => ({
            personId: personDto.id,
            name: personDto.name,
            vote: votes.get(personDto.id) || VoteResult.DID_NOT_VOTE
          }))
      }));

      this.fractions.sort((a, b) =>
        a.members.length === b.members.length
          ? a.name.localeCompare(b.name)
          : b.members.length - a.members.length);

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


}
