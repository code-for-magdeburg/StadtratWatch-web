import * as path from '@std/path';
import { existsSync } from '@std/fs/exists';

export interface IScraperMetadataStore {
  getLastSuccessfulRunDate(): string | null;
  setLastSuccessfulRunDate(date: string): void;
}

export class ScraperMetadataFileStore implements IScraperMetadataStore {
  constructor(private readonly directory: string) {
  }

  public getLastSuccessfulRunDate(): string | null {
    const metadataFilePath = this.getMetadataFilePath();
    if (!existsSync(metadataFilePath)) {
      return null;
    }

    return Deno.readTextFileSync(metadataFilePath);
  }

  public setLastSuccessfulRunDate(date: string): void {
    Deno.writeTextFileSync(this.getMetadataFilePath(), date);
  }

  private getMetadataFilePath(): string {
    return path.join(this.directory, 'scraper-metadata.txt');
  }
}
