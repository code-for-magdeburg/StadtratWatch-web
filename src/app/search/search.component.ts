import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaperAndSpeechDocumentSchema, SearchService } from '../services/search.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { PaperSearchResultItem } from './paper-search-result-card/paper-search-result-card.component';
import { SpeechSearchResultItem } from './speech-search-result-card/speech-search-result-card.component';


type SearchResultItem = {
  type: 'paper' | 'speech';
  paper: PaperSearchResultItem | null;
  speech: SpeechSearchResultItem | null;
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

        this.searchExecuted = true;

        if (!searchResultPapersAndSpeeches) {
          this.totalResultItems = 0;
          this.searchResultItems = [];
          return;
        }

        this.totalResultItems = searchResultPapersAndSpeeches.found;
        this.searchResultItems = (searchResultPapersAndSpeeches.hits || [])
          .map(item => {

            const document = item.document as PaperAndSpeechDocumentSchema;

            const contentHighlight = item.highlights?.find(highlight => highlight.field === 'content');
            const contentSnippets = contentHighlight?.snippets || [];
            const content = contentSnippets.length > 0 ? contentSnippets[0] : '';

            if (document.type === 'paper') {

              return {
                type: 'paper',
                paper: {
                  id: document.id.substring(6), // remove 'paper-' prefix
                  title: document.paper_name,
                  reference: document.paper_reference,
                  type: document.paper_type,
                  content
                },
                speech: null
              } satisfies SearchResultItem;

            }

            if (document.type === 'speech') {

              return {
                type: 'speech',
                paper: null,
                speech: {
                  id: document.id,
                  electoralPeriod: document.speech_electoral_period,
                  session: document.speech_session,
                  sessionDate: document.speech_session_date,
                  start: document.speech_start,
                  speaker: document.speech_speaker,
                  faction: document.speech_faction,
                  onBehalfOf: document.speech_on_behalf_of,
                  content
                }
              } satisfies SearchResultItem;

            }

            return null!;

          })
          .filter(item => item !== null);

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
