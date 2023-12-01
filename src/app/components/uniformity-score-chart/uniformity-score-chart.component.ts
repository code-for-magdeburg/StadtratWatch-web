import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { FractionDto } from '../../model/Fraction';
import { PartyDto } from '../../model/Party';


export class UniformityScoreChartData {

  constructor(public readonly name: string, public readonly value: number) {
  }

  public static fromFraction(fraction: FractionDto): UniformityScoreChartData {
    return new UniformityScoreChartData(fraction.name, fraction.uniformityScore);
  }

  public static fromParty(party: PartyDto): UniformityScoreChartData {
    return new UniformityScoreChartData(party.name, party.uniformityScore);
  }

}


@Component({
  selector: 'app-uniformity-score-chart',
  templateUrl: './uniformity-score-chart.component.html',
  styleUrls: ['./uniformity-score-chart.component.scss']
})
export class UniformityScoreChartComponent {


  public uniformityScoreChartData: ChartConfiguration<'bar'>['data'] | undefined = undefined;
  public uniformityScoreChartOptions: ChartConfiguration<'bar'>['options'] | undefined = undefined;


  @Input() data: UniformityScoreChartData[] = [];


  //noinspection JSUnusedGlobalSymbols
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.setUpUniformityScoreChart(changes['data'].currentValue);
    }
  }


  private setUpUniformityScoreChart(data: UniformityScoreChartData[]) {

    const uniformityScoreData = data
      .slice()
      .sort((a, b) => b.value - a.value);

    this.uniformityScoreChartData = {
      labels: uniformityScoreData.map(d => `${d.name} ${d.value.toFixed(3)}`),
      datasets: [{ data: uniformityScoreData.map(d => d.value) }]
    };

    this.uniformityScoreChartOptions = {
      responsive: true,
      indexAxis: 'y',
      scales: {
        x: { display: false, max: 1, ticks: { display: false } },
        y: {
          grid: { display: false, drawTicks: false, drawBorder: false },
          ticks: { mirror: true, color: 'black', font: { size: 14 }, z: 1 }
        }
      }
    };

  }


}
