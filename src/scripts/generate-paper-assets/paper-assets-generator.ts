import {
  PaperAssetDto,
  PaperConsultationDto,
  PaperDto,
  PaperFileDto,
  PaperGraphAssetDto,
  PaperGraphDto,
} from './model.ts';
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
import { createInMemoryPaperGraph } from './paper-graph.ts';
import { OparlObjectsStore } from '../shared/oparl/oparl-objects-store.ts';
import { PaperAssetsWriter } from './paper-assets-writer.ts';
import { PaperGraphAssetsWriter } from './paper-graph-assets-writer.ts';

export class PaperAssetsGenerator {
  private readonly meetingsRepository: OparlMeetingsRepository;
  private readonly papersRepository: OparlPapersRepository;
  private readonly organizationsRepository: OparlOrganizationsRepository;
  private readonly agendaItemsRepository: OparlAgendaItemsRepository;
  private readonly filesRepository: OparlFilesRepository;

  constructor(
    private readonly paperFilesStore: PaperFilesStore,
    private readonly oparlObjectsStore: OparlObjectsStore,
    private readonly paperAssetsWriter: PaperAssetsWriter,
    private readonly paperGraphAssetsWriter: PaperGraphAssetsWriter,
  ) {
    this.meetingsRepository = new OparlMeetingsInMemoryRepository(this.oparlObjectsStore.loadMeetings());
    this.papersRepository = new OparlPapersInMemoryRepository(this.oparlObjectsStore.loadPapers());
    this.organizationsRepository = new OparlOrganizationsInMemoryRepository(this.oparlObjectsStore.loadOrganizations());
    this.agendaItemsRepository = new OparlAgendaItemsInMemoryRepository(this.oparlObjectsStore.loadAgendaItems());
    this.filesRepository = new OparlFilesInMemoryRepository(this.oparlObjectsStore.loadFiles(), this.papersRepository);
  }

  public generatePaperAssets() {
    const onePaperGraph = createInMemoryPaperGraph(this.papersRepository);

    const papers = this.papersRepository.getAllPapers().filter((paper) => !paper.deleted).map<PaperDto>(
      (paper) => {
        const consultations = this.getConsultations(paper);
        const files = this.getFiles(paper);
        const paperId = +paper.id.split('/').pop()!;
        const rootPaperId = onePaperGraph.getRootPapersOfPaper(paperId)[0];
        return {
          id: paperId,
          reference: paper.reference || null,
          type: paper.paperType || null,
          title: paper.name,
          files,
          consultations,
          rootPaperId,
        };
      },
    );
    // Group papers in batches of 100.
    const paperAssetsGroups = papers
      .sort((a, b) => a.id - b.id)
      .reduce((acc, paper) => {
        const batchNo = `${Math.floor(paper.id / 100)}`.padStart(4, '0');
        if (!acc[batchNo]) {
          acc[batchNo] = [];
        }
        acc[batchNo].push(paper);
        return acc;
      }, {} as { [batchNo: string]: PaperDto[] });
    const paperAssets = Object.entries(paperAssetsGroups).map<PaperAssetDto>(
      ([batchNo, papers]) => ({
        batchNo,
        papers,
      }),
    );
    this.paperAssetsWriter.writePaperAssets(paperAssets);

    const paperGraphs = onePaperGraph
      .getAllRootPapers()
      .map<PaperGraphDto>((rootPaperId) => ({ rootPaperId: rootPaperId }));
    // Group paper graphs in batches of 100.
    const paperGraphGroups = paperGraphs
      .sort((a, b) => a.rootPaperId - b.rootPaperId)
      .reduce((acc, paperGraph) => {
        const batchNo = `${Math.floor(paperGraph.rootPaperId / 100)}`.padStart(4, '0');
        if (!acc[batchNo]) {
          acc[batchNo] = [];
        }
        acc[batchNo].push(paperGraph);
        return acc;
      }, {} as { [batchNo: string]: PaperGraphDto[] });
    const paperGraphAssets = Object.entries(paperGraphGroups).map<PaperGraphAssetDto>(
      ([batchNo, paperGraphs]) => ({
        batchNo,
        paperGraphs,
      }),
    );

    this.paperGraphAssetsWriter.writePaperGraphAssets(paperGraphAssets);
  }

  private getConsultations(paper: OparlPaper) {
    return (paper.consultation || [])
      .map<PaperConsultationDto | null>((consultation) => {
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
      .filter((consultation): consultation is PaperConsultationDto => consultation !== null)
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
      .map<PaperFileDto>((file) => {
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
