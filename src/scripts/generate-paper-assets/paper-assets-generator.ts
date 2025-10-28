import { PaperAssetConsultationDto, PaperAssetDto, PaperAssetFileDto } from './model.ts';
import { IPaperFilesStore } from './paper-files-store.ts';
import { OparlMeetingsRepository } from '../shared/oparl/oparl-meetings-repository.ts';
import { OparlPapersRepository } from '../shared/oparl/oparl-papers-repository.ts';
import { OparlFilesRepository } from '../shared/oparl/oparl-files-repository.ts';
import { OparlOrganizationsRepository } from '../shared/oparl/oparl-organizations-repository.ts';
import { OparlAgendaItemsRepository } from '../shared/oparl/oparl-agenda-items-repository.ts';

export class PaperAssetsGenerator {
  constructor(
    private readonly meetingsRepository: OparlMeetingsRepository,
    private readonly papersRepository: OparlPapersRepository,
    private readonly organizationsRepository: OparlOrganizationsRepository,
    private readonly agendaItemsRepository: OparlAgendaItemsRepository,
    private readonly filesRepository: OparlFilesRepository,
    private readonly paperFilesStore: IPaperFilesStore,
  ) {
  }

  public generatePaperAssets(): PaperAssetDto[] {
    return this.papersRepository
      .getAllPapers()
      .map<PaperAssetDto>((paper) => {
        const consultations = (paper.consultation || [])
          .map<PaperAssetConsultationDto | null>((consultation) => {
            if (
              !consultation.meeting || !consultation.organization || consultation.organization.length === 0 ||
              !consultation.agendaItem
            ) {
              return null;
            }

            const meeting = this.meetingsRepository.getMeetingById(consultation.meeting);
            if (!meeting) {
              return null;
            }

            const organization = this.organizationsRepository.getOrganizationById(consultation.organization[0]);
            if (!organization) {
              return null;
            }

            const agendaItem = this.agendaItemsRepository.getAgendaItemById(consultation.agendaItem);
            if (!agendaItem) {
              return null;
            }

            return {
              meeting: meeting.name,
              date: meeting.start || null,
              role: consultation.role || null,
              organization: organization.name,
              agendaItem: agendaItem.number || null,
              result: agendaItem.result || null,
            };
          })
          .filter((consultation): consultation is PaperAssetConsultationDto => consultation !== null)
          .toSorted((a, b) => {
            if (!a.date && !b.date) return 0;
            if (!a.date) return 1;
            if (!b.date) return -1;
            return a.date.localeCompare(b.date);
          });
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
          consultations,
        };
      });
  }
}
