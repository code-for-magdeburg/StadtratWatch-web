
export type IndexSearchEnv = {
  typesenseServerUrl: string;
  typesenseCollectionName: string;
  typesenseApiKey: string;
};


export function tryGetIndexSearchEnv(): IndexSearchEnv {

  const typesenseServerUrl = Deno.env.get('TYPESENSE_SERVER_URL');
  if (!typesenseServerUrl) {
    console.error('Environment variable TYPESENSE_SERVER_URL must be set.');
    Deno.exit(1);
  }

  const typesenseCollectionName = Deno.env.get('TYPESENSE_COLLECTION_NAME');
  if (!typesenseCollectionName) {
    console.error('Environment variable TYPESENSE_COLLECTION_NAME must be set.');
    Deno.exit(1);
  }

  const typesenseApiKey = Deno.env.get('TYPESENSE_API_KEY');
  if (!typesenseApiKey) {
    console.error('Environment variable TYPESENSE_API_KEY must be set.');
    Deno.exit(1);
  }

  return { typesenseServerUrl, typesenseCollectionName, typesenseApiKey };

}
