import type {
  DocumentSchema,
  SearchParams,
} from 'typesense/lib/Typesense/Documents';
import type { ConfigurationOptions } from 'typesense/lib/Typesense/Configuration';
import * as Typesense from 'typesense';
import {
  TYPESENSE_HOST,
  TYPESENSE_PORT,
  TYPESENSE_PROTOCOL,
  TYPESENSE_SEARCH_ONLY_API_KEY,
} from 'astro:env/client';

interface PaperAndSpeechDocumentSchema extends DocumentSchema {
  id: string;
  type: string;
  content: string[];

  paper_name: string;
  paper_type: string;
  paper_reference: string;

  speech_parliament_period: string;
  speech_session: string;
  speech_start: number;
  speech_session_date: number;
  speech_speaker: string;
  speech_faction?: string;
  speech_party?: string;
  speech_on_behalf_of?: string;
}

type PaperSearchResultItem = {
  id: string;
  title: string;
  reference: string;
  type: string;
  content: string;
};

type SpeechSearchResultItem = {
  id: string;
  parliamentPeriod: string;
  session: string;
  sessionDate: number;
  start: number;
  speaker: string;
  faction?: string;
  onBehalfOf?: string;
  content: string;
};

type SearchResultItem = {
  type: 'paper' | 'speech';
  paper: PaperSearchResultItem | null;
  speech: SpeechSearchResultItem | null;
};

export type SearchResult = {
  totalResultItems: number;
  searchResultItems: SearchResultItem[];
};

export async function search(q: string, page: number): Promise<SearchResult> {
  const searchParameters: SearchParams = {
    q,
    query_by: 'paper_reference,paper_name,content',
    page,
    highlight_affix_num_tokens: 15,
  };

  const options: ConfigurationOptions = {
    nodes: [
      {
        host: TYPESENSE_HOST,
        port: TYPESENSE_PORT,
        protocol: TYPESENSE_PROTOCOL,
      },
    ],
    apiKey: TYPESENSE_SEARCH_ONLY_API_KEY,
  };
  const client = new Typesense.Client(options);
  const searchResultPapersAndSpeeches = await client
    .collections<PaperAndSpeechDocumentSchema>('papers-and-speeches')
    .documents()
    .search(searchParameters);

  const searchResultItems = (searchResultPapersAndSpeeches.hits || [])
    .map((item) => {
      const document = item.document as PaperAndSpeechDocumentSchema;

      const contentHighlight = item.highlights?.find(
        (highlight) => highlight.field === 'content',
      );
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
            content,
          },
          speech: null,
        } satisfies SearchResultItem;
      }

      if (document.type === 'speech') {
        return {
          type: 'speech',
          paper: null,
          speech: {
            id: document.id,
            parliamentPeriod: document.speech_parliament_period,
            session: document.speech_session,
            sessionDate: document.speech_session_date,
            start: document.speech_start,
            speaker: document.speech_speaker,
            faction: document.speech_faction,
            onBehalfOf: document.speech_on_behalf_of,
            content,
          },
        } satisfies SearchResultItem;
      }

      return null!;
    })
    .filter((item) => item !== null);

  return {
    totalResultItems: searchResultPapersAndSpeeches.found,
    searchResultItems,
  };
}
