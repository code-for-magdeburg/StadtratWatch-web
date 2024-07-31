import { Component, OnInit } from '@angular/core';
import { MetadataService } from '../services/metadata.service';
import { MetadataDto } from '../model/Metadata';
import { environment } from '../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { ELECTORAL_PERIOD_PATH } from '../app-routing.module';


@Component({
  selector: 'app-electoral-period',
  templateUrl: './electoral-period.component.html',
  styleUrls: ['./electoral-period.component.scss']
})
export class ElectoralPeriodComponent implements OnInit {


  protected readonly ELECTORAL_PERIOD_PATH = ELECTORAL_PERIOD_PATH;


  public electoralPeriod = environment.currentElectoralPeriod;
  public metadata: MetadataDto | undefined;


  constructor(private readonly route: ActivatedRoute, private readonly router: Router,
              private readonly metadataService: MetadataService) {
  }


  async ngOnInit() {

    this.route.params.subscribe(async params => {

      const { electoralPeriod } = params;
      if (electoralPeriod) {
        this.electoralPeriod = electoralPeriod;
      } else {
        await this.router.navigate(['/', ELECTORAL_PERIOD_PATH, this.electoralPeriod]);
      }

      this.metadata = await this.metadataService.fetchMetadata(this.electoralPeriod);

    });

  }


}
