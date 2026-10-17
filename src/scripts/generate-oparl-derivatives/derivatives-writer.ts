import * as path from 'node:path';
import type { PaperIndex, VotingPaperMap } from '@srw-astro/models/oparl-derivatives';

export interface DerivativesWriter {
  writeVotingPaperMap(periodId: string, votingPaperMap: VotingPaperMap): Promise<void>;
  writePaperIndex(paperIndex: PaperIndex): Promise<void>;
}

export class DerivativesFileWriter implements DerivativesWriter {
  constructor(private readonly dataDir: string) {
  }

  public async writeVotingPaperMap(periodId: string, votingPaperMap: VotingPaperMap): Promise<void> {
    await writeJsonFile(path.join(this.dataDir, periodId, 'voting-paper-map.json'), votingPaperMap);
  }

  public async writePaperIndex(paperIndex: PaperIndex): Promise<void> {
    await writeJsonFile(path.join(this.dataDir, 'paper-index.json'), paperIndex);
  }
}

async function writeJsonFile(filename: string, data: unknown): Promise<void> {
  // Trailing newline keeps the committed derivate diffs clean.
  await Bun.write(filename, `${JSON.stringify(data, null, 2)}\n`);
}
