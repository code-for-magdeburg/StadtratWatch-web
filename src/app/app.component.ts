import { Component } from '@angular/core';
import { MetadataDto } from './model/Metadata';
import { MetadataService } from './services/metadata.service';
import { Observable } from "rxjs";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {


  public navbarCollapsed = true;
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
