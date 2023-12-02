import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { FractionDto } from '../../model/Fraction';
import { PartyDto } from '../../model/Party';


export class VotingsSuccessRateChartData {

  constructor(public readonly name: string, public readonly value: number) {
  }

  public static fromFraction(fraction: FractionDto): VotingsSuccessRateChartData {
    return new VotingsSuccessRateChartData(fraction.name, fraction.votingsSuccessRate * 100);
  }

  public static fromParty(party: PartyDto): VotingsSuccessRateChartData {
    return new VotingsSuccessRateChartData(party.name, party.votingsSuccessRate * 100);
  }

}


@Component({
  selector: 'app-votings-success-rate-chart',
  templateUrl: './votings-success-rate-chart.component.html',
  styleUrls: ['./votings-success-rate-chart.component.scss']
})
export class VotingsSuccessRateChartComponent {


  public votingsSuccessRateChartData: ChartConfiguration<'bar'>['data'] | undefined = undefined;
  public votingsSuccessRateChartOptions: ChartConfiguration<'bar'>['options'] | undefined = undefined;


  @Input() data: VotingsSuccessRateChartData[] = [];


  //noinspection JSUnusedGlobalSymbols
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.setUpVotingsSuccessRateChart(changes['data'].currentValue);
    }
  }


  private setUpVotingsSuccessRateChart(data: VotingsSuccessRateChartData[]) {

    const votingsSuccessRateData = data
      .slice()
      .sort((a, b) => b.value - a.value);

    this.votingsSuccessRateChartData = {
      labels: votingsSuccessRateData.map(d => `${d.name} ${d.value.toFixed(1)}%`),
      datasets: [{ data: votingsSuccessRateData.map(d => d.value) }]
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
