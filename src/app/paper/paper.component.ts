import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PapersService } from '../services/papers.service';
import { PaperDto } from '../model/Paper';
import { formatFileSize } from '../utilities/ui';


@Component({
  selector: 'app-paper',
  templateUrl: './paper.component.html',
  styleUrl: './paper.component.scss'
})
export class PaperComponent implements OnInit {


  public paper: PaperDto | null = null;
  public documentUrl: SafeResourceUrl | null = null;
  public fileSize = 0;
  public fileSizeDisplay = '';


  constructor(private readonly route: ActivatedRoute, private readonly papersService: PapersService,
              private readonly domSanitizer: DomSanitizer) {
  }


  async ngOnInit() {

    this.route.queryParams.subscribe(async params => {

      const paperIdParam = params['paperId'];
      const paperId = paperIdParam ? parseInt(paperIdParam, 10) : null;
      if (paperId) {

        this.paper = await this.papersService.getPaper(paperId) || null;
        if (this.paper && this.paper.files.length > 0) {
          this.documentUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.paper.files[0].url);
          this.fileSize = this.paper.files[0].size || 0;
          this.fileSizeDisplay = formatFileSize(this.fileSize);
        } else {
          this.documentUrl = null;
          this.fileSize = 0;
          this.fileSizeDisplay = '';
        }

      } else {
        // TODO: handle missing paperId
        this.paper = null;
        this.documentUrl = null;
        this.fileSizeDisplay = '';
      }

    });

  }


}
