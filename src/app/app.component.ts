import { Component, OnDestroy } from '@angular/core';
import { MetadataDto } from './model/Metadata';
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

  private navigationSubscription: Subscription;


  constructor(private readonly router: Router, private readonly metadataService: MetadataService) {

    this.navigationSubscription = this.router.events
      .pipe(
        filter((event: any) => event instanceof NavigationEnd),
        map(event => event as NavigationEnd),
        filter(event => event.url.startsWith(`/${ELECTORAL_PERIOD_PATH}`)),
        map(event => event.url.split('/')[2]),
        // Old route /ep/7 was replace with /ep/magdeburg-7
        map(electoralPeriodSlug => electoralPeriodSlug === '7' ? 'magdeburg-7' : electoralPeriodSlug),
        // Old route /ep/8 was replace with /ep/magdeburg-8
        map(electoralPeriodSlug => electoralPeriodSlug === '8' ? 'magdeburg-8' : electoralPeriodSlug)
      )
      .subscribe(async electoralPeriodSlug => {
          this.electoralPeriodSlug = electoralPeriodSlug;
          this.electoralPeriodName = this.availableElectoralPeriods.find(
            p => p.slug === electoralPeriodSlug
          )?.name || '';
          this.metadata = await this.metadataService.fetchMetadata(this.electoralPeriodSlug);
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


}
