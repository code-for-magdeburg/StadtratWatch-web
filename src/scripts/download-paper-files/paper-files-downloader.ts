import * as fs from '@std/fs';
import * as path from '@std/path';


export interface IPaperFilesDownloader {
  downloadFile(url: string, id: number): Promise<void>;
}


export class PaperFilesDownloader implements IPaperFilesDownloader {


  constructor(private readonly directory: string) {}


  async downloadFile(url: string, id: number): Promise<void> {

    const filename = `${id}.pdf`;
    const filePath = path.join(this.directory, filename);

    if (fs.existsSync(filePath)) {
      console.log('File already exists. Skipping: ', filename);
      return;
    }

    const fileResponse = await fetch(url);
    if (fileResponse.body) {
      const file = await Deno.open(filePath, { write: true, create: true });
      await fileResponse.body.pipeTo(file.writable);
      console.log('Download finished: ', filename);
    }

  }


}
