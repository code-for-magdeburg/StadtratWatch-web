import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Fraction } from '../fraction.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import 'chartjs-adapter-date-fns';


@Component({
  selector: 'app-fraction-application-success-rate',
  templateUrl: './fraction-application-success-rate.component.html',
  styleUrls: ['./fraction-application-success-rate.component.scss']
})
export class FractionApplicationSuccessRateComponent implements OnChanges {


  @Input() fraction!: Fraction;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;


  public chartData: ChartConfiguration['data'] = FractionApplicationSuccessRateComponent.initialChartData();
  public chartOptions: ChartConfiguration['options'] = FractionApplicationSuccessRateComponent.initialChartOptions();


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['fraction']) {
      this.chartData.datasets = [
        {
          data: this.fraction.statsHistory.applicationsSuccessRate.map(value => value.value),
          fill: 'origin',
        }
      ];
      this.chartData.labels = this.fraction.statsHistory.applicationsSuccessRate.map(value => value.date);
    }

  }


  private static initialChartData(): ChartConfiguration['data'] {
    return { datasets: [], labels: [] };
  }


  private static initialChartOptions(): ChartConfiguration['options'] {

    return {
      elements: { line: { tension: 0.5 } },
      scales: {
        x: { type: 'time', display: false },
        y: {
          ticks: {
            callback:
              (val) => val === +val ? `${(val * 100).toFixed(0)}%` : val,
          }
        }
      },
      plugins: { legend: { display: false } },
    };

  }


}
