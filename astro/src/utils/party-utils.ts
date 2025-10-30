import type { RegistryParty } from '@models/registry.ts';

export function extractExtremistClassificationInformation(
  party: RegistryParty,
) {
  const additionalInformation = party.additionalInformation || [];
  const extremistClassification =
    additionalInformation.find((i) => i.key === 'EXTREMIST_CLASSIFICATION')
      ?.value || '';
  const extremistClassificationReason =
    additionalInformation.find(
      (i) => i.key === 'EXTREMIST_CLASSIFICATION_REASON',
    )?.value || '';
  const extremistClassificationSource =
    additionalInformation.find(
      (i) => i.key === 'EXTREMIST_CLASSIFICATION_SOURCE',
    )?.value || '';
  const extremistClassificationSourceUrl =
    additionalInformation.find(
      (i) => i.key === 'EXTREMIST_CLASSIFICATION_SOURCE_URL',
    )?.value || '';

  return {
    extremistClassification,
    extremistClassificationReason,
    extremistClassificationSource,
    extremistClassificationSourceUrl,
  };
}
