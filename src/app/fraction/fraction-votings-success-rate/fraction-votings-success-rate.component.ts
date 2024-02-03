import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Fraction } from '../fraction.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import 'chartjs-adapter-date-fns';


@Component({
  selector: 'app-fraction-votings-success-rate',
  templateUrl: './fraction-votings-success-rate.component.html',
  styleUrls: ['./fraction-votings-success-rate.component.scss']
})
export class FractionVotingsSuccessRateComponent implements OnChanges {


  @Input() fraction!: Fraction;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;


  public chartData: ChartConfiguration['data'] = FractionVotingsSuccessRateComponent.initialChartData();
  public chartOptions: ChartConfiguration['options'] = FractionVotingsSuccessRateComponent.initialChartOptions();


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['fraction']) {
      this.chartData.datasets = [
        {
          data: this.fraction.statsHistory.votingsSuccessRate.map(value => value.value),
          fill: 'origin',
        }
      ];
      this.chartData.labels = this.fraction.statsHistory.votingsSuccessRate.map(value => value.date);
    }

  }


  private static initialChartData(): ChartConfiguration['data'] {
    return { datasets: [], labels: [] };
  }


  private static initialChartOptions(): ChartConfiguration['options'] {

    return {
      elements: { line: { tension: 0.5 } },
      scales: {
        x: { type: 'time' },
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
