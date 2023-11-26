import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { FractionDto } from '../../model/Fraction';


@Component({
  selector: 'app-application-success-rate-chart',
  templateUrl: './application-success-rate-chart.component.html',
  styleUrls: ['./application-success-rate-chart.component.scss']
})
export class ApplicationSuccessRateChartComponent {


  public applicationSuccessRateChartData: ChartConfiguration<'bar'>['data'] | undefined = undefined;
  public applicationSuccessRateChartOptions: ChartConfiguration<'bar'>['options'] | undefined = undefined;


  @Input() fractions: FractionDto[] = [];


  //noinspection JSUnusedGlobalSymbols
  ngOnChanges(changes: SimpleChanges) {
    if (changes['fractions']) {
      this.setUpApplicationSuccessRateChart(changes['fractions'].currentValue);
    }
  }


  private setUpApplicationSuccessRateChart(fractions: FractionDto[]) {

    const applicationsSuccessRateData = fractions
      .map(f => ({
        fraction: f.name,
        value: f.applicationsSuccessRate * 100
      }))
      .sort((a, b) => b.value - a.value);

    this.applicationSuccessRateChartData = {
      labels: applicationsSuccessRateData.map(
        fraction => `${fraction.fraction} ${fraction.value.toFixed(1)}%`
      ),
      datasets: [{ data: applicationsSuccessRateData.map(fraction => fraction.value) }]
    };

    this.applicationSuccessRateChartOptions = {
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
