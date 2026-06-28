import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncOparlSnapshot } from './fetch-oparl.lib.mjs';

const baseUrl = process.env.AWS_CLOUDFRONT_BASE_URL;
if (!baseUrl) {
  console.error('Environment variable AWS_CLOUDFRONT_BASE_URL must be set.');
  process.exit(1);
}

const prefix = process.env.OPARL_S3_PREFIX ?? 'oparl';
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
// Default to the repo's data dir (../../../data/oparl-magdeburg from astro/scripts/fetch-oparl);
// overridable for verification runs against a throwaway directory.
const dir =
  process.env.OPARL_DATA_DIR ??
  path.resolve(scriptDir, '../../../data/oparl-magdeburg');

try {
  await syncOparlSnapshot({ baseUrl, dir, prefix });
} catch (error) {
  console.error(
    `fetch-oparl failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
}
