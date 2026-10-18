export type IndexSearchEnv = {
  typesenseServerUrl: string;
  typesenseCollectionName: string;
  typesenseApiKey: string;
  councilOrganizationId: string;
};

export function tryGetIndexSearchEnv(): IndexSearchEnv {
  const typesenseServerUrl = Bun.env.TYPESENSE_SERVER_URL;
  if (!typesenseServerUrl) {
    console.error('Environment variable TYPESENSE_SERVER_URL must be set.');
    process.exit(1);
  }

  const typesenseCollectionName = Bun.env.TYPESENSE_COLLECTION_NAME;
  if (!typesenseCollectionName) {
    console.error('Environment variable TYPESENSE_COLLECTION_NAME must be set.');
    process.exit(1);
  }

  const typesenseApiKey = Bun.env.TYPESENSE_API_KEY;
  if (!typesenseApiKey) {
    console.error('Environment variable TYPESENSE_API_KEY must be set.');
    process.exit(1);
  }

  const councilOrganizationId = Bun.env.OPARL_COUNCIL_ORGANIZATION_ID;
  if (!councilOrganizationId) {
    console.error('Environment variable OPARL_COUNCIL_ORGANIZATION_ID must be set.');
    process.exit(1);
  }

  return { typesenseServerUrl, typesenseCollectionName, typesenseApiKey, councilOrganizationId };
}
