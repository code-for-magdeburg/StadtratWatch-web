import { Component, Inject, Input, OnChanges, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { Faction } from '../faction.component';
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
  selector: 'app-faction-uniformity-score',
  templateUrl: './faction-uniformity-score.component.html',
  styleUrls: ['./faction-uniformity-score.component.scss']
})
export class FactionUniformityScoreComponent implements OnChanges {


  @Input() faction!: Faction;

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

    if (changes['faction']) {
      mapHistoryDataToChartDataAndLabels(this.chartData, this.faction.statsHistory.uniformityScore);
      if (!changes['faction'].firstChange) {
        this.chart.update();
      }
    }

  }


}
