import { Component } from '@angular/core';
import { PersonsService } from '../services/persons.service';
import { ActivatedRoute } from '@angular/router';
import { VoteResult } from '../model/Session';
import { PersonDetailsDto, PersonVotingComparison } from '../model/Person';


@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss']
})
export class PersonComponent {


  public person: PersonDetailsDto | null = null;
  public didVote = 0;
  public comparisonMatrix: PersonVotingComparison[] = [];


  constructor(private readonly route: ActivatedRoute, private readonly personsService: PersonsService) {
  }


  //noinspection JSUnusedGlobalSymbols
  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const personId = params.get('id');
      if (!personId) {
        // TODO: Handle missing person id
        return;
      }

      this.personsService
        .fetchPerson(personId)
        .subscribe(person => {
          this.person = person;
          this.comparisonMatrix = person.votingMatrix.sort(
            (a, b) => b.comparisonScore - a.comparisonScore
          );
          this.didVote = person.votes.length -
            person.votes.filter(vote => vote.vote === VoteResult.DID_NOT_VOTE).length;
        });

    });

  }


}
