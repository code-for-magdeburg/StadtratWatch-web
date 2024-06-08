import { Component, Inject, Input, OnChanges, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { FactionLightDto } from '../../model/Faction';
import { isPlatformBrowser } from '@angular/common';


export class ApplicationsSuccessRateChartData {

  constructor(public readonly name: string, public readonly value: number) {
  }

  public static fromFaction(faction: FactionLightDto): ApplicationsSuccessRateChartData {
    return new ApplicationsSuccessRateChartData(faction.name, faction.applicationsSuccessRate * 100);
  }

}


@Component({
  selector: 'app-applications-success-rate-chart',
  templateUrl: './applications-success-rate-chart.component.html',
  styleUrls: ['./applications-success-rate-chart.component.scss']
})
export class ApplicationsSuccessRateChartComponent implements OnChanges {


  public isBrowser = false;
  public chartHeight = 0;
  public applicationSuccessRateChartData: ChartConfiguration<'bar'>['data'] | undefined = undefined;
  public applicationsSuccessRateChartOptions: ChartConfiguration<'bar'>['options'] | undefined = undefined;


  @Input() data: ApplicationsSuccessRateChartData[] = [];


  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser  = isPlatformBrowser(this.platformId);
  }


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
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: { display: false, max: 100, ticks: { display: false } },
        y: {
          grid: { display: false, drawTicks: false, drawBorder: false },
          ticks: { mirror: true, color: 'black', font: { size: 14 }, z: 1 }
        }
      }
    };

    this.chartHeight = applicationsSuccessRateData.length * 40;

  }


}
