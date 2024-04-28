import { Component, OnInit } from '@angular/core';
import { MetadataService } from '../services/metadata.service';
import { MetadataDto } from '../model/Metadata';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  public metadata: MetadataDto | undefined;

  constructor(private readonly metadataService: MetadataService) {
  }


  ngOnInit() {
    this.metadataService
      .fetchMetadata()
      .subscribe(metadata => this.metadata = metadata);
  }


}
