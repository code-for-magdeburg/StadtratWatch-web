import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { FractionDto } from '../../model/Fraction';


@Component({
  selector: 'app-votings-success-rate-chart',
  templateUrl: './votings-success-rate-chart.component.html',
  styleUrls: ['./votings-success-rate-chart.component.scss']
})
export class VotingsSuccessRateChartComponent {


  public votingsSuccessRateChartData: ChartConfiguration<'bar'>['data'] | undefined = undefined;
  public votingsSuccessRateChartOptions: ChartConfiguration<'bar'>['options'] | undefined = undefined;


  @Input() fractions: FractionDto[] = [];


  //noinspection JSUnusedGlobalSymbols
  ngOnChanges(changes: SimpleChanges) {
    if (changes['fractions']) {
      this.setUpVotingsSuccessRateChart(changes['fractions'].currentValue);
    }
  }


  private setUpVotingsSuccessRateChart(fractions: FractionDto[]) {

    const votingsSuccessRateData = fractions
      .map(f => ({
        fraction: f.name,
        value: f.votingsSuccessRate * 100
      }))
      .sort((a, b) => b.value - a.value);

    this.votingsSuccessRateChartData = {
      labels: votingsSuccessRateData.map(
        fraction => `${fraction.fraction} ${fraction.value.toFixed(1)}%`
      ),
      datasets: [{ data: votingsSuccessRateData.map(fraction => fraction.value) }]
    };

    this.votingsSuccessRateChartOptions = {
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
