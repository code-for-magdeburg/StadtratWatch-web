import { Injectable } from '@angular/core';
import { SearchClient } from 'typesense';
import { environment } from '../../environments/environment';
import { DocumentSchema } from "typesense/lib/Typesense/Documents";


export interface PaperDocumentSchema extends DocumentSchema {
  id: string;
  reference: string;
  name: string;
  type: string;
  files_content: string[];
  sort_date: number;
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


  public async searchPapers(query: string, page: number) {

    if (!query) {
      return null;
    }

    return await this.searchClient
      .collections<PaperDocumentSchema>('papers')
      .documents()
      .search(
        {
          q: query,
          query_by: 'reference,name,files_content',
          page
        },
        {}
      );

  }


}
