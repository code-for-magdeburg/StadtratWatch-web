import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FactionsService } from '../services/factions.service';
import { PersonsService } from '../services/persons.service';
import { forkJoin } from 'rxjs';
import { Councilor, CouncilorCardComponent } from '../components/councilor-card/councilor-card.component';
import { ApplicationDto, ApplicationVotingDto } from '../model/Application';
import { ACCEPTED_COLOR, PARTIALLY_ACCEPTED_COLOR, REJECTED_COLOR } from '../utilities/ui';
import { VotingResult } from '../model/Session';
import {
  compare,
  SortableFactionApplicationsDirective,
  SortFactionApplicationsEvent
} from './sortable-faction-applications.directive';
import { StatsHistoryDto } from '../model/Faction';
import { MetaTagsService } from '../services/meta-tags.service';
import { ELECTORAL_PERIOD_PATH } from '../app-routing.module';
import { environment } from '../../environments/environment';


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

export type Faction = {
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
  selector: 'app-faction',
  templateUrl: './faction.component.html',
  styleUrls: ['./faction.component.scss']
})
export class FactionComponent implements OnInit {


  private applicationsSorting: SortFactionApplicationsEvent = { column: '', direction: '' };

  protected readonly ELECTORAL_PERIOD_PATH = ELECTORAL_PERIOD_PATH;

  public electoralPeriod = environment.currentElectoralPeriod;
  public faction: Faction | null = null;
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

  @ViewChildren(SortableFactionApplicationsDirective) headers: QueryList<SortableFactionApplicationsDirective> | undefined;


  constructor(private readonly route: ActivatedRoute, private readonly factionsService: FactionsService,
              private readonly personsService: PersonsService, private readonly metaTagsService: MetaTagsService) {
  }


  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      this.electoralPeriod = params.get('electoralPeriod') || this.electoralPeriod;
      if (!this.electoralPeriod) {
        // TODO: Handle missing electoral period
        return;
      }

      const factionId = params.get('id');
      if (!factionId) {
        // TODO: Handle missing faction id
        return;
      }

      forkJoin([
        this.factionsService.fetchFaction(this.electoralPeriod, factionId),
        this.personsService.fetchPersonsByFaction(this.electoralPeriod, factionId)
      ])
        .subscribe(([faction, persons]) => {

          this.faction = {
            name: faction.name,
            applicationsSuccessRate: faction.applicationsSuccessRate,
            votingsSuccessRate: faction.votingsSuccessRate,
            uniformityScore: faction.uniformityScore,
            participationRate: faction.participationRate,
            abstentionRate: faction.abstentionRate,
            statsHistory: faction.statsHistory,
            applications: this.mapApplications(faction.applications)
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

          const title = `StadtratWatch: ${faction.name}`;
          const description = faction.name.startsWith('parteilos-')
            ? `${faction.name} - Abstimmungen, Anwesenheiten und andere Daten und Analysen im Magdeburger Stadtrat`
            : `${faction.name} - Abstimmungen, Anwesenheiten und andere Daten und Analysen der Fraktion im Magdeburger Stadtrat`;
          this.metaTagsService.updateTags({ title, description });

        });

    });

  }


  changeApplicationsFilter() {
    this.filterAndSortApplications();
  }


  onSort(sortEvent: SortFactionApplicationsEvent) {

    this.applicationsSorting = sortEvent;

    if (!this.headers) {
      return;
    }

    this.headers.forEach((header) => {
      if (header.sortableFactionApplications !== sortEvent.column) {
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

    const filtered = (this.faction?.applications || [])
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
