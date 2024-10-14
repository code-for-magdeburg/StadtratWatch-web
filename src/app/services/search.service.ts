import { Injectable } from '@angular/core';
import { SearchClient } from 'typesense';
import { environment } from '../../environments/environment';
import { DocumentSchema } from 'typesense/lib/Typesense/Documents';


export interface PaperAndSpeechDocumentSchema extends DocumentSchema {
  id: string;
  type: string;
  content: string[];

  paper_name: string;
  paper_type: string;
  paper_reference: string;

  speech_electoral_period: string;
  speech_session: string;
  speech_start: number;
  speech_session_date: number;
  speech_speaker: string;
  speech_faction?: string;
  speech_party?: string;
  speech_on_behalf_of?: string;
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

    return await this.searchClient
      .collections<PaperAndSpeechDocumentSchema>('papers-and-speeches')
      .documents()
      .search(
        {
          q: query,
          query_by: 'paper_reference,paper_name,content',
          page,
          highlight_affix_num_tokens: 15
        },
        {}
      );

  }


}
