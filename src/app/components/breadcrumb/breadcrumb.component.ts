import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ELECTORAL_PERIOD_PATH } from '../../app-routing.module';
import { RouterLink } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';


export type BreadcrumbItem = {
  title: string;
  path: string[] | null;
};


@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink, NgForOf, NgIf],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent implements OnChanges {


  protected readonly ELECTORAL_PERIOD_PATH = ELECTORAL_PERIOD_PATH;

  public breadcrumbItems: BreadcrumbItem[] = [];


  @Input() public electoralPeriod: string = '';
  @Input() public breadcrumbSubItems: BreadcrumbItem[] = [];
  @Input() public currentPageTitle: string = '';


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['electoralPeriod'] || changes['breadcrumbSubItems'] || changes['currentPageTitle']) {

      const breadcrumbRootPath: string[] = ['/', ELECTORAL_PERIOD_PATH, this.electoralPeriod];

      this.breadcrumbItems = [{ title: 'Startseite', path: breadcrumbRootPath }];

      this.breadcrumbSubItems.forEach(item => {
        this.breadcrumbItems.push({
          title: item.title,
          path: [...breadcrumbRootPath, ...item.path || []]
        });
      });

      this.breadcrumbItems.push({ title: this.currentPageTitle, path: null });

    }
  }


}
