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
import type { PaperAssetDto, PaperConsultationDto, PaperGraphAssetDto } from '../model.ts';
import { PaperAssetsGenerator } from '../paper-assets-generator.ts';
import type { PaperAssetsWriter } from '../paper-assets-writer.ts';
import type { PaperFilesStore } from '../paper-files-store.ts';
import type { PaperGraphAssetsWriter } from '../paper-graph-assets-writer.ts';
import type { SessionIndex, SessionIndexStore } from '../session-index.ts';

const COUNCIL_ORGANIZATION = 'http://example.com/oparl/organizations/council';
const MAYOR_ORGANIZATION = 'http://example.com/oparl/organizations/mayor';

const COUNCIL_MEETING_ON_SESSION_DATE = 'http://example.com/oparl/meetings/1';
const COUNCIL_MEETING_WITHOUT_SESSION_PAGE = 'http://example.com/oparl/meetings/2';
const MAYOR_MEETING_ON_SESSION_DATE = 'http://example.com/oparl/meetings/3';

const AGENDA_ITEM_COUNCIL_LINKED = 'http://example.com/oparl/agendaItems/1';
const AGENDA_ITEM_COUNCIL_UNLINKED = 'http://example.com/oparl/agendaItems/2';
const AGENDA_ITEM_MAYOR = 'http://example.com/oparl/agendaItems/3';

const SESSION_DATE = '2024-07-08';
const OTHER_DATE = '2024-06-03';
const PARLIAMENT_PERIOD_ID = 'magdeburg-8';

class MockPaperFilesStore implements PaperFilesStore {
  getFileSize = (_fileId: number): number | null => null;
}

class MockOparlObjectsStore implements OparlObjectsStore {
  loadAgendaItems = (): OparlAgendaItem[] => [
    this.agendaItem(AGENDA_ITEM_COUNCIL_LINKED, '5.1'),
    this.agendaItem(AGENDA_ITEM_COUNCIL_UNLINKED, '5.2'),
    this.agendaItem(AGENDA_ITEM_MAYOR, '5.3'),
  ];

  loadConsultations = (): OparlConsultation[] => [];

  loadFiles = (): OparlFile[] => [];

  loadMeetings = (): OparlMeeting[] => [
    this.meeting(COUNCIL_MEETING_ON_SESSION_DATE, `${SESSION_DATE}T15:00:00+02:00`, COUNCIL_ORGANIZATION),
    this.meeting(COUNCIL_MEETING_WITHOUT_SESSION_PAGE, `${OTHER_DATE}T15:00:00+02:00`, COUNCIL_ORGANIZATION),
    this.meeting(MAYOR_MEETING_ON_SESSION_DATE, `${SESSION_DATE}T10:00:00+02:00`, MAYOR_ORGANIZATION),
  ];

  loadOrganizations = (): OparlOrganization[] => [
    { id: COUNCIL_ORGANIZATION, type: 'https://schema.oparl.org/1.1/Organization', name: 'Stadtrat' },
    { id: MAYOR_ORGANIZATION, type: 'https://schema.oparl.org/1.1/Organization', name: 'Oberbürgermeisterin' },
  ];

  loadPapers = (): OparlPaper[] => [
    {
      id: 'http://example.com/oparl/papers/1',
      type: 'https://schema.oparl.org/1.1/Paper',
      name: 'Paper 1',
      consultation: [
        this.consultation(COUNCIL_MEETING_ON_SESSION_DATE, COUNCIL_ORGANIZATION, AGENDA_ITEM_COUNCIL_LINKED),
        this.consultation(COUNCIL_MEETING_WITHOUT_SESSION_PAGE, COUNCIL_ORGANIZATION, AGENDA_ITEM_COUNCIL_UNLINKED),
        this.consultation(MAYOR_MEETING_ON_SESSION_DATE, MAYOR_ORGANIZATION, AGENDA_ITEM_MAYOR),
      ],
    },
  ];

  private meeting(id: string, start: string, organization: string): OparlMeeting {
    return { id, type: 'https://schema.oparl.org/1.1/Meeting', name: 'Sitzung', start, organization: [organization] };
  }

  private agendaItem(id: string, number: string): OparlAgendaItem {
    return { id, type: 'https://schema.oparl.org/1.1/AgendaItem', name: 'TOP', order: 0, number };
  }

  private consultation(meeting: string, organization: string, agendaItem: string): OparlConsultation {
    return {
      id: `${meeting}-consultation`,
      type: 'https://schema.oparl.org/1.1/Consultation',
      name: 'Beratung',
      meeting,
      organization: [organization],
      agendaItem,
    };
  }
}

class MockSessionIndexStore implements SessionIndexStore {
  constructor(private readonly sessionIndex: SessionIndex) {}

  loadSessionIndex = (): Promise<SessionIndex> => Promise.resolve(this.sessionIndex);
}

class CapturingPaperAssetsWriter implements PaperAssetsWriter {
  consultations: PaperConsultationDto[] = [];

  writePaperAssets(assets: PaperAssetDto[]): Promise<void> {
    this.consultations = assets.flatMap((asset) => asset.papers).flatMap((paper) => paper.consultations);
    return Promise.resolve();
  }
}

class NoopPaperGraphAssetsWriter implements PaperGraphAssetsWriter {
  writePaperGraphAssets(_assets: PaperGraphAssetDto[]): Promise<void> {
    return Promise.resolve();
  }
}

describe('Linking consultations to session pages', () => {
  it('attaches the parliament period and session id when a council meeting has a session page', async () => {
    const linked = (await generateConsultations()).find((consultation) => consultation.agendaItem === '5.1')!;
    expect(linked.parliamentPeriodId).toEqual(PARLIAMENT_PERIOD_ID);
    expect(linked.sessionId).toEqual(SESSION_DATE);
  });

  it('leaves council consultations without a matching session page unlinked', async () => {
    const unlinked = (await generateConsultations()).find((consultation) => consultation.agendaItem === '5.2')!;
    expect(unlinked.parliamentPeriodId).toEqual(undefined);
    expect(unlinked.sessionId).toEqual(undefined);
  });

  it('does not link non-council meetings that merely share a session date', async () => {
    const mayorConsultation = (await generateConsultations()).find(
      (consultation) => consultation.agendaItem === '5.3',
    )!;
    expect(mayorConsultation.parliamentPeriodId).toEqual(undefined);
    expect(mayorConsultation.sessionId).toEqual(undefined);
  });

  async function generateConsultations(): Promise<PaperConsultationDto[]> {
    const writer = new CapturingPaperAssetsWriter();
    const generator = new PaperAssetsGenerator(
      new MockPaperFilesStore(),
      new MockOparlObjectsStore(),
      new MockSessionIndexStore({
        [SESSION_DATE]: { parliamentPeriodId: PARLIAMENT_PERIOD_ID, sessionId: SESSION_DATE },
      }),
      COUNCIL_ORGANIZATION,
      writer,
      new NoopPaperGraphAssetsWriter(),
    );
    await generator.generatePaperAssets();
    return writer.consultations;
  }
});
