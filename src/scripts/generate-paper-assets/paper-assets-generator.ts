import { PaperAssetDto, PaperAssetFileDto } from './model.ts';
import { IPaperFilesStore } from './paper-files-store.ts';
import { OparlMeetingsRepository } from '../shared/oparl/oparl-meetings-repository.ts';
import { OparlPapersRepository } from '../shared/oparl/oparl-papers-repository.ts';
import { OparlFilesRepository } from '../shared/oparl/oparl-files-repository.ts';

export class PaperAssetsGenerator {
  constructor(
    private readonly meetingsRepository: OparlMeetingsRepository,
    private readonly papersRepository: OparlPapersRepository,
    private readonly filesRepository: OparlFilesRepository,
    private readonly paperFilesStore: IPaperFilesStore,
  ) {
  }

  public generatePaperAssets(): PaperAssetDto[] {
    return this.papersRepository
      .getAllPapers()
      .map<PaperAssetDto>((paper) => {
        const files = this.filesRepository
          .getFilesByPaper(paper.id)
          .toSorted((a, b) => a.id.localeCompare(b.id))
          .map<PaperAssetFileDto>((file) => {
            const fileId = +file.id.split('/').pop()!;
            return {
              id: fileId,
              name: file.name,
              url: `https://ratsinfo.magdeburg.de/getfile.asp?id=${fileId}&type=do`,
              size: this.paperFilesStore.getFileSize(fileId),
            };
          });
        return {
          id: +paper.id.split('/').pop()!,
          reference: paper.reference || null,
          type: paper.paperType || null,
          title: paper.name,
          files,
        };
      });
  }
}
