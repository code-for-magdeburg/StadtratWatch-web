import type { RegistryParty } from '@models/registry.ts';

export function extractExtremistClassificationInformation(party: RegistryParty) {
  const additionalInformation = party.additionalInformation || [];
  const extremistClassification = additionalInformation.find(i => i.key === 'EXTREMIST_CLASSIFICATION')?.value || null;
  const extremistClassificationReason = additionalInformation.find(i => i.key === 'EXTREMIST_CLASSIFICATION_REASON')?.value || null;
  const extremistClassificationSource = additionalInformation.find(i => i.key === 'EXTREMIST_CLASSIFICATION_SOURCE')?.value || null;
  const extremistClassificationSourceUrl = additionalInformation.find(i => i.key === 'EXTREMIST_CLASSIFICATION_SOURCE_URL')?.value || null;

  return {
    extremistClassification,
    extremistClassificationReason,
    extremistClassificationSource,
    extremistClassificationSourceUrl
  };
}
