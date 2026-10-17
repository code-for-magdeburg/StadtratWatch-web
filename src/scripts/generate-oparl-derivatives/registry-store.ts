import * as path from 'node:path';
import { readdir } from 'node:fs/promises';
import type { Registry } from '@srw-astro/models/registry';

export interface RegistryStore {
  loadRegistries(): Promise<Registry[]>;
}

export class RegistryFileStore implements RegistryStore {
  constructor(private readonly dataDir: string) {
  }

  public async loadRegistries(): Promise<Registry[]> {
    const registries: Registry[] = [];

    for (const entry of await readdir(this.dataDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const registryFile = Bun.file(path.join(this.dataDir, entry.name, 'registry.json'));
      if (!(await registryFile.exists())) {
        continue;
      }

      registries.push(await registryFile.json() as Registry);
    }

    // Sorted by the canonical registry id for a deterministic processing order across runs.
    return registries.toSorted((a, b) => a.id.localeCompare(b.id));
  }
}
