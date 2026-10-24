import * as path from 'node:path';

export interface IScraperMetadataStore {
  getLastSuccessfulRunDate(): Promise<string | null>;
  setLastSuccessfulRunDate(date: string): Promise<void>;
}

export class ScraperMetadataFileStore implements IScraperMetadataStore {
  constructor(private readonly directory: string) {}

  public async getLastSuccessfulRunDate(): Promise<string | null> {
    const metadataFile = Bun.file(this.getMetadataFilePath());
    if (!(await metadataFile.exists())) {
      return null;
    }

    return (await metadataFile.text()).trim();
  }

  public async setLastSuccessfulRunDate(date: string): Promise<void> {
    await Bun.write(this.getMetadataFilePath(), date);
  }

  private getMetadataFilePath(): string {
    return path.join(this.directory, 'scraper-metadata.txt');
  }
}
