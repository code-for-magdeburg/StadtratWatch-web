import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Party } from '../party.component';
import { ChartConfiguration } from 'chart.js';
import 'chartjs-adapter-date-fns';
import {
  initialHistoryChartData,
  initialHistoryChartOptions,
  mapHistoryDataToChartDataAndLabels
} from '../../utilities/chart-helpers';
import { BaseChartDirective } from 'ng2-charts';


@Component({
  selector: 'app-party-participation-rate',
  templateUrl: './party-participation-rate.component.html',
  styleUrls: ['./party-participation-rate.component.scss']
})
export class PartyParticipationRateComponent implements OnChanges {


  @Input() party!: Party;

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;


  public chartData: ChartConfiguration['data'] = initialHistoryChartData();
  public chartOptions: ChartConfiguration['options'] = initialHistoryChartOptions(
    (val) => val === +val ? `${(val * 100).toFixed(1)}%` : val
  );


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['party']) {
      mapHistoryDataToChartDataAndLabels(this.chartData, this.party.statsHistory.participationRate);
      if (!changes['party'].firstChange) {
        this.chart.update();
      }
    }

  }


}