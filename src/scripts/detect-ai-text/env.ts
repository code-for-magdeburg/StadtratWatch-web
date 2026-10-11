export type DetectAiTextEnv = {
  pangramApiKey: string;
};

export function tryGetDetectAiTextEnv(): DetectAiTextEnv {
  const pangramApiKey = Deno.env.get('PANGRAM_API_KEY');
  if (!pangramApiKey) {
    console.error('Environment variable PANGRAM_API_KEY must be set.');
    Deno.exit(1);
  }

  return { pangramApiKey };
}
