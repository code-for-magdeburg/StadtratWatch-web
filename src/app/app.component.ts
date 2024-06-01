import { Component, OnDestroy } from '@angular/core';
import { MetadataDto } from './model/Metadata';
import { MetadataService } from './services/metadata.service';
import { environment } from '../environments/environment';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';
import { ELECTION_PERIOD_PATH } from './app-routing.module';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {


  protected readonly ELECTION_PERIOD_PATH = ELECTION_PERIOD_PATH;

  public navbarCollapsed = true;
  public electionPeriod = environment.currentElectionPeriod;
  public metadata: MetadataDto | undefined;

  private navigationSubscription: Subscription;


  constructor(private readonly router: Router, private readonly metadataService: MetadataService) {

    this.navigationSubscription = this.router.events
      .pipe(
        filter((event: any) => event instanceof NavigationEnd),
        map(event => event as NavigationEnd),
        filter(event => event.url.startsWith(`/${ELECTION_PERIOD_PATH}`)),
        map(event => event.url.split('/')[2]),
      )
      .subscribe(electionPeriod => {
          this.electionPeriod = +electionPeriod;
          this.metadataService
            .fetchMetadata(this.electionPeriod)
            .then(metadata => this.metadata = metadata);
        }
      );


  }


  ngOnDestroy() {
    this.navigationSubscription.unsubscribe();
  }


}
