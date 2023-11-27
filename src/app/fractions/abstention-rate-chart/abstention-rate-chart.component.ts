import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { FractionDto } from '../../model/Fraction';


@Component({
  selector: 'app-abstention-rate-chart',
  templateUrl: './abstention-rate-chart.component.html',
  styleUrls: ['./abstention-rate-chart.component.scss']
})
export class AbstentionRateChartComponent {


  public abstentionRateChartData: ChartConfiguration<'bar'>['data'] | undefined = undefined;
  public abstentionRateChartOptions: ChartConfiguration<'bar'>['options'] | undefined = undefined;


  @Input() fractions: FractionDto[] = [];


  //noinspection JSUnusedGlobalSymbols
  ngOnChanges(changes: SimpleChanges) {
    if (changes['fractions']) {
      this.setUpAbstentionRateChart(changes['fractions'].currentValue);
    }
  }


  private setUpAbstentionRateChart(fractions: FractionDto[]) {

    const abstentionRateData = fractions
      .map(fraction => ({ fraction: fraction.name, value: fraction.abstentionRate * 100 }))
      .sort((a, b) => b.value - a.value);

    this.abstentionRateChartData = {
      labels: abstentionRateData.map(
        fraction => `${fraction.fraction} ${fraction.value.toFixed(1)}%`
      ),
      datasets: [{ data: abstentionRateData.map(fraction => fraction.value) }]
    };

    this.abstentionRateChartOptions = {
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
