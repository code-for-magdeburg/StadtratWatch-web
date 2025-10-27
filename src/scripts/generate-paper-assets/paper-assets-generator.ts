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
    private readonly organizationId: string,
  ) {
  }

  public generatePaperAssets(): PaperAssetDto[] {
    const papers: PaperAssetDto[] = [];

    this.meetingsRepository
      .getMeetingsByOrganization(this.organizationId)
      .forEach((meeting) => {
        if (!meeting.start) {
          return;
        }

        console.log(`Collecting papers for meeting ${meeting.id} (${meeting.start})`);

        const year = meeting.start.split('-')[0];
        const meetingPapers = this.papersRepository
          .getPapersByMeeting(meeting.id)
          .filter((paper) => papers.every((p) => p.id !== +paper.id.split('/').pop()!));
        const meetingFiles = this.filesRepository.getFilesByMeeting(meeting.id);

        papers.push(...meetingPapers.map<PaperAssetDto>((paper) => {
          const files = meetingFiles
            .filter((file) => file.paper && file.paper.includes(paper.id))
            .toSorted((a, b) => a.id.localeCompare(b.id))
            .map<PaperAssetFileDto>((file) => {
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
            files,
          };
        }));
      });

    return papers;
  }
}
