import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SessionsService } from '../services/sessions.service';
import { ACCEPTED_COLOR, REJECTED_COLOR } from '../utilities/ui';
import { SessionVotingDto, Vote, VoteResult } from '../model/Session';


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
export class SessionComponent {


  public sessionDate: string | null = null;
  public votings: Voting[] = [];
  public meetingMinutesUrl = '';

  protected VotingResult = VotingResult;
  protected ACCEPTED_COLOR = ACCEPTED_COLOR;
  protected REJECTED_COLOR = REJECTED_COLOR;


  constructor(private readonly route: ActivatedRoute, private readonly sessionsService: SessionsService) {
  }


  //noinspection JSUnusedGlobalSymbols
  ngOnInit() {

    this.route.paramMap.subscribe(params => {

      const sessionId = params.get('id');
      if (!sessionId) {
        // TODO: Handle missing session date
        return;
      }

      this.sessionsService
        .fetchSession(sessionId)
        .subscribe(session => {

          this.sessionDate = session.date;
          this.meetingMinutesUrl = session.meetingMinutesUrl;
          this.votings = session.votings.map((votingDto: SessionVotingDto) => ({
            id: votingDto.id,
            agendaItem: votingDto.votingSubject.agendaItem,
            applicationId: votingDto.votingSubject.applicationId,
            title: votingDto.votingSubject.title,
            type: votingDto.votingSubject.type,
            authorNames: votingDto.votingSubject.authors,
            result: this.getVotingResult(votingDto.votes),
          }));

        });

    });

  }


  private getVotingResult(votes: Vote[]): VotingResult {
    const votesFor = votes.filter(vote => vote.vote === VoteResult.VOTE_FOR).length;
    const votesAgainst = votes.filter(vote => vote.vote === VoteResult.VOTE_AGAINST).length;

    return votesFor > votesAgainst ? VotingResult.ACCEPTED : VotingResult.REJECTED;
  }


}
