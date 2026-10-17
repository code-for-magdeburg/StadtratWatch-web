export type GenerateOparlDerivativesEnv = {
  councilOrganizationId: string;
};

export function getGenerateOparlDerivativesEnvOrExit(): GenerateOparlDerivativesEnv {
  const councilOrganizationId = Bun.env.OPARL_COUNCIL_ORGANIZATION_ID;
  if (!councilOrganizationId) {
    console.error('Environment variable OPARL_COUNCIL_ORGANIZATION_ID must be set.');
    process.exit(1);
  }

  return { councilOrganizationId };
}
