import { PaperAssetConsultationDto, PaperAssetDto, PaperAssetFileDto } from './model.ts';
import { PaperFilesStore } from './paper-files-store.ts';
import { OparlMeetingsInMemoryRepository, OparlMeetingsRepository } from '../shared/oparl/oparl-meetings-repository.ts';
import { OparlPapersInMemoryRepository, OparlPapersRepository } from '../shared/oparl/oparl-papers-repository.ts';
import { OparlFilesInMemoryRepository, OparlFilesRepository } from '../shared/oparl/oparl-files-repository.ts';
import {
  OparlOrganizationsInMemoryRepository,
  OparlOrganizationsRepository,
} from '../shared/oparl/oparl-organizations-repository.ts';
import {
  OparlAgendaItemsInMemoryRepository,
  OparlAgendaItemsRepository,
} from '../shared/oparl/oparl-agenda-items-repository.ts';
import { OparlPaper } from '../shared/model/oparl.ts';
import { createInMemoryGraph, PaperGraph } from './paper-graph.ts';
import { OparlObjectsStore } from '../shared/oparl/oparl-objects-store.ts';
import { IPaperAssetsStore } from './paper-assets-store.ts';

export class PaperAssetsGenerator {
  private readonly meetingsRepository: OparlMeetingsRepository;
  private readonly papersRepository: OparlPapersRepository;
  private readonly organizationsRepository: OparlOrganizationsRepository;
  private readonly agendaItemsRepository: OparlAgendaItemsRepository;
  private readonly filesRepository: OparlFilesRepository;
  private readonly paperGraph: PaperGraph;

  constructor(
    private readonly paperFilesStore: PaperFilesStore,
    private readonly oparlObjectsStore: OparlObjectsStore,
    private readonly paperAssetsStore: IPaperAssetsStore,
  ) {
    this.meetingsRepository = new OparlMeetingsInMemoryRepository(this.oparlObjectsStore.loadMeetings());
    this.papersRepository = new OparlPapersInMemoryRepository(this.oparlObjectsStore.loadPapers());
    this.organizationsRepository = new OparlOrganizationsInMemoryRepository(this.oparlObjectsStore.loadOrganizations());
    this.agendaItemsRepository = new OparlAgendaItemsInMemoryRepository(this.oparlObjectsStore.loadAgendaItems());
    this.filesRepository = new OparlFilesInMemoryRepository(this.oparlObjectsStore.loadFiles(), this.papersRepository);
    this.paperGraph = createInMemoryGraph(this.papersRepository);
  }

  public generatePaperAssets() {
    const paperAssets = this.papersRepository.getAllPapers().filter((paper) => !paper.deleted).map<PaperAssetDto>(
      (paper) => {
        const consultations = this.getConsultations(paper);
        const files = this.getFiles(paper);
        const paperId = +paper.id.split('/').pop()!;
        const paperGroupId = this.paperGraph.getRootPapersOfPaper(paperId)[0];
        return {
          id: paperId,
          reference: paper.reference || null,
          type: paper.paperType || null,
          title: paper.name,
          files,
          consultations,
          paperGroupId,
        };
      },
    );

    this.paperAssetsStore.writePaperAssets(paperAssets);
  }

  private getConsultations(paper: OparlPaper) {
    return (paper.consultation || [])
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
  }

  private getFiles(paper: OparlPaper) {
    return this.filesRepository
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
  }
}
