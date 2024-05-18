import { Component, Inject, Input, OnChanges, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { FractionLightDto } from '../../model/Fraction';
import { PartyDto } from '../../model/Party';
import { isPlatformBrowser } from '@angular/common';


export class ParticipationRateChartData {

  constructor(public readonly name: string, public readonly value: number) {
  }

  public static fromFraction(fraction: FractionLightDto): ParticipationRateChartData {
    return new ParticipationRateChartData(fraction.name, fraction.participationRate * 100);
  }

  public static fromParty(party: PartyDto): ParticipationRateChartData {
    return new ParticipationRateChartData(party.name, party.participationRate * 100);
  }

}


@Component({
  selector: 'app-participation-rate-chart',
  templateUrl: './participation-rate-chart.component.html',
  styleUrls: ['./participation-rate-chart.component.scss']
})
export class ParticipationRateChartComponent implements OnChanges {


  public isBrowser = false;
  public chartHeight = 0;
  public participationRateChartData: ChartConfiguration<'bar'>['data'] | undefined = undefined;
  public participationRateChartOptions: ChartConfiguration<'bar'>['options'] | undefined = undefined;


  @Input() data: ParticipationRateChartData[] = [];


  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser  = isPlatformBrowser(this.platformId);
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.setUpParticipationRateChart(changes['data'].currentValue);
    }
  }


  private setUpParticipationRateChart(data: ParticipationRateChartData[]) {

    const participationRateData = data
      .slice()
      .sort((a, b) => b.value - a.value);

    this.participationRateChartData = {
      labels: participationRateData.map(d => `${d.name} ${d.value.toFixed(1)}%`),
      datasets: [{ data: participationRateData.map(d => d.value) }]
    };

    this.participationRateChartOptions = {
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

    this.chartHeight = participationRateData.length * 40;

  }


}
