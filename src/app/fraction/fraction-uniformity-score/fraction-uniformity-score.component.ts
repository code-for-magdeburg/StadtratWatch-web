import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Fraction } from '../fraction.component';
import { ChartConfiguration } from 'chart.js';
import 'chartjs-adapter-date-fns';
import {
  initialHistoryChartData,
  initialHistoryChartOptions,
  mapHistoryDataToChartDataAndLabels
} from '../../utilities/chart-helpers';
import { BaseChartDirective } from 'ng2-charts';


@Component({
  selector: 'app-fraction-uniformity-score',
  templateUrl: './fraction-uniformity-score.component.html',
  styleUrls: ['./fraction-uniformity-score.component.scss']
})
export class FractionUniformityScoreComponent implements OnChanges {


  @Input() fraction!: Fraction;

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  public chartData: ChartConfiguration['data'] = initialHistoryChartData();
  public chartOptions: ChartConfiguration['options'] = initialHistoryChartOptions(
    (val) => val === +val ? val.toFixed(3) : val
  );


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['fraction']) {
      mapHistoryDataToChartDataAndLabels(this.chartData, this.fraction.statsHistory.uniformityScore);
      if (!changes['fraction'].firstChange) {
        this.chart.update();
      }
    }

  }


}
