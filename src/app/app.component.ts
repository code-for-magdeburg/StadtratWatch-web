import { Component, OnInit } from '@angular/core';
import { MetadataDto } from './model/Metadata';
import { MetadataService } from './services/metadata.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {


  public navbarCollapsed = true;
  public metadata: MetadataDto | undefined;


  constructor(private readonly metadataService: MetadataService) {
  }


  async ngOnInit() {
    this.metadata = await this.metadataService.fetchMetadata(7);
  }


}
