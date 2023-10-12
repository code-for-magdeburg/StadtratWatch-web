import { Component } from '@angular/core';
import { MetadataService } from '../services/metadata.service';
import { MetadataDto } from '../model/Metadata';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {


  public metadata: MetadataDto | undefined;

  constructor(private readonly metadataService: MetadataService) {
  }


  //noinspection JSUnusedGlobalSymbols
  ngOnInit() {
    this.metadataService
      .fetchMetadata()
      .subscribe(metadata => this.metadata = metadata);
  }


}
