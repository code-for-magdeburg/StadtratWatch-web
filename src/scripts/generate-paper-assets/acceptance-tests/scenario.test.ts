import { describe, it } from '@std/testing/bdd';
import { assert } from '@std/assert';
import { PaperAssetsGenerator } from '../paper-assets-generator.ts';
import { OparlObjectsStore } from '../../shared/oparl/oparl-objects-store.ts';
import { PaperAssetsWriter, PaperGraphAssetsWriter } from '../paper-assets-writer.ts';
import {
  OparlAgendaItem,
  OparlConsultation,
  OparlFile,
  OparlMeeting,
  OparlOrganization,
  OparlPaper,
} from '../../shared/model/oparl.ts';
import { PaperAssetDto, PaperGraphAssetDto } from '../model.ts';
import { PaperFilesStore } from '../paper-files-store.ts';

class MockPaperFilesStore implements PaperFilesStore {
  getFileSize(_fileId: number): number | null {
    return null;
  }
}

class MockOparlObjectsStore implements OparlObjectsStore {
  loadAgendaItems = (): OparlAgendaItem[] => [];

  loadConsultations = (): OparlConsultation[] => [];

  loadFiles = (): OparlFile[] => [];

  loadMeetings = (): OparlMeeting[] => [];

  loadOrganizations = (): OparlOrganization[] => [];

  // Sample paper graph structure:
  //
  //     1 → 3 → 6
  //     ↓   ↓
  //     ↓   7
  //     ↓
  //     4 ← 2 → 5
  //
  //     8 → 9 → 11
  //     ↓   ↓
  //     ↓   12
  //     ↓
  //     10
  //
  //     13 → 14
  //      ↓
  //      15
  //
  //     16 → 17
  //
  //     18 (isolated)
  //
  loadPapers = (): OparlPaper[] => [
    this.createOparlPaper(1, [], [3, 4]),
    this.createOparlPaper(2, [], [4, 5]),
    this.createOparlPaper(3, [1], [6, 7]),
    this.createOparlPaper(4, [1, 2], []),
    this.createOparlPaper(5, [2], []),
    this.createOparlPaper(6, [3], []),
    this.createOparlPaper(7, [3], []),
    this.createOparlPaper(8, [], [9, 10]),
    this.createOparlPaper(9, [8], [11, 12]),
    this.createOparlPaper(10, [8], []),
    this.createOparlPaper(11, [9], []),
    this.createOparlPaper(12, [9], []),
    this.createOparlPaper(13, [], [14, 15]),
    this.createOparlPaper(14, [13], []),
    this.createOparlPaper(15, [13], []),
    this.createOparlPaper(16, [], [17]),
    this.createOparlPaper(17, [16], []),
    this.createOparlPaper(18, [], []),
  ];

  private createOparlPaper(id: number, superordinatedIds: number[], subordinatedIds: number[]): OparlPaper {
    const createOparlPaperId = (id: number) => `http://example.com/oparl/v1/papers/${id}`;
    return {
      id: createOparlPaperId(id),
      type: 'https://schema.oparl.org/1.1/Paper',
      name: `Paper ${id}`,
      // CAUTION! SubordinatedIds and superordinatedIds are swapped here,
      // due to a quirk in the OParl implementation of the SOMACOS system.
      subordinatedPaper: superordinatedIds.map(createOparlPaperId),
      superordinatedPaper: subordinatedIds.map(createOparlPaperId),
    };
  }
}

class MockPaperAssetsWriter implements PaperAssetsWriter {
  papersWritten = 0;
  paperAssetsWritten = 0;

  writePaperAssets(papers: PaperAssetDto[]): void {
    this.papersWritten = papers.length;
    this.paperAssetsWritten = 1;
  }
}

class MockPaperGraphAssetsWriter implements PaperGraphAssetsWriter {
  paperGraphsWritten = 0;
  paperGraphAssetsWritten = 0;

  writePaperGraphAssets(paperGraphAssets: PaperGraphAssetDto[]): void {
    this.paperGraphsWritten = paperGraphAssets.length;
    this.paperGraphAssetsWritten = 1;
  }
}

describe('Generating paper assets', () => {
  let paperFilesStore: MockPaperFilesStore;
  let oparlObjectsStore: MockOparlObjectsStore;
  let paperAssetsWriter: MockPaperAssetsWriter;
  let paperGraphAssetsWriter: MockPaperGraphAssetsWriter;

  it('updates paper graph assets', () => {
    // GIVEN
    paperFilesStoreIsAvailable();
    oparlObjectStoreIsAvailable();
    paperAssetsWriterIsAvailable();
    paperGraphAssetWriterStoreIsAvailable();

    // WHEN
    runPaperAssetsGeneration();

    // THEN
    assert(papersAreWritten());
    assert(paperAssetsAreWritten());
    assert(paperGraphsAreWritten());
    assert(paperGraphAssetsAreWritten());
  });

  function paperFilesStoreIsAvailable() {
    paperFilesStore = new MockPaperFilesStore();
  }

  function oparlObjectStoreIsAvailable() {
    oparlObjectsStore = new MockOparlObjectsStore();
  }

  function paperAssetsWriterIsAvailable() {
    paperAssetsWriter = new MockPaperAssetsWriter();
  }

  function paperGraphAssetWriterStoreIsAvailable() {
    paperGraphAssetsWriter = new MockPaperGraphAssetsWriter();
  }

  function runPaperAssetsGeneration() {
    const generator = new PaperAssetsGenerator(
      paperFilesStore,
      oparlObjectsStore,
      paperAssetsWriter,
      paperGraphAssetsWriter,
    );
    generator.generatePaperAssets();
  }

  function papersAreWritten() {
    return paperAssetsWriter.papersWritten === 18;
  }

  function paperAssetsAreWritten() {
    return paperAssetsWriter.paperAssetsWritten === 1;
  }

  function paperGraphsAreWritten() {
    return paperGraphAssetsWriter.paperGraphsWritten === 6;
  }

  function paperGraphAssetsAreWritten() {
    return paperGraphAssetsWriter.paperGraphAssetsWritten === 1;
  }
});
