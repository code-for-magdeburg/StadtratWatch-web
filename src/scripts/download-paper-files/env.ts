export type DownloadPaperFilesEnv = {
  councilOrganizationId: string;
};

export function tryGetDownloadPaperFilesEnv(): DownloadPaperFilesEnv {
  const councilOrganizationId = Deno.env.get('OPARL_COUNCIL_ORGANIZATION_ID');
  if (!councilOrganizationId) {
    console.error('Environment variable OPARL_COUNCIL_ORGANIZATION_ID must be set.');
    Deno.exit(1);
  }

  return { councilOrganizationId };
}
