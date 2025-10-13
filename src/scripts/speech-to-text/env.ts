export type SpeechToTextEnv = {
  openaiOrganizationId: string;
  openaiProjectId: string;
  openaiApiKey: string;
};

export function tryGetSpeechToTextEnv(): SpeechToTextEnv {
  const openaiOrganizationId = Deno.env.get('OPENAI_ORGANIZATION_ID');
  if (!openaiOrganizationId) {
    console.error('Environment variable OPENAI_ORGANIZATION_ID must be set.');
    Deno.exit(1);
  }

  const openaiProjectId = Deno.env.get('OPENAI_PROJECT_ID');
  if (!openaiProjectId) {
    console.error('Environment variable OPENAI_PROJECT_ID must be set.');
    Deno.exit(1);
  }

  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    console.error('Environment variable OPENAI_API_KEY must be set.');
    Deno.exit(1);
  }

  return { openaiOrganizationId, openaiProjectId, openaiApiKey };
}
