import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PapersService } from '../services/papers.service';


@Component({
  selector: 'app-paper',
  templateUrl: './paper.component.html',
  styleUrl: './paper.component.scss'
})
export class PaperComponent implements OnInit {


  public documentUrl: SafeResourceUrl | null = null;


  constructor(private readonly route: ActivatedRoute, private readonly papersService: PapersService,
              private readonly domSanitizer: DomSanitizer) {
  }


  async ngOnInit() {

    this.route.queryParams.subscribe(async params => {

      const paperIdParam = params['paperId'];
      const paperId = paperIdParam ? parseInt(paperIdParam, 10) : null;
      if (paperId) {

        const paper = await this.papersService.getPaper(paperId);
        if (paper && paper.files.length > 0) {
          this.documentUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(paper.files[0].url);
        } else {
          this.documentUrl = null;
        }

      } else {
        // TODO: handle missing paperId
        this.documentUrl = null;
      }

    });

  }


}
