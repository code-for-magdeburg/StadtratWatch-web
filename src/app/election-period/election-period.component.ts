import { Component, OnInit } from '@angular/core';
import { MetadataService } from '../services/metadata.service';
import { MetadataDto } from '../model/Metadata';
import { environment } from '../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { ELECTION_PERIOD_PATH } from '../app-routing.module';


@Component({
  selector: 'app-election-period',
  templateUrl: './election-period.component.html',
  styleUrls: ['./election-period.component.scss']
})
export class ElectionPeriodComponent implements OnInit {


  protected readonly ELECTION_PERIOD_PATH = ELECTION_PERIOD_PATH;


  public electionPeriod = environment.currentElectionPeriod;
  public metadata: MetadataDto | undefined;


  constructor(private readonly route: ActivatedRoute, private readonly router: Router,
              private readonly metadataService: MetadataService) {
  }


  async ngOnInit() {

    this.route.params.subscribe(async params => {

      const { electionPeriod } = params as { electionPeriod: number };
      if (electionPeriod) {
        this.electionPeriod = electionPeriod;
      } else {
        await this.router.navigate(['/', ELECTION_PERIOD_PATH, this.electionPeriod]);
      }

      this.metadata = await this.metadataService.fetchMetadata(this.electionPeriod);

    });

  }


}
