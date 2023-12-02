import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { FractionDto } from '../../model/Fraction';
import { PartyDto } from '../../model/Party';


export class AbstentionRateChartData {

  constructor(public readonly name: string, public readonly value: number) {
  }

  public static fromFraction(fraction: FractionDto): AbstentionRateChartData {
    return new AbstentionRateChartData(fraction.name, fraction.abstentionRate * 100);
  }

  public static fromParty(party: PartyDto): AbstentionRateChartData {
    return new AbstentionRateChartData(party.name, party.abstentionRate * 100);
  }

}


@Component({
  selector: 'app-abstention-rate-chart',
  templateUrl: './abstention-rate-chart.component.html',
  styleUrls: ['./abstention-rate-chart.component.scss']
})
export class AbstentionRateChartComponent {


  public abstentionRateChartData: ChartConfiguration<'bar'>['data'] | undefined = undefined;
  public abstentionRateChartOptions: ChartConfiguration<'bar'>['options'] | undefined = undefined;


  @Input() data: AbstentionRateChartData[] = [];


  //noinspection JSUnusedGlobalSymbols
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.setUpAbstentionRateChart(changes['data'].currentValue);
    }
  }


  private setUpAbstentionRateChart(data: AbstentionRateChartData[]) {

    const abstentionRateData = data
      .slice()
      .sort((a, b) => b.value - a.value);

    this.abstentionRateChartData = {
      labels: abstentionRateData.map(d => `${d.name} ${d.value.toFixed(1)}%`),
      datasets: [{ data: abstentionRateData.map(d => d.value) }]
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
