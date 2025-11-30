import { FEATURE_FLAGS } from 'astro:env/client';

export type FeatureFlag =
  // No flags defined yet - remove this line when adding real flags
  //string;
  'paper-details-with-related-papers';
// | 'feature-name-2'

function parseEnabledFeatures(featuresString: string | undefined): Set<string> {
  if (!featuresString || featuresString.trim() === '') {
    return new Set();
  }

  return new Set(
    featuresString
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0),
  );
}

export function isFeatureEnabled(feature: FeatureFlag): boolean {
  console.log('FEATURE_FLAGS', FEATURE_FLAGS);
  const features = parseEnabledFeatures(FEATURE_FLAGS);
  return features.has(feature);
}
