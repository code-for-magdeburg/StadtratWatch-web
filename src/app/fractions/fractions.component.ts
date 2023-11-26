import { Component, QueryList, ViewChildren } from '@angular/core';
import { FractionDto } from '../model/Fraction';
import { FractionsService } from '../services/fractions.service';
import { compare, SortableFractionsDirective, SortFractionsEvent } from './sortable-fractions.directive';
import { ChartConfiguration } from 'chart.js';


@Component({
  selector: 'app-fractions',
  templateUrl: './fractions.component.html',
  styleUrls: ['./fractions.component.scss']
})
export class FractionsComponent {


  private data: FractionDto[] = [];

  public fractions: FractionDto[] = [];
  public sortedFractions: FractionDto[] = [];

  public applicationSuccessRateChartData: ChartConfiguration<'bar'>['data'] | undefined = undefined;
  public applicationSuccessRateChartOptions: ChartConfiguration<'bar'>['options'] | undefined = undefined;

  @ViewChildren(SortableFractionsDirective) headers: QueryList<SortableFractionsDirective> | undefined;


  constructor(private readonly fractionsService: FractionsService) {
  }


  //noinspection JSUnusedGlobalSymbols
  ngOnInit() {

    this.fractionsService
      .fetchFractions()
      .subscribe(fractions => {
        this.fractions = this.sortedFractions = this.data = fractions;
        this.sortedFractions.sort((a, b) => b.membersCount - a.membersCount);

        this.setUpApplicationSuccessRateChart(fractions);
      });

  }


  onSort(sortEvent: SortFractionsEvent) {

    if (!this.headers) {
      return;
    }

    this.headers.forEach((header) => {
      if (header.sortableFractions !== sortEvent.column) {
        header.direction = '';
      }
    });

    if (sortEvent.direction === '' || sortEvent.column === '') {
      this.sortedFractions = this.data;
    } else {
      this.sortedFractions = [...this.data].sort((a, b) => {
        const aValue = sortEvent.column === '' ? '' : a[sortEvent.column];
        const bValue = sortEvent.column === '' ? '' : b[sortEvent.column];
        const res = compare(aValue, bValue);
        return sortEvent.direction === 'asc' ? res : -res;
      });
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
