import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { FractionDto } from '../../model/Fraction';


@Component({
  selector: 'app-uniformity-score-chart',
  templateUrl: './uniformity-score-chart.component.html',
  styleUrls: ['./uniformity-score-chart.component.scss']
})
export class UniformityScoreChartComponent {


  public uniformityScoreChartData: ChartConfiguration<'bar'>['data'] | undefined = undefined;
  public uniformityScoreChartOptions: ChartConfiguration<'bar'>['options'] | undefined = undefined;


  @Input() fractions: FractionDto[] = [];


  //noinspection JSUnusedGlobalSymbols
  ngOnChanges(changes: SimpleChanges) {
    if (changes['fractions']) {
      this.setUpUniformityScoreChart(changes['fractions'].currentValue);
    }
  }


  private setUpUniformityScoreChart(fractions: FractionDto[]) {

    const uniformityScoreData = fractions
      .map(f => ({ fraction: f.name, value: f.uniformityScore }))
      .sort((a, b) => b.value - a.value);

    this.uniformityScoreChartData = {
      labels: uniformityScoreData.map(
        fraction => `${fraction.fraction} ${fraction.value.toFixed(3)}`
      ),
      datasets: [{ data: uniformityScoreData.map(fraction => fraction.value) }]
    };

    this.uniformityScoreChartOptions = {
      responsive: true,
      indexAxis: 'y',
      scales: {
        x: { display: false, max: 1, ticks: { display: false } },
        y: {
          grid: { display: false, drawTicks: false, drawBorder: false },
          ticks: { mirror: true, color: 'black', font: { size: 14 }, z: 1 }
        }
      }
    };

  }


}
