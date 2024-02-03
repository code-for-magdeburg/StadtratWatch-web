import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Fraction } from '../fraction.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import 'chartjs-adapter-date-fns';


@Component({
  selector: 'app-fraction-abstention-rate',
  templateUrl: './fraction-abstention-rate.component.html',
  styleUrls: ['./fraction-abstention-rate.component.scss']
})
export class FractionAbstentionRateComponent implements OnChanges {


  @Input() fraction!: Fraction;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;


  public chartData: ChartConfiguration['data'] = FractionAbstentionRateComponent.initialChartData();
  public chartOptions: ChartConfiguration['options'] = FractionAbstentionRateComponent.initialChartOptions();


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['fraction']) {
      this.chartData.datasets = [
        {
          data: this.fraction.statsHistory.abstentionRate.map(value => value.value),
          fill: 'origin',
        }
      ];
      this.chartData.labels = this.fraction.statsHistory.abstentionRate.map(value => value.date);
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
