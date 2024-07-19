import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { PartiesService } from '../services/parties.service';
import { PartyDto } from '../model/Party';
import { compare, SortablePartiesDirective, SortPartiesEvent } from './sortable-parties.directive';
import {
  VotingsSuccessRateChartData
} from '../components/votings-success-rate-chart/votings-success-rate-chart.component';
import { UniformityScoreChartData } from '../components/uniformity-score-chart/uniformity-score-chart.component';
import { ParticipationRateChartData } from '../components/participation-rate-chart/participation-rate-chart.component';
import { AbstentionRateChartData } from '../components/abstention-rate-chart/abstention-rate-chart.component';
import { SpeakingTimeChartData } from '../components/speaking-time-chart/speaking-time-chart.component';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { ELECTORAL_PERIOD_PATH } from '../app-routing.module';


@Component({
  selector: 'app-parties',
  templateUrl: './parties.component.html',
  styleUrls: ['./parties.component.scss']
})
export class PartiesComponent implements OnInit {


  private data: PartyDto[] = [];

  protected readonly ELECTORAL_PERIOD_PATH = ELECTORAL_PERIOD_PATH;

  public electoralPeriod = environment.currentElectoralPeriod;
  public sortedParties: PartyDto[] = [];
  public votingsSuccessRates: VotingsSuccessRateChartData[] = [];
  public uniformityScores: UniformityScoreChartData[] = [];
  public participationRates: ParticipationRateChartData[] = [];
  public abstentionRates: AbstentionRateChartData[] = [];
  public speakingTimes: SpeakingTimeChartData[] = [];

  @ViewChildren(SortablePartiesDirective) headers: QueryList<SortablePartiesDirective> | undefined;


  constructor(private readonly route: ActivatedRoute, private readonly partiesService: PartiesService) {
  }


  async ngOnInit() {

    this.route.params.subscribe(async params => {

      const { electoralPeriod } = params;

      this.electoralPeriod = electoralPeriod;
      this.sortedParties = this.data = await this.partiesService.fetchParties(electoralPeriod);
      this.sortedParties.sort((a, b) => b.seats - a.seats);
      this.votingsSuccessRates = this.data.map(VotingsSuccessRateChartData.fromParty);
      this.uniformityScores = this.data.map(UniformityScoreChartData.fromParty);
      this.participationRates = this.data.map(ParticipationRateChartData.fromParty);
      this.abstentionRates = this.data.map(AbstentionRateChartData.fromParty);
      this.speakingTimes = this.data.map(SpeakingTimeChartData.fromParty);

    });

  }


  onSort(sortEvent: SortPartiesEvent) {

    if (!this.headers) {
      return;
    }

    this.headers.forEach((header) => {
      if (header.sortableParties !== sortEvent.column) {
        header.direction = '';
      }
    });

    if (sortEvent.direction === '' || sortEvent.column === '') {
      this.sortedParties = this.data;
    } else {
      this.sortedParties = [...this.data].sort((a, b) => {
        const aValue = sortEvent.column === '' ? '' : a[sortEvent.column];
        const bValue = sortEvent.column === '' ? '' : b[sortEvent.column];
        const res = compare(aValue, bValue);
        return sortEvent.direction === 'asc' ? res : -res;
      });
    }

  }


}
