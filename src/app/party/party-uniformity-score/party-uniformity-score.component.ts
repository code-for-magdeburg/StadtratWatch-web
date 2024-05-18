import { Component, Inject, Input, OnChanges, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { Party } from '../party.component';
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
  selector: 'app-party-uniformity-score',
  templateUrl: './party-uniformity-score.component.html',
  styleUrls: ['./party-uniformity-score.component.scss']
})
export class PartyUniformityScoreComponent implements OnChanges {


  @Input() party!: Party;

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

    if (changes['party']) {
      mapHistoryDataToChartDataAndLabels(this.chartData, this.party.statsHistory.uniformityScore);
      if (!changes['party'].firstChange) {
        this.chart.update();
      }
    }

  }


}
