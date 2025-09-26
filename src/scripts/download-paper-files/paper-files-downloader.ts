import * as fs from '@std/fs';
import * as path from '@std/path';


export interface IPaperFilesDownloader {
  downloadFile(fileId: number): Promise<void>;
}


export class PaperFilesDownloader implements IPaperFilesDownloader {


  constructor(private readonly directory: string) {}


  async downloadFile(fileId: number): Promise<void> {

    const filePath = this.getFilePath(fileId);
    if (fs.existsSync(filePath)) {
      console.log('File already exists. Skipping: ', fileId);
      return;
    }

    const downloadUrl = PaperFilesDownloader.getDownloadUrl(fileId);
    const fileResponse = await fetch(downloadUrl);
    if (fileResponse.body) {
      const file = await Deno.open(filePath, { write: true, create: true });
      await fileResponse.body.pipeTo(file.writable);
      console.log('Download finished: ', fileId);
    }

  }


  private getFilePath(oparlFileId: string): string {
    const fileId = PaperFilesDownloader.extractIdFromOparlId(oparlFileId);
    const filename = `${fileId}.pdf`;
    return path.join(this.directory, filename);
  }


  private static getDownloadUrl(oparlFileId: string): string {
    const fileId = PaperFilesDownloader.extractIdFromOparlId(oparlFileId);
    return `https://ratsinfo.magdeburg.de/getfile.asp?id=${fileId}&type=do`;
  }


  private static extractIdFromOparlId(oparlId: string): number {
    return oparlId.split('/').pop();
  }


}
