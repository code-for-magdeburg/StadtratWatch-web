import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { SessionDetailsDto } from '../../model/Session';
import { BaseChartDirective } from 'ng2-charts';


export class SpeakingTimeChartData {

  constructor(public readonly speaker: string, public readonly totalDurationSeconds: number,
              public readonly totalDurationDisplay: string) {
  }

  public static fromSession(session: SessionDetailsDto): SpeakingTimeChartData[] {

    return session.speakingTimes.map(speakingTime => {

      const totalDurationSeconds = speakingTime.segments.reduce(
        (total, segment) => total + segment.duration,
        0
      );
      const totalDurationDisplay = `${Math.floor(totalDurationSeconds / 60)} min ${Math.round(totalDurationSeconds % 60)} sec`;

      return new SpeakingTimeChartData(speakingTime.speaker, totalDurationSeconds, totalDurationDisplay);

    });

  }

}


@Component({
  selector: 'app-speaking-time-chart',
  templateUrl: './speaking-time-chart.component.html',
  styleUrls: ['./speaking-time-chart.component.scss']
})
export class SpeakingTimeChartComponent implements OnChanges {


  public chartHeight = 0;
  public chartData: ChartConfiguration<'bar'>['data'] | undefined = undefined;
  public chartOptions: ChartConfiguration<'bar'>['options'] | undefined = undefined;


  @Input() data: SpeakingTimeChartData[] = [];

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.setUpSpeakingTimeChart(changes['data'].currentValue);
    }
  }


  private setUpSpeakingTimeChart(data: SpeakingTimeChartData[]) {

    const speakingTimes = data
      .slice()
      .sort((a, b) => b.totalDurationSeconds - a.totalDurationSeconds);

    this.chartData = {
      labels: speakingTimes.map(speakingTime => `${speakingTime.speaker} (${speakingTime.totalDurationDisplay})`),
      datasets: [{ data: speakingTimes.map(speakingTime => speakingTime.totalDurationSeconds) }]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: { display: false, ticks: { display: false } },
        y: {
          grid: { display: false, drawTicks: false, drawBorder: false },
          ticks: { mirror: true, color: 'black', font: { size: 14 }, z: 1 }
        }
      }
    };

    this.chartHeight = speakingTimes.length * 40;

  }


}
