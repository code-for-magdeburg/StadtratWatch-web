import { describe, it } from '@std/testing/bdd';
import { assert } from '@std/assert';
import { PaperAssetsGenerator } from '../../scripts/generate-paper-assets/paper-assets-generator.ts';
import { OparlObjectsStore } from '../../scripts/shared/oparl/oparl-objects-store.ts';
import { IPaperAssetsStore } from '../../scripts/generate-paper-assets/paper-assets-store.ts';
import {
  OparlAgendaItem,
  OparlConsultation,
  OparlFile,
  OparlMeeting,
  OparlOrganization,
  OparlPaper,
} from '../../scripts/shared/model/oparl.ts';
import { PaperAssetDto } from '../../scripts/generate-paper-assets/model.ts';
import { IPaperFilesStore } from '../../scripts/generate-paper-assets/paper-files-store.ts';

class MockPaperFilesStore implements IPaperFilesStore {
  getFileSize(_fileId: number): number | null {
    return null;
  }
}

class MockOparlObjectsStore implements OparlObjectsStore {
  loadAgendaItems(): OparlAgendaItem[] {
    return [];
  }

  loadConsultations(): OparlConsultation[] {
    return [];
  }

  loadFiles(): OparlFile[] {
    return [];
  }

  loadMeetings(): OparlMeeting[] {
    return [];
  }

  loadOrganizations(): OparlOrganization[] {
    return [];
  }

  loadPapers(): OparlPaper[] {
    return [];
  }
}

class MockPaperAssetsStore implements IPaperAssetsStore {
  paperAssetsWritten = false;

  writePaperAssets(_papers: PaperAssetDto[]): unknown {
    this.paperAssetsWritten = true;
    return undefined;
  }
}

describe('Generating paper assets', () => {
  let paperFilesStore: MockPaperFilesStore;
  let oparlObjectsStore: MockOparlObjectsStore;
  let paperAssetsStore: MockPaperAssetsStore;

  it('updates paper graph assets', () => {
    // GIVEN
    assert(paperFilesStoreIsAvailable());
    assert(oparlObjectFilesAreAvailable());
    assert(paperAssetFilesStoreIsAvailable());

    // WHEN
    runPaperAssetsGeneration();

    // THEN
    assert(paperGraphAssetsAreUpdated());
  });

  function paperFilesStoreIsAvailable() {
    paperFilesStore = new MockPaperFilesStore();

    return true;
  }

  function oparlObjectFilesAreAvailable() {
    oparlObjectsStore = new MockOparlObjectsStore();

    return true;
  }

  function paperAssetFilesStoreIsAvailable() {
    paperAssetsStore = new MockPaperAssetsStore();

    return true;
  }

  function runPaperAssetsGeneration() {
    const generator = new PaperAssetsGenerator(
      paperFilesStore,
      oparlObjectsStore,
      paperAssetsStore,
    );
    generator.generatePaperAssets();
  }

  function paperGraphAssetsAreUpdated() {
    return paperAssetsStore.paperAssetsWritten;
  }
});
