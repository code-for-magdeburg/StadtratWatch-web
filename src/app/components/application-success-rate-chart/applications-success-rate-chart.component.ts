import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { FractionDto } from '../../model/Fraction';


export class ApplicationsSuccessRateChartData {

  constructor(public readonly name: string, public readonly value: number) {
  }

  public static fromFraction(fraction: FractionDto): ApplicationsSuccessRateChartData {
    return new ApplicationsSuccessRateChartData(fraction.name, fraction.applicationsSuccessRate * 100);
  }

}


@Component({
  selector: 'app-applications-success-rate-chart',
  templateUrl: './applications-success-rate-chart.component.html',
  styleUrls: ['./applications-success-rate-chart.component.scss']
})
export class ApplicationsSuccessRateChartComponent {


  public applicationSuccessRateChartData: ChartConfiguration<'bar'>['data'] | undefined = undefined;
  public applicationsSuccessRateChartOptions: ChartConfiguration<'bar'>['options'] | undefined = undefined;


  @Input() data: ApplicationsSuccessRateChartData[] = [];


  //noinspection JSUnusedGlobalSymbols
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.setUpApplicationsSuccessRateChart(changes['data'].currentValue);
    }
  }


  private setUpApplicationsSuccessRateChart(data: ApplicationsSuccessRateChartData[]) {

    const applicationsSuccessRateData = data
      .slice()
      .sort((a, b) => b.value - a.value);

    this.applicationSuccessRateChartData = {
      labels: applicationsSuccessRateData.map(
        d => `${d.name} ${d.value.toFixed(1)}%`
      ),
      datasets: [{ data: applicationsSuccessRateData.map(d => d.value) }]
    };

    this.applicationsSuccessRateChartOptions = {
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
