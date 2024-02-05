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
  selector: 'app-party-abstention-rate',
  templateUrl: './party-abstention-rate.component.html',
  styleUrls: ['./party-abstention-rate.component.scss']
})
export class PartyAbstentionRateComponent implements OnChanges {


  @Input() party!: Party;

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;


  public chartData: ChartConfiguration['data'] = initialHistoryChartData();
  public chartOptions: ChartConfiguration['options'] = initialHistoryChartOptions(
    (val) => val === +val ? `${(val * 100).toFixed(1)}%` : val
  );


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['party']) {
      mapHistoryDataToChartDataAndLabels(this.chartData, this.party.statsHistory.abstentionRate);
      if (!changes['party'].firstChange) {
        this.chart.update();
      }
    }

  }


}
