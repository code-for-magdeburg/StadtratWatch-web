import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { PersonDetailsDto } from '../../model/Person';
import { ChartConfiguration } from 'chart.js';
import {
  initialHistoryChartData,
  initialHistoryChartOptions,
  mapHistoryDataToChartDataAndLabels
} from '../../utilities/chart-helpers';
import { BaseChartDirective } from 'ng2-charts';
import 'chartjs-adapter-date-fns';


@Component({
  selector: 'app-person-voting-attendance',
  templateUrl: './person-voting-attendance.component.html',
  styleUrls: ['./person-voting-attendance.component.scss']
})
export class PersonVotingAttendanceComponent implements OnChanges {


  @Input() person!: PersonDetailsDto;
  @Input() didVote = 0;

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;


  public chartData: ChartConfiguration['data'] = initialHistoryChartData();
  public chartOptions: ChartConfiguration['options'] = initialHistoryChartOptions(
    (val) => val === +val ? `${(val * 100).toFixed(2)}%` : val
  );


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['person']) {
      mapHistoryDataToChartDataAndLabels(this.chartData, this.person.statsHistory.votingAttendance);
      if (!changes['person'].firstChange) {
        this.chart.update();
      }
    }

  }


}
