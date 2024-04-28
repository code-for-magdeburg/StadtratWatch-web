import { Component, Inject, Input, OnChanges, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { Fraction } from '../fraction.component';
import { ChartConfiguration } from 'chart.js';
import 'chartjs-adapter-date-fns';
import {
  initialHistoryChartData,
  initialHistoryChartOptions,
  mapHistoryDataToChartDataAndLabels
} from '../../utilities/chart-helpers';
import { BaseChartDirective } from 'ng2-charts';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-fraction-uniformity-score',
  templateUrl: './fraction-uniformity-score.component.html',
  styleUrls: ['./fraction-uniformity-score.component.scss']
})
export class FractionUniformityScoreComponent implements OnChanges {


  @Input() fraction!: Fraction;

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  public isBrowser = false;
  public chartData: ChartConfiguration['data'] = initialHistoryChartData();
  public chartOptions: ChartConfiguration['options'] = initialHistoryChartOptions(
    (val) => val === +val ? val.toFixed(3) : val
  );


  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser  = isPlatformBrowser(this.platformId);
  }


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['fraction']) {
      mapHistoryDataToChartDataAndLabels(this.chartData, this.fraction.statsHistory.uniformityScore);
      if (!changes['fraction'].firstChange) {
        this.chart.update();
      }
    }

  }


}
