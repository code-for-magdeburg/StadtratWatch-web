import * as path from 'node:path';

export interface IPaperFilesDownloader {
  downloadFile(fileId: string): void;
}

export class PaperFilesDownloader implements IPaperFilesDownloader {
  constructor(private readonly directory: string) {}

  async downloadFile(oparlFileId: string): Promise<void> {
    const fileId = PaperFilesDownloader.extractIdFromOparlId(oparlFileId);
    if (!fileId) {
      console.error('Could not extract file ID from OParl ID: ', oparlFileId);
      return;
    }

    const filePath = this.getFilePath(fileId);
    if (await Bun.file(filePath).exists()) {
      return;
    }

    const downloadUrl = PaperFilesDownloader.getDownloadUrl(fileId);
    const fileResponse = await fetch(downloadUrl);
    if (fileResponse.body) {
      await Bun.write(filePath, fileResponse);
      console.log('Download finished: ', oparlFileId);
    }
  }

  private getFilePath(fileId: string): string {
    const filename = `${fileId}.pdf`;
    return path.join(this.directory, filename);
  }

  private static getDownloadUrl(fileId: string): string {
    return `https://ratsinfo.magdeburg.de/getfile.asp?id=${fileId}&type=do`;
  }

  private static extractIdFromOparlId(oparlId: string): string | undefined {
    return oparlId.split('/').pop();
  }
}
