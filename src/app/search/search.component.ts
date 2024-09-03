import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaperDocumentSchema, SearchService } from '../services/search.service';
import { SearchResponseHit } from 'typesense/lib/Typesense/Documents';


type SearchResultItem = {
  id: string;
  title: string;
  reference: string;
  type: string;
  content: string;
};


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {


  public searchQuery = '';
  public searchResultItems: SearchResultItem[] = [];
  public page = 0;


  constructor(private readonly route: ActivatedRoute, private readonly searchService: SearchService,
              private readonly router: Router) {
  }


  ngOnInit() {

    this.route.queryParams.subscribe(async params => {

      const { q, page } = params;
      if (q) {
        this.searchQuery = q;
        this.page = parseInt(page, 10) || 1;
        const searchResult = await this.searchService.searchPapers(q, page);
        this.searchResultItems = ((searchResult?.hits as SearchResponseHit<PaperDocumentSchema>[]) || [])
          .map(hit => {
            const reference = hit.document.reference;
            const contentHighlight = hit.highlights?.find(highlight => highlight.field === 'files_content');
            const contentSnippets = contentHighlight?.snippets || [];
            const content = contentSnippets.length > 0 ? contentSnippets[0] : '';
            return {
              id: hit.document.id,
              title: hit.document.name,
              reference,
              type: hit.document.type,
              content
            };
          });
      }

    });

  }


  async search() {

    if (this.searchQuery) {

      await this.router.navigate(
        [],
        {
          relativeTo: this.route,
          queryParams: { q: this.searchQuery }
        });

    }

  }


}
