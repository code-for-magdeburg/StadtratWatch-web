import { Component, OnInit } from '@angular/core';
import { MetadataDto } from './model/Metadata';
import { MetadataService } from './services/metadata.service';
import { Meta } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {


  public navbarCollapsed = true;
  public metadata: MetadataDto | undefined;


  constructor(private readonly metadataService: MetadataService, private readonly meta: Meta) {
  }


  async ngOnInit() {

    const metadata = await this.metadataService.fetchMetadata();
    const sessionsPeriodFrom = new DatePipe('de-DE').transform(metadata.sessionsPeriodFrom);
    const sessionsPeriodUntil = new DatePipe('de-DE').transform(metadata.sessionsPeriodUntil);
    const content = `Daten und Analysen von Abstimmungen und von Redebeiträgen in den Stadtratssitzungen der Landeshauptstadt Magdeburg im Zeitraum ${sessionsPeriodFrom} - ${sessionsPeriodUntil}`;
    this.meta.addTag({ name: 'description', content })

    this.metadata = metadata;

  }


}
