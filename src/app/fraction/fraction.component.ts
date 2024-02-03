import { Component, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FractionsService } from '../services/fractions.service';
import { PersonsService } from '../services/persons.service';
import { forkJoin } from 'rxjs';
import { Councilor, CouncilorCardComponent } from '../components/councilor-card/councilor-card.component';
import { ApplicationDto, ApplicationVotingDto } from '../model/Application';
import { ACCEPTED_COLOR, PARTIALLY_ACCEPTED_COLOR, REJECTED_COLOR } from '../utilities/ui';
import { VotingResult } from '../model/Session';
import {
  compare,
  SortableFractionApplicationsDirective,
  SortFractionApplicationsEvent
} from '../fractions/sortable-fraction-applications.directive';
import { StatsHistoryDto } from '../model/Fraction';


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

export type Fraction = {
  name: string;
  uniformityScore: number;
  applicationsSuccessRate: number;
  votingsSuccessRate: number;
  participationRate: number;
  abstentionRate: number;
  statsHistory: StatsHistoryDto;
  applications: Application[];
};


@Component({
  selector: 'app-fraction',
  templateUrl: './fraction.component.html',
  styleUrls: ['./fraction.component.scss']
})
export class FractionComponent {


  private applicationsSorting: SortFractionApplicationsEvent = { column: '', direction: '' };

  public fraction: Fraction | null = null;
  public councilors: Councilor[] = [];
  public formerCouncilors: Councilor[] = [];
  public sortedApplications: Application[] = [];

  public showApplications = true;
  public showChangeRequests = true;
  public showPointsOfOrder = true;

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
            statsHistory: fraction.statsHistory,
            applications: this.mapApplications(fraction.applications)
          };

          const today = new Date().toISOString().substring(0, 10);
          this.councilors = persons
            .filter(person => !person.councilorUntil || person.councilorUntil >= today)
            .map(CouncilorCardComponent.mapPersonToCouncilor);
          this.formerCouncilors = persons
            .filter(person => person.councilorUntil && person.councilorUntil < today)
            .map(CouncilorCardComponent.mapPersonToCouncilor);

          this.applicationsSorting = { column: 'votingDate', direction: 'desc' };
          this.filterAndSortApplications();
        });

    });

  }


  changeApplicationsFilter() {
    this.filterAndSortApplications();
  }


  onSort(sortEvent: SortFractionApplicationsEvent) {

    this.applicationsSorting = sortEvent;

    if (!this.headers) {
      return;
    }

    this.headers.forEach((header) => {
      if (header.sortableFractionApplications !== sortEvent.column) {
        header.direction = '';
      }
    });

    this.filterAndSortApplications();

  }


  private getVotingId(votings: ApplicationVotingDto[]): number {
    const firstVoting = votings
      .slice()
      .sort((a, b) => a.votingId - b.votingId)[0];
    return firstVoting.votingId;
  }


  private mapApplications(applications: ApplicationDto[]): Application[] {

    return applications
      .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))
      .map(application => ({
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


  private filterAndSortApplications() {

    const filtered = (this.fraction?.applications || [])
      .filter(application => {
        switch (application.type) {
          case 'Antrag':
            return this.showApplications;
          case 'Änderungsantrag':
            return this.showChangeRequests;
          case 'Geschäftsordnung':
            return this.showPointsOfOrder;
          default:
            return false;
        }
      });

    if (this.applicationsSorting.direction === '' || this.applicationsSorting.column === '') {
      this.sortedApplications = filtered;
    } else {
      this.sortedApplications = [...filtered].sort((a, b) => {
        const aValue = this.applicationsSorting.column === '' ? '' : a[this.applicationsSorting.column];
        const bValue = this.applicationsSorting.column === '' ? '' : b[this.applicationsSorting.column];
        const res = compare(aValue, bValue);
        return this.applicationsSorting.direction === 'asc' ? res : -res;
      });
    }

  }


}
