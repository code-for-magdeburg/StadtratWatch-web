import { Component, Inject, Input, OnChanges, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { FractionLightDto } from '../../model/Fraction';
import { PartyDto } from '../../model/Party';
import { isPlatformBrowser } from '@angular/common';


export class AbstentionRateChartData {

  constructor(public readonly name: string, public readonly value: number) {
  }

  public static fromFraction(fraction: FractionLightDto): AbstentionRateChartData {
    return new AbstentionRateChartData(fraction.name, fraction.abstentionRate * 100);
  }

  public static fromParty(party: PartyDto): AbstentionRateChartData {
    return new AbstentionRateChartData(party.name, party.abstentionRate * 100);
  }

}


@Component({
  selector: 'app-abstention-rate-chart',
  templateUrl: './abstention-rate-chart.component.html',
  styleUrls: ['./abstention-rate-chart.component.scss']
})
export class AbstentionRateChartComponent implements OnChanges {


  public isBrowser = false;
  public chartHeight = 0;
  public abstentionRateChartData: ChartConfiguration<'bar'>['data'] | undefined = undefined;
  public abstentionRateChartOptions: ChartConfiguration<'bar'>['options'] | undefined = undefined;


  @Input() data: AbstentionRateChartData[] = [];


  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser  = isPlatformBrowser(this.platformId);
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.setUpAbstentionRateChart(changes['data'].currentValue);
    }
  }


  private setUpAbstentionRateChart(data: AbstentionRateChartData[]) {

    const abstentionRateData = data
      .slice()
      .sort((a, b) => b.value - a.value);

    this.abstentionRateChartData = {
      labels: abstentionRateData.map(d => `${d.name} ${d.value.toFixed(1)}%`),
      datasets: [{ data: abstentionRateData.map(d => d.value) }]
    };

    this.abstentionRateChartOptions = {
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

    this.chartHeight = abstentionRateData.length * 40;

  }


}
