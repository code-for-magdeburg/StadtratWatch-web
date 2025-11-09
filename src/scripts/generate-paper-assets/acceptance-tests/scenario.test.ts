import { describe, it } from '@std/testing/bdd';
import { assert } from '@std/assert';
import { PaperAssetsGenerator } from '../paper-assets-generator.ts';
import { OparlObjectsStore } from '../../shared/oparl/oparl-objects-store.ts';
import { PaperAssetsStore } from '../paper-assets-store.ts';
import {
  OparlAgendaItem,
  OparlConsultation,
  OparlFile,
  OparlMeeting,
  OparlOrganization,
  OparlPaper,
} from '../../shared/model/oparl.ts';
import { PaperAssetDto } from '../model.ts';
import { PaperFilesStore } from '../paper-files-store.ts';

class MockPaperFilesStore implements PaperFilesStore {
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

class MockPaperAssetsStore implements PaperAssetsStore {
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
