import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PapersService } from '../services/papers.service';
import { PaperDto } from '../../interfaces/Paper';
import { formatFileSize } from '../utilities/ui';


@Component({
  selector: 'app-paper',
  templateUrl: './paper.component.html',
  styleUrl: './paper.component.scss'
})
export class PaperComponent implements OnInit {


  protected readonly formatFileSize = formatFileSize;


  public paper: PaperDto | null = null;
  public documentUrl: SafeResourceUrl | null = null;
  public fileSizeOk = true;
  public fileSizeDisplay = '';
  public selectedFileId = 0;


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
          this.selectFile(this.paper.files[0].id);
        } else {
          this.selectFile(null);
        }

      } else {
        // TODO: handle missing paperId
        this.paper = null;
        this.selectFile(null);
      }

    });

  }

  selectFile(fileId: number | null) {

    if (!fileId) {

      this.documentUrl = null;
      this.fileSizeOk = true;
      this.fileSizeDisplay = '';
      this.selectedFileId = 0;

    } else {

      const file = this.paper?.files.find(f => f.id === fileId);
      if (file) {
        this.documentUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(file.url);
        this.fileSizeOk = (file.size || 0) <= 1024 * 1024;
        this.fileSizeDisplay = formatFileSize(file.size || 0);
        this.selectedFileId = fileId;
      }

    }

  }


}
