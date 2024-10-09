import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaperDocumentSchema, SearchService, SpeechDocumentSchema } from '../services/search.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { PaperSearchResultItem } from './paper-search-result-card/paper-search-result-card.component';
import { SpeechSearchResultItem } from './speech-search-result-card/speech-search-result-card.component';


type SearchResultItem = {
  type: 'paper' | 'speech';
  paper: PaperSearchResultItem | null;
  speech: SpeechSearchResultItem | null;
};


type MergedSearchResultItem = {
  type: 'paper' | 'speech';
  text_match: number;
  document: PaperDocumentSchema | SpeechDocumentSchema;
  highlights?: {
    field: keyof (PaperDocumentSchema | SpeechDocumentSchema);
    snippets?: string[];
    snippet?: string;
  }[];
};


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {


  public searchExecuted = false;
  public searchQuery = '';
  public searchResultItems: SearchResultItem[] = [];
  public page = 1;
  public totalResultItems = 0;


  constructor(private readonly route: ActivatedRoute, private readonly searchService: SearchService,
              private readonly router: Router) {
  }


  ngOnInit() {

    this.route.queryParams.subscribe(async params => {

      this.searchExecuted = false;

      const { q, page } = params;
      if (q) {

        this.searchQuery = q;
        this.page = parseInt(page, 10) || 1;

        const searchResultPapersAndSpeeches = await this.searchService.searchPapersAndSpeeches(q, page);
        if (!searchResultPapersAndSpeeches) {
          this.totalResultItems = 0;
          this.searchResultItems = [];
          this.searchExecuted = true;
          return;
        }

        const [papersSearchResult, speechesSearchResult] = searchResultPapersAndSpeeches.results;
        const mergedSearchResultItems = (papersSearchResult.hits || [])
          .map<MergedSearchResultItem>(hit => ({
            type: 'paper',
            text_match: hit.text_match,
            document: hit.document,
            highlights: hit.highlights
          }))
          .concat((speechesSearchResult.hits || []).map<MergedSearchResultItem>(hit => ({
            type: 'speech',
            text_match: hit.text_match,
            document: hit.document,
            highlights: hit.highlights
          })))
          .sort((a, b) => (a.text_match || 0) - (b.text_match || 0));

        this.searchResultItems = mergedSearchResultItems
          .map(item => {

            if (item.type === 'paper') {

              const contentHighlight = item.highlights?.find(highlight => highlight.field === 'files_content');
              const contentSnippets = contentHighlight?.snippets || [];
              const content = contentSnippets.length > 0 ? contentSnippets[0] : '';
              const document = item.document as PaperDocumentSchema;
              return {
                type: 'paper',
                paper: {
                  id: document.id,
                  title: document.name,
                  reference: document.reference,
                  type: document.type,
                  content
                },
                speech: null
              } satisfies SearchResultItem;

            }

            if (item.type === 'speech') {

              const contentHighlight = item.highlights?.find(highlight => highlight.field === 'transcription');
              const content = contentHighlight?.snippet || '';
              const document = item.document as SpeechDocumentSchema;
              return {
                type: 'speech',
                paper: null,
                speech: {
                  id: document.id,
                  electoralPeriod: document.electoral_period,
                  session: document.session,
                  sessionDate: document.session_date,
                  start: document.start,
                  speaker: document.speaker,
                  faction: document.faction,
                  onBehalfOf: document.on_behalf_of,
                  content
                }
              } satisfies SearchResultItem;

            }

            return null!;

          })
          .filter(item => item !== null);

        this.totalResultItems = Math.max(papersSearchResult.found || 0, speechesSearchResult.found || 0);
        this.searchExecuted = true;

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
        }
      );

    }

  }


  async pageChanged(pageEvent: PageChangedEvent) {
    await this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: { q: this.searchQuery, page: pageEvent.page },
      }
    );
  }


}
