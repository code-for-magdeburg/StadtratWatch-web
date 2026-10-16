export type DetectAiTextEnv = {
  pangramApiKey: string;
};

export function tryGetDetectAiTextEnv(): DetectAiTextEnv {
  const pangramApiKey = Bun.env.PANGRAM_API_KEY;
  if (!pangramApiKey) {
    console.error('Environment variable PANGRAM_API_KEY must be set.');
    process.exit(1);
  }

  return { pangramApiKey };
}
