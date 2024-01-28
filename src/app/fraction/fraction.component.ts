import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FractionsService } from '../services/fractions.service';
import { PersonsService } from '../services/persons.service';
import { forkJoin } from 'rxjs';
import { Councilor, CouncilorCardComponent } from '../components/councilor-card/councilor-card.component';
import { ApplicationVotingDto } from '../model/Application';
import { ACCEPTED_COLOR, PARTIALLY_ACCEPTED_COLOR, REJECTED_COLOR } from '../utilities/ui';
import { VotingResult } from '../model/Session';


enum ApplicationResult {
  ACCEPTED = 'ACCEPTED',
  PARTIALLY_ACCEPTED = 'PARTIALLY_ACCEPTED',
  REJECTED = 'REJECTED',
}


type Application = {
  sessionId: string;
  sessionDate: string;
  votingId: number;
  type: string;
  applicationId: string;
  title: string;
  result: ApplicationResult;
  applicationUrl: string | null;
};

type Fraction = {
  name: string;
  uniformityScore: number;
  applicationsSuccessRate: number;
  votingsSuccessRate: number;
  participationRate: number;
  abstentionRate: number;
  applications: Application[];
};


@Component({
  selector: 'app-fraction',
  templateUrl: './fraction.component.html',
  styleUrls: ['./fraction.component.scss']
})
export class FractionComponent {


  public fraction: Fraction | null = null;
  public councilors: Councilor[] = [];
  public formerCouncilors: Councilor[] = [];

  protected readonly ApplicationResult = ApplicationResult;

  protected readonly ACCEPTED_COLOR = ACCEPTED_COLOR;
  protected readonly PARTIALLY_ACCEPTED_COLOR = PARTIALLY_ACCEPTED_COLOR;
  protected readonly REJECTED_COLOR = REJECTED_COLOR;

  constructor(private readonly route: ActivatedRoute, private readonly fractionsService: FractionsService,
              private readonly personsService: PersonsService) {
  }


  //noinspection JSUnusedGlobalSymbols
  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const fractionId = params.get('id');
      if (!fractionId) {
        // TODO: Handle missing fraction id
        return;
      }

      forkJoin([
        this.fractionsService.fetchFraction(fractionId),
        this.personsService.fetchPersonsByFraction(fractionId)
      ])
        .subscribe(([fraction, persons]) => {

          const applications = fraction.applications.map(application => ({
            sessionId: application.sessionId,
            sessionDate: application.sessionDate,
            votingId: this.getVotingId(application.votings),
            type: application.type,
            applicationId: application.applicationId,
            title: application.title,
            result: this.getApplicationResult(application.votings),
            applicationUrl: application.applicationUrl
          }));
          applications.sort(
            (a, b) =>
              b.sessionDate.localeCompare(a.sessionDate)
          );
          this.fraction = {
            name: fraction.name,
            applicationsSuccessRate: fraction.applicationsSuccessRate,
            votingsSuccessRate: fraction.votingsSuccessRate,
            uniformityScore: fraction.uniformityScore,
            participationRate: fraction.participationRate,
            abstentionRate: fraction.abstentionRate,
            applications
          };

          const today = new Date().toISOString().substring(0, 10);
          this.councilors = persons
            .filter(person => !person.councilorUntil || person.councilorUntil >= today)
            .map(CouncilorCardComponent.mapPersonToCouncilor);
          this.formerCouncilors = persons
            .filter(person => person.councilorUntil && person.councilorUntil < today)
            .map(CouncilorCardComponent.mapPersonToCouncilor);

        });

    });

  }


  private getVotingId(votings: ApplicationVotingDto[]): number {
    const firstVoting = votings
      .slice()
      .sort((a, b) => a.votingId - b.votingId)[0];
    return firstVoting.votingId;
  }


  private getApplicationResult(votings: ApplicationVotingDto[]): ApplicationResult {
    const passedVotings = votings
      .filter(voting => voting.votingResult === VotingResult.PASSED)
      .length;
    return passedVotings === 0
      ? ApplicationResult.REJECTED
      : passedVotings === votings.length
        ? ApplicationResult.ACCEPTED
        : ApplicationResult.PARTIALLY_ACCEPTED;
  }


}
