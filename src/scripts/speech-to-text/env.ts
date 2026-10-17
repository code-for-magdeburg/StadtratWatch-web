export type SpeechToTextEnv = {
  openaiOrganizationId: string;
  openaiProjectId: string;
  openaiApiKey: string;
};

export function tryGetSpeechToTextEnv(): SpeechToTextEnv {
  const openaiOrganizationId = Bun.env.OPENAI_ORGANIZATION_ID;
  if (!openaiOrganizationId) {
    console.error('Environment variable OPENAI_ORGANIZATION_ID must be set.');
    process.exit(1);
  }

  const openaiProjectId = Bun.env.OPENAI_PROJECT_ID;
  if (!openaiProjectId) {
    console.error('Environment variable OPENAI_PROJECT_ID must be set.');
    process.exit(1);
  }

  const openaiApiKey = Bun.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    console.error('Environment variable OPENAI_API_KEY must be set.');
    process.exit(1);
  }

  return { openaiOrganizationId, openaiProjectId, openaiApiKey };
}
