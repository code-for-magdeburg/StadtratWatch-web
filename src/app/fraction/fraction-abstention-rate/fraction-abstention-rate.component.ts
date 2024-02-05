import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Fraction } from '../fraction.component';
import { ChartConfiguration } from 'chart.js';
import 'chartjs-adapter-date-fns';
import {
  initialHistoryChartData,
  initialHistoryChartOptions,
  mapHistoryDataToChartDataAndLabels
} from '../../utilities/chart-helpers';


@Component({
  selector: 'app-fraction-abstention-rate',
  templateUrl: './fraction-abstention-rate.component.html',
  styleUrls: ['./fraction-abstention-rate.component.scss']
})
export class FractionAbstentionRateComponent implements OnChanges {


  @Input() fraction!: Fraction;


  public chartData: ChartConfiguration['data'] = initialHistoryChartData();
  public chartOptions: ChartConfiguration['options'] = initialHistoryChartOptions(
    (val) => val === +val ? `${(val * 100).toFixed(1)}%` : val
  );


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['fraction']) {
      mapHistoryDataToChartDataAndLabels(this.chartData, this.fraction.statsHistory.abstentionRate);
    }

  }


}
