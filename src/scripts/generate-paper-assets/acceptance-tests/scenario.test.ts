import { describe, expect, it } from 'bun:test';

import type {
  OparlAgendaItem,
  OparlConsultation,
  OparlFile,
  OparlMeeting,
  OparlOrganization,
  OparlPaper,
} from '@srw-astro/models/oparl';

import type { OparlObjectsStore } from '../../shared/oparl/oparl-objects-store.ts';
import type { PaperAssetDto, PaperGraphAssetDto } from '../model.ts';
import { PaperAssetsGenerator } from '../paper-assets-generator.ts';
import type { PaperAssetsWriter } from '../paper-assets-writer.ts';
import type { PaperFilesStore } from '../paper-files-store.ts';
import type { PaperGraphAssetsWriter } from '../paper-graph-assets-writer.ts';
import type { SessionIndex, SessionIndexStore } from '../session-index.ts';

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
    this.createOparlPaper(10, [], [30, 40]),
    this.createOparlPaper(20, [], [40, 50]),
    this.createOparlPaper(30, [10], [60, 70]),
    this.createOparlPaper(40, [10, 20], []),
    this.createOparlPaper(50, [20], []),
    this.createOparlPaper(60, [30], []),
    this.createOparlPaper(70, [30], []),
    this.createOparlPaper(80, [], [90, 100]),
    this.createOparlPaper(90, [80], [110, 120]),
    this.createOparlPaper(100, [80], []),
    this.createOparlPaper(110, [90], []),
    this.createOparlPaper(120, [90], []),
    this.createOparlPaper(130, [], [140, 150]),
    this.createOparlPaper(140, [130], []),
    this.createOparlPaper(150, [130], []),
    this.createOparlPaper(160, [], [170]),
    this.createOparlPaper(170, [160], []),
    this.createOparlPaper(180, [], []),
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

class MockSessionIndexStore implements SessionIndexStore {
  constructor(private readonly sessionIndex: SessionIndex = {}) {}

  loadSessionIndex = (): Promise<SessionIndex> => Promise.resolve(this.sessionIndex);
}

class MockPaperAssetsWriter implements PaperAssetsWriter {
  papersWritten = 0;
  paperAssetsWritten = 0;

  writePaperAssets(assets: PaperAssetDto[]): Promise<void> {
    this.papersWritten = assets.map((a) => a.papers.length).reduce((a, b) => a + b, 0);
    this.paperAssetsWritten = assets.length;
    return Promise.resolve();
  }
}

class MockPaperGraphAssetsWriter implements PaperGraphAssetsWriter {
  paperGraphsWritten = 0;
  paperGraphAssetsWritten = 0;

  writePaperGraphAssets(assets: PaperGraphAssetDto[]): Promise<void> {
    this.paperGraphsWritten = assets.map((a) => a.paperGraphs.length).reduce((a, b) => a + b, 0);
    this.paperGraphAssetsWritten = assets.length;
    return Promise.resolve();
  }
}

describe('Generating paper assets', () => {
  let paperFilesStore: MockPaperFilesStore;
  let oparlObjectsStore: MockOparlObjectsStore;
  let sessionIndexStore: MockSessionIndexStore;
  let paperAssetsWriter: MockPaperAssetsWriter;
  let paperGraphAssetsWriter: MockPaperGraphAssetsWriter;

  it('writes papers into assets', async () => {
    // GIVEN
    paperFilesStoreIsAvailable();
    oparlObjectStoreIsAvailable();
    sessionIndexStoreIsAvailable();
    paperAssetsWriterIsAvailable();
    paperGraphAssetWriterIsAvailable();

    // WHEN
    await runPaperAssetsGeneration();

    // THEN
    expect(papersAreWritten()).toBe(true);
    expect(paperAssetsAreWritten()).toBe(true);
  });

  it('writes paper graphs into assets', async () => {
    // GIVEN
    paperFilesStoreIsAvailable();
    oparlObjectStoreIsAvailable();
    sessionIndexStoreIsAvailable();
    paperAssetsWriterIsAvailable();
    paperGraphAssetWriterIsAvailable();

    // WHEN
    await runPaperAssetsGeneration();

    // THEN
    expect(paperGraphsAreWritten(), 'Expected paper graphs to be written').toBe(true);
    expect(paperGraphAssetsAreWritten(), 'Expected paper graph assets to be written').toBe(true);
  });

  function paperFilesStoreIsAvailable() {
    paperFilesStore = new MockPaperFilesStore();
  }

  function oparlObjectStoreIsAvailable() {
    oparlObjectsStore = new MockOparlObjectsStore();
  }

  function sessionIndexStoreIsAvailable(sessionIndex: SessionIndex = {}) {
    sessionIndexStore = new MockSessionIndexStore(sessionIndex);
  }

  function paperAssetsWriterIsAvailable() {
    paperAssetsWriter = new MockPaperAssetsWriter();
  }

  function paperGraphAssetWriterIsAvailable() {
    paperGraphAssetsWriter = new MockPaperGraphAssetsWriter();
  }

  async function runPaperAssetsGeneration() {
    const generator = new PaperAssetsGenerator(
      paperFilesStore,
      oparlObjectsStore,
      sessionIndexStore,
      'http://example.com/oparl/organizations/council',
      paperAssetsWriter,
      paperGraphAssetsWriter,
    );
    await generator.generatePaperAssets();
  }

  function papersAreWritten() {
    return paperAssetsWriter.papersWritten === 18;
  }

  function paperAssetsAreWritten() {
    return paperAssetsWriter.paperAssetsWritten === 2;
  }

  function paperGraphsAreWritten() {
    return paperGraphAssetsWriter.paperGraphsWritten === 6;
  }

  function paperGraphAssetsAreWritten() {
    return paperGraphAssetsWriter.paperGraphAssetsWritten === 2;
  }
});
