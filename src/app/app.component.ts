import { Component, OnDestroy } from '@angular/core';
import { MetadataDto } from '../interfaces/Metadata';
import { MetadataService } from './services/metadata.service';
import { environment } from '../environments/environment';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';
import { ELECTORAL_PERIOD_PATH } from './app-routing.module';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {


  protected readonly ELECTORAL_PERIOD_PATH = ELECTORAL_PERIOD_PATH;

  public navbarCollapsed = true;
  public availableElectoralPeriods = environment.availableElectoralPeriods;
  public electoralPeriodSlug = environment.currentElectoralPeriod;
  public electoralPeriodName = '';
  public metadata: MetadataDto | undefined;
  public searchQuery = '';

  private navigationSubscription: Subscription;


  constructor(private readonly router: Router, private readonly metadataService: MetadataService) {

    this.navigationSubscription = this.router.events
      .pipe(
        filter((event: any) => event instanceof NavigationEnd),
        map(event => event as NavigationEnd),
      )
      .subscribe(async event => {
          const electoralPeriodSlug = event.url.startsWith(`/${ELECTORAL_PERIOD_PATH}/`)
            ? event.url.split('/')[2]
            : environment.currentElectoralPeriod;
          if (this.electoralPeriodSlug !== electoralPeriodSlug || !this.metadata) {
            // Temporary fix: The slug "7" is used for the electoral period "Magdeburg 7".
            this.electoralPeriodSlug = electoralPeriodSlug === '7' ? 'magdeburg-7' : electoralPeriodSlug;
            this.electoralPeriodName = this.availableElectoralPeriods.find(
              p => p.slug === electoralPeriodSlug
            )?.name || '';
            this.metadata = await this.metadataService.fetchMetadata(this.electoralPeriodSlug);
          }
        }
      );


  }


  ngOnDestroy() {
    this.navigationSubscription.unsubscribe();
  }


  async selectElectoralPeriod(electoralPeriodSlug: string) {

    if (this.electoralPeriodSlug !== electoralPeriodSlug) {
      await this.router.navigate(['/', ELECTORAL_PERIOD_PATH, electoralPeriodSlug]);
    }

  }


  async search() {

    if (this.searchQuery) {
      await this.router.navigate(
        ['search'],
        { queryParams: { q: this.searchQuery }}
      );
      this.searchQuery = '';
    }

  }


}
