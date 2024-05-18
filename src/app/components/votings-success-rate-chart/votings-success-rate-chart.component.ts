import { Component, Inject, Input, OnChanges, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { FractionLightDto } from '../../model/Fraction';
import { PartyDto } from '../../model/Party';
import { isPlatformBrowser } from '@angular/common';


export class VotingsSuccessRateChartData {

  constructor(public readonly name: string, public readonly value: number) {
  }

  public static fromFraction(fraction: FractionLightDto): VotingsSuccessRateChartData {
    return new VotingsSuccessRateChartData(fraction.name, fraction.votingsSuccessRate * 100);
  }

  public static fromParty(party: PartyDto): VotingsSuccessRateChartData {
    return new VotingsSuccessRateChartData(party.name, party.votingsSuccessRate * 100);
  }

}


@Component({
  selector: 'app-votings-success-rate-chart',
  templateUrl: './votings-success-rate-chart.component.html',
  styleUrls: ['./votings-success-rate-chart.component.scss']
})
export class VotingsSuccessRateChartComponent implements OnChanges {


  public isBrowser = false;
  public chartHeight = 0;
  public votingsSuccessRateChartData: ChartConfiguration<'bar'>['data'] | undefined = undefined;
  public votingsSuccessRateChartOptions: ChartConfiguration<'bar'>['options'] | undefined = undefined;


  @Input() data: VotingsSuccessRateChartData[] = [];


  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser  = isPlatformBrowser(this.platformId);
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.setUpVotingsSuccessRateChart(changes['data'].currentValue);
    }
  }


  private setUpVotingsSuccessRateChart(data: VotingsSuccessRateChartData[]) {

    const votingsSuccessRateData = data
      .slice()
      .sort((a, b) => b.value - a.value);

    this.votingsSuccessRateChartData = {
      labels: votingsSuccessRateData.map(d => `${d.name} ${d.value.toFixed(1)}%`),
      datasets: [{ data: votingsSuccessRateData.map(d => d.value) }]
    };

    this.votingsSuccessRateChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: { display: false, max: 100, ticks: { display: false } },
        y: {
          grid: { display: false, drawTicks: false, drawBorder: false },
          ticks: { mirror: true, color: 'black', font: { size: 14 }, z: 1 }
        }
      }
    };

    this.chartHeight = votingsSuccessRateData.length * 40;

  }


}
