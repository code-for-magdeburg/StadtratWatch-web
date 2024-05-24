import { Component, OnInit } from '@angular/core';
import { MetadataDto } from './model/Metadata';
import { MetadataService } from './services/metadata.service';
import { environment } from '../environments/environment';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {


  public navbarCollapsed = true;
  public electionPeriod = environment.currentElectionPeriod;
  public metadata: MetadataDto | undefined;


  constructor(private readonly route: ActivatedRoute, private readonly metadataService: MetadataService) {
  }


  async ngOnInit() {

    this.route.params.subscribe(async params => {

      const { electionPeriod } = params as { electionPeriod: number };
      if (electionPeriod) {
        this.electionPeriod = electionPeriod;
      }

      this.metadata = await this.metadataService.fetchMetadata(this.electionPeriod);

    });

  }


}
