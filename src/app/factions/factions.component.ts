import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FactionLightDto } from '../model/Faction';
import { FactionsService } from '../services/factions.service';
import { compare, SortableFactionsDirective, SortFactionsEvent } from './sortable-factions.directive';
import {
  VotingsSuccessRateChartData
} from '../components/votings-success-rate-chart/votings-success-rate-chart.component';
import { UniformityScoreChartData } from '../components/uniformity-score-chart/uniformity-score-chart.component';
import {
  ApplicationsSuccessRateChartData
} from '../components/application-success-rate-chart/applications-success-rate-chart.component';
import { ParticipationRateChartData } from '../components/participation-rate-chart/participation-rate-chart.component';
import { AbstentionRateChartData } from '../components/abstention-rate-chart/abstention-rate-chart.component';
import { SpeakingTimeChartData } from '../components/speaking-time-chart/speaking-time-chart.component';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { ELECTORAL_PERIOD_PATH } from '../app-routing.module';


@Component({
  selector: 'app-factions',
  templateUrl: './factions.component.html',
  styleUrls: ['./factions.component.scss']
})
export class FactionsComponent implements OnInit {


  private data: FactionLightDto[] = [];

  protected readonly ELECTORAL_PERIOD_PATH = ELECTORAL_PERIOD_PATH;

  public electoralPeriod = environment.currentElectoralPeriod;
  public sortedFactions: FactionLightDto[] = [];
  public applicationsSuccessRates: VotingsSuccessRateChartData[] = [];
  public votingsSuccessRates: VotingsSuccessRateChartData[] = [];
  public uniformityScores: UniformityScoreChartData[] = [];
  public participationRates: VotingsSuccessRateChartData[] = [];
  public abstentionRates: AbstentionRateChartData[] = [];
  public speakingTimes: SpeakingTimeChartData[] = [];

  @ViewChildren(SortableFactionsDirective) headers: QueryList<SortableFactionsDirective> | undefined;


  constructor(private readonly route: ActivatedRoute, private readonly factionsService: FactionsService) {
  }


  async ngOnInit() {

    this.route.params.subscribe(async params => {

      const { electoralPeriod } = params as { electoralPeriod: number };

      this.electoralPeriod = electoralPeriod;
      this.sortedFactions = this.data = await this.factionsService.fetchFactions(electoralPeriod);
      this.sortedFactions.sort((a, b) => b.seats - a.seats);
      this.applicationsSuccessRates = this.data.map(ApplicationsSuccessRateChartData.fromFaction);
      this.votingsSuccessRates = this.data.map(VotingsSuccessRateChartData.fromFaction);
      this.uniformityScores = this.data.map(UniformityScoreChartData.fromFaction);
      this.participationRates = this.data.map(ParticipationRateChartData.fromFaction);
      this.abstentionRates = this.data.map(AbstentionRateChartData.fromFaction);
      this.speakingTimes = this.data.map(SpeakingTimeChartData.fromFaction);

    });

  }


  onSort(sortEvent: SortFactionsEvent) {

    if (!this.headers) {
      return;
    }

    this.headers.forEach((header) => {
      if (header.sortableFactions !== sortEvent.column) {
        header.direction = '';
      }
    });

    if (sortEvent.direction === '' || sortEvent.column === '') {
      this.sortedFactions = this.data;
    } else {
      this.sortedFactions = [...this.data].sort((a, b) => {
        const aValue = sortEvent.column === '' ? '' : a[sortEvent.column];
        const bValue = sortEvent.column === '' ? '' : b[sortEvent.column];
        const res = compare(aValue, bValue);
        return sortEvent.direction === 'asc' ? res : -res;
      });
    }

  }


}
