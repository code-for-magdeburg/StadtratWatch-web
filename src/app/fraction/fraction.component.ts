import { Component, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FractionsService } from '../services/fractions.service';
import { PersonsService } from '../services/persons.service';
import { forkJoin } from 'rxjs';
import { Councilor, CouncilorCardComponent } from '../components/councilor-card/councilor-card.component';
import { ApplicationVotingDto } from '../model/Application';
import { ACCEPTED_COLOR, PARTIALLY_ACCEPTED_COLOR, REJECTED_COLOR } from '../utilities/ui';
import { VotingResult } from '../model/Session';
import {
  compare,
  SortableFractionApplicationsDirective,
  SortFractionApplicationsEvent
} from '../fractions/sortable-fraction-applications.directive';


enum ApplicationResult {
  ACCEPTED = 'ACCEPTED',
  PARTIALLY_ACCEPTED = 'PARTIALLY_ACCEPTED',
  REJECTED = 'REJECTED',
}


type Application = {
  sessionId: string;
  votingDate: string;
  votingId: number;
  type: string;
  applicationId: string;
  typeAndId: string;
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
};


@Component({
  selector: 'app-fraction',
  templateUrl: './fraction.component.html',
  styleUrls: ['./fraction.component.scss']
})
export class FractionComponent {


  private applicationsData: Application[] = [];

  public fraction: Fraction | null = null;
  public councilors: Councilor[] = [];
  public formerCouncilors: Councilor[] = [];
  public sortedApplications: Application[] = [];

  protected readonly ApplicationResult = ApplicationResult;

  protected readonly ACCEPTED_COLOR = ACCEPTED_COLOR;
  protected readonly PARTIALLY_ACCEPTED_COLOR = PARTIALLY_ACCEPTED_COLOR;
  protected readonly REJECTED_COLOR = REJECTED_COLOR;

  @ViewChildren(SortableFractionApplicationsDirective) headers: QueryList<SortableFractionApplicationsDirective> | undefined;


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

          this.fraction = {
            name: fraction.name,
            applicationsSuccessRate: fraction.applicationsSuccessRate,
            votingsSuccessRate: fraction.votingsSuccessRate,
            uniformityScore: fraction.uniformityScore,
            participationRate: fraction.participationRate,
            abstentionRate: fraction.abstentionRate,
          };

          this.sortedApplications = this.applicationsData = fraction.applications.map(application => ({
            sessionId: application.sessionId,
            votingDate: application.sessionDate,
            votingId: this.getVotingId(application.votings),
            type: application.type,
            applicationId: application.applicationId,
            typeAndId: `${application.type} ${application.applicationId}`,
            title: application.title,
            result: this.getApplicationResult(application.votings),
            applicationUrl: application.applicationUrl
          }));
          this.sortedApplications.sort(
            (a, b) =>
              b.votingDate.localeCompare(a.votingDate)
          );

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


  onSort(sortEvent: SortFractionApplicationsEvent) {

    if (!this.headers) {
      return;
    }

    this.headers.forEach((header) => {
      if (header.sortableFractionApplications !== sortEvent.column) {
        header.direction = '';
      }
    });

    if (sortEvent.direction === '' || sortEvent.column === '') {
      this.sortedApplications = this.applicationsData;
    } else {
      this.sortedApplications = [...this.applicationsData].sort((a, b) => {
        const aValue = sortEvent.column === '' ? '' : a[sortEvent.column];
        const bValue = sortEvent.column === '' ? '' : b[sortEvent.column];
        const res = compare(aValue, bValue);
        return sortEvent.direction === 'asc' ? res : -res;
      });
    }

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
