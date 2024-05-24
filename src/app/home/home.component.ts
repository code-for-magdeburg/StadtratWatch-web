import { Component, OnInit } from '@angular/core';
import { MetadataService } from '../services/metadata.service';
import { MetadataDto } from '../model/Metadata';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  public electionPeriod = environment.currentElectionPeriod;
  public metadata: MetadataDto | undefined;


  constructor(private readonly metadataService: MetadataService) {
  }


  async ngOnInit() {
    this.metadata = await this.metadataService.fetchMetadata(environment.currentElectionPeriod);
  }


}
