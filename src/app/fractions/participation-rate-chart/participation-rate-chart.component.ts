import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { FractionDto } from '../../model/Fraction';


@Component({
  selector: 'app-participation-rate-chart',
  templateUrl: './participation-rate-chart.component.html',
  styleUrls: ['./participation-rate-chart.component.scss']
})
export class ParticipationRateChartComponent {


  public participationRateChartData: ChartConfiguration<'bar'>['data'] | undefined = undefined;
  public participationRateChartOptions: ChartConfiguration<'bar'>['options'] | undefined = undefined;


  @Input() fractions: FractionDto[] = [];


  //noinspection JSUnusedGlobalSymbols
  ngOnChanges(changes: SimpleChanges) {
    if (changes['fractions']) {
      this.setUpParticipationRateChart(changes['fractions'].currentValue);
    }
  }


  private setUpParticipationRateChart(fractions: FractionDto[]) {

    const participationRateData = fractions
      .map(fraction => ({ fraction: fraction.name, value: fraction.participationRate * 100 }))
      .sort((a, b) => b.value - a.value);

    this.participationRateChartData = {
      labels: participationRateData.map(
        fraction => `${fraction.fraction} ${fraction.value.toFixed(1)}%`
      ),
      datasets: [{ data: participationRateData.map(fraction => fraction.value) }]
    };

    this.participationRateChartOptions = {
      responsive: true,
      indexAxis: 'y',
      scales: {
        x: { display: false, max: 100, ticks: { display: false } },
        y: {
          grid: { display: false, drawTicks: false, drawBorder: false },
          ticks: { mirror: true, color: 'black', font: { size: 14 }, z: 1 }
        }
      }
    };

  }


}
