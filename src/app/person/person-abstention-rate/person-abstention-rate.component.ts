import { Component, Inject, Input, OnChanges, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { PersonDetailsDto } from '../../../interfaces/Person';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import {
  initialHistoryChartData,
  initialHistoryChartOptions,
  mapHistoryDataToChartDataAndLabels
} from '../../utilities/chart-helpers';
import 'chartjs-adapter-date-fns';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-person-abstention-rate',
  templateUrl: './person-abstention-rate.component.html',
  styleUrls: ['./person-abstention-rate.component.scss']
})
export class PersonAbstentionRateComponent implements OnChanges {


  @Input() person!: PersonDetailsDto;
  @Input() didVote = 0;

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;


  public isBrowser = false;
  public chartData: ChartConfiguration['data'] = initialHistoryChartData();
  public chartOptions: ChartConfiguration['options'] = initialHistoryChartOptions(
    (val) => val === +val ? `${(val * 100).toFixed(2)}%` : val
  );


  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser  = isPlatformBrowser(this.platformId);
  }


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['person']) {
      mapHistoryDataToChartDataAndLabels(this.chartData, this.person.statsHistory.abstentionRate);
      if (!changes['person'].firstChange) {
        this.chart.update();
      }
    }

  }


}
