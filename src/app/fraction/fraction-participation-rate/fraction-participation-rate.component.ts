import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Fraction } from '../fraction.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import 'chartjs-adapter-date-fns';
import {
  initialHistoryChartData,
  initialHistoryChartOptions,
  mapHistoryDataToChartDataAndLabels
} from '../../utilities/chart-helpers';


@Component({
  selector: 'app-fraction-participation-rate',
  templateUrl: './fraction-participation-rate.component.html',
  styleUrls: ['./fraction-participation-rate.component.scss']
})
export class FractionParticipationRateComponent implements OnChanges {


  @Input() fraction!: Fraction;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;


  public chartData: ChartConfiguration['data'] = initialHistoryChartData();
  public chartOptions: ChartConfiguration['options'] = initialHistoryChartOptions(
    (val) => val === +val ? `${(val * 100).toFixed(1)}%` : val
  );


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['fraction']) {
      mapHistoryDataToChartDataAndLabels(this.chartData, this.fraction.statsHistory.participationRate);
    }

  }


}
