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
  selector: 'app-party-uniformity-score',
  templateUrl: './party-uniformity-score.component.html',
  styleUrls: ['./party-uniformity-score.component.scss']
})
export class PartyUniformityScoreComponent implements OnChanges {


  @Input() party!: Party;

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  public chartData: ChartConfiguration['data'] = initialHistoryChartData();
  public chartOptions: ChartConfiguration['options'] = initialHistoryChartOptions(
    (val) => val === +val ? val.toFixed(3) : val
  );


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['party']) {
      mapHistoryDataToChartDataAndLabels(this.chartData, this.party.statsHistory.uniformityScore);
      if (!changes['party'].firstChange) {
        this.chart.update();
      }
    }

  }


}
