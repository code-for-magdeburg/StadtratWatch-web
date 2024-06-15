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
  public electoralPeriod = environment.currentElectoralPeriod;
  public metadata: MetadataDto | undefined;

  private navigationSubscription: Subscription;


  constructor(private readonly router: Router, private readonly metadataService: MetadataService) {

    this.navigationSubscription = this.router.events
      .pipe(
        filter((event: any) => event instanceof NavigationEnd),
        map(event => event as NavigationEnd),
        filter(event => event.url.startsWith(`/${ELECTORAL_PERIOD_PATH}`)),
        map(event => event.url.split('/')[2]),
      )
      .subscribe(async electoralPeriod => {
          this.electoralPeriod = +electoralPeriod;
          this.metadata = await this.metadataService.fetchMetadata(this.electoralPeriod);
        }
      );


  }


  ngOnDestroy() {
    this.navigationSubscription.unsubscribe();
  }


  async selectElectoralPeriod(electoralPeriod: number) {

    if (this.electoralPeriod !== electoralPeriod) {
      await this.router.navigate(['/', ELECTORAL_PERIOD_PATH, electoralPeriod]);
    }

  }


}
