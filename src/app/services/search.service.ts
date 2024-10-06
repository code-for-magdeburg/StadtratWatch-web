import { Injectable } from '@angular/core';
import { SearchClient } from 'typesense';
import { environment } from '../../environments/environment';
import { DocumentSchema } from 'typesense/lib/Typesense/Documents';
import { MultiSearchRequestsSchema } from 'typesense/lib/Typesense/MultiSearch';


export interface PaperDocumentSchema extends DocumentSchema {
  id: string;
  reference: string;
  name: string;
  type: string;
  files_content: string[];
  sort_date: number;
}

export interface SpeechDocumentSchema extends DocumentSchema {
  id: string;
  electoral_period: string;
  session: string;
  session_date: number;
  start: number;
  speaker: string;
  faction?: string;
  party?: string;
  on_behalf_of?: string;
  transcription: string;
}


@Injectable({ providedIn: 'root' })
export class SearchService {


  private searchClient: SearchClient;


  constructor() {
    this.searchClient = new SearchClient({
      apiKey: environment.typesense.apiKey,
      nodes: [
        {
          host: environment.typesense.host,
          port: environment.typesense.port,
          protocol: environment.typesense.protocol
        }
      ]
    });
  }


  public async searchPapersAndSpeeches(query: string, page: number) {

    if (!query) {
      return null;
    }

    const searchRequests: MultiSearchRequestsSchema = {
      searches: [
        {
          q: query,
          collection: 'papers',
          query_by: 'reference,name,files_content'
        },
        {
          q: query,
          collection: 'speeches',
          query_by: 'transcription'
        }
      ]
    };

    return await this.searchClient.multiSearch
      .perform<[PaperDocumentSchema, SpeechDocumentSchema]>(
        searchRequests,
        {
          page,
          highlight_affix_num_tokens: 15
        }
      );

  }


}
