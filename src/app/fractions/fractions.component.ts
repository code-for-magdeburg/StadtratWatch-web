import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FractionLightDto } from '../model/Fraction';
import { FractionsService } from '../services/fractions.service';
import { compare, SortableFractionsDirective, SortFractionsEvent } from './sortable-fractions.directive';
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
import { ELECTION_PERIOD_PATH } from '../app-routing.module';


@Component({
  selector: 'app-fractions',
  templateUrl: './fractions.component.html',
  styleUrls: ['./fractions.component.scss']
})
export class FractionsComponent implements OnInit {


  private data: FractionLightDto[] = [];

  protected readonly ELECTION_PERIOD_PATH = ELECTION_PERIOD_PATH;

  public electionPeriod = environment.currentElectionPeriod;
  public sortedFractions: FractionLightDto[] = [];
  public applicationsSuccessRates: VotingsSuccessRateChartData[] = [];
  public votingsSuccessRates: VotingsSuccessRateChartData[] = [];
  public uniformityScores: UniformityScoreChartData[] = [];
  public participationRates: VotingsSuccessRateChartData[] = [];
  public abstentionRates: AbstentionRateChartData[] = [];
  public speakingTimes: SpeakingTimeChartData[] = [];

  @ViewChildren(SortableFractionsDirective) headers: QueryList<SortableFractionsDirective> | undefined;


  constructor(private readonly route: ActivatedRoute, private readonly fractionsService: FractionsService) {
  }


  async ngOnInit() {

    this.route.params.subscribe(async params => {

      const { electionPeriod } = params as { electionPeriod: number };

      this.electionPeriod = electionPeriod;
      this.sortedFractions = this.data = await this.fractionsService.fetchFractions(electionPeriod);
      this.sortedFractions.sort((a, b) => b.seats - a.seats);
      this.applicationsSuccessRates = this.data.map(ApplicationsSuccessRateChartData.fromFraction);
      this.votingsSuccessRates = this.data.map(VotingsSuccessRateChartData.fromFraction);
      this.uniformityScores = this.data.map(UniformityScoreChartData.fromFraction);
      this.participationRates = this.data.map(ParticipationRateChartData.fromFraction);
      this.abstentionRates = this.data.map(AbstentionRateChartData.fromFraction);
      this.speakingTimes = this.data.map(SpeakingTimeChartData.fromFraction);

    });

  }


  onSort(sortEvent: SortFractionsEvent) {

    if (!this.headers) {
      return;
    }

    this.headers.forEach((header) => {
      if (header.sortableFractions !== sortEvent.column) {
        header.direction = '';
      }
    });

    if (sortEvent.direction === '' || sortEvent.column === '') {
      this.sortedFractions = this.data;
    } else {
      this.sortedFractions = [...this.data].sort((a, b) => {
        const aValue = sortEvent.column === '' ? '' : a[sortEvent.column];
        const bValue = sortEvent.column === '' ? '' : b[sortEvent.column];
        const res = compare(aValue, bValue);
        return sortEvent.direction === 'asc' ? res : -res;
      });
    }

  }


}
