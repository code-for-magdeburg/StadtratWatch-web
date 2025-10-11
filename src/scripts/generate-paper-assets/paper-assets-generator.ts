import { PaperAssetDto, PaperAssetFileDto } from './model.ts';
import { IOparlObjectsStore } from '../shared/oparl/oparl-objects-store.ts';
import { IPaperFilesStore } from './paper-files-store.ts';


export class PaperAssetsGenerator {


  constructor(private readonly oparlObjectsStore: IOparlObjectsStore,
              private readonly paperFilesStore: IPaperFilesStore) {
  }


  public generatePaperAssets(): PaperAssetDto[] {

    const papers: PaperAssetDto[] = [];

    this.oparlObjectsStore
      .getMeetings()
      .forEach(meeting => {

        if (!meeting.start)
          return;

        console.log(`Collecting papers for meeting ${meeting.id} (${meeting.start})`);

        const year = meeting.start.split('-')[0];
        const meetingPapers = this.oparlObjectsStore
          .getPapers(meeting.id)
          .filter(paper => papers.every(p => p.id !== +paper.id.split('/').pop()!));
        const meetingFiles = this.oparlObjectsStore.getFiles(meeting.id);

        papers.push(...meetingPapers.map<PaperAssetDto>(paper=> {
          const files = meetingFiles
            .filter(file => file.paper && file.paper.includes(paper.id))
            .map<PaperAssetFileDto>(file => {
              const fileId = +file.id.split('/').pop()!;
              return {
                id: fileId,
                name: file.name,
                url: `https://ratsinfo.magdeburg.de/getfile.asp?id=${fileId}&type=do`,
                size: this.paperFilesStore.getFileSize(year, fileId),
              };
            });
          return {
            id: +paper.id.split('/').pop()!,
            reference: paper.reference || null,
            type: paper.paperType || null,
            title: paper.name,
            files
          };
        }));

      });

    return papers;

  }


}
