import { Component, Inject, Input, OnChanges, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { FractionLightDto } from '../../model/Fraction';
import { PartyDto } from '../../model/Party';
import { isPlatformBrowser } from '@angular/common';


export class UniformityScoreChartData {

  constructor(public readonly name: string, public readonly value: number) {
  }

  public static fromFraction(fraction: FractionLightDto): UniformityScoreChartData {
    return new UniformityScoreChartData(fraction.name, fraction.uniformityScore);
  }

  public static fromParty(party: PartyDto): UniformityScoreChartData {
    return new UniformityScoreChartData(party.name, party.uniformityScore);
  }

}


@Component({
  selector: 'app-uniformity-score-chart',
  templateUrl: './uniformity-score-chart.component.html',
  styleUrls: ['./uniformity-score-chart.component.scss']
})
export class UniformityScoreChartComponent implements OnChanges {


  public isBrowser = false;
  public chartHeight = 0;
  public uniformityScoreChartData: ChartConfiguration<'bar'>['data'] | undefined = undefined;
  public uniformityScoreChartOptions: ChartConfiguration<'bar'>['options'] | undefined = undefined;


  @Input() data: UniformityScoreChartData[] = [];


  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser  = isPlatformBrowser(this.platformId);
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.setUpUniformityScoreChart(changes['data'].currentValue);
    }
  }


  private setUpUniformityScoreChart(data: UniformityScoreChartData[]) {

    const uniformityScoreData = data
      .slice()
      .sort((a, b) => b.value - a.value);

    this.uniformityScoreChartData = {
      labels: uniformityScoreData.map(d => `${d.name} ${d.value.toFixed(3)}`),
      datasets: [{ data: uniformityScoreData.map(d => d.value) }]
    };

    this.uniformityScoreChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: { display: false, max: 1, ticks: { display: false } },
        y: {
          grid: { display: false, drawTicks: false, drawBorder: false },
          ticks: { mirror: true, color: 'black', font: { size: 14 }, z: 1 }
        }
      }
    };

    this.chartHeight = uniformityScoreData.length * 40;

  }


}
