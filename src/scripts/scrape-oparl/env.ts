
export type ScrapeOparlEnv = {
  bodyUrl: string;
  fetchDelayMs: string;
};


export function tryGetScrapeOparlEnv(): ScrapeOparlEnv {

  const bodyUrl = Deno.env.get('SCRAPE_OPARL_BODY_URL');
  if (!bodyUrl) {
    console.error('Environment variable SCRAPE_OPARL_BODY_URL must be set.');
    Deno.exit(1);
  }

  const fetchDelayMs = Deno.env.get('SCRAPE_OPARL_FETCH_DELAY_MS');
  if (!fetchDelayMs) {
    console.error('Environment variable SCRAPE_OPARL_FETCH_DELAY_MS must be set.');
    Deno.exit(1);
  }

  return { bodyUrl, fetchDelayMs };

}
