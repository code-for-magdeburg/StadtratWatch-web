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
  selector: 'app-fraction-uniformity-score',
  templateUrl: './fraction-uniformity-score.component.html',
  styleUrls: ['./fraction-uniformity-score.component.scss']
})
export class FractionUniformityScoreComponent implements OnChanges {


  @Input() fraction!: Fraction;


  public chartData: ChartConfiguration['data'] = initialHistoryChartData();
  public chartOptions: ChartConfiguration['options'] = initialHistoryChartOptions(
    (val) => val === +val ? val.toFixed(3) : val
  );


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['fraction']) {
      mapHistoryDataToChartDataAndLabels(this.chartData, this.fraction.statsHistory.uniformityScore);
    }

  }


}
