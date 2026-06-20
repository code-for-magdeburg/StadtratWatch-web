import { describe, it } from '@std/testing/bdd';
import { assertEquals } from '@std/assert';
import { buildPaperVotingsIndex } from './paper-votings-index.ts';
import { OparlAgendaItem, OparlConsultation, OparlMeeting } from '../shared/model/oparl.ts';
import { Registry } from '@srw-astro/models/registry';
import { ParliamentPeriodData } from './session-data-store.ts';

const COUNCIL_ORG = 'https://ratsinfo.magdeburg.de/oparl/bodies/0001/organizations/gr/1';

describe('buildPaperVotingsIndex', () => {
  const meeting: OparlMeeting = {
    id: 'meeting/1',
    type: 'Meeting',
    name: 'Stadtrat',
    start: '2026-03-02T14:00:00+01:00',
    organization: [COUNCIL_ORG],
  };

  const agendaItem: OparlAgendaItem = {
    id: 'agendaitems/100',
    type: 'AgendaItem',
    name: 'TOP 6.13.1',
    order: 1,
    meeting: 'meeting/1',
    number: '6.13.1',
    consultation: 'consultations/200',
  };

  const consultation: OparlConsultation = {
    id: 'consultations/200',
    type: 'Consultation',
    name: 'Consultation',
    agendaItem: 'agendaitems/100',
    meeting: 'meeting/1',
    paper: 'https://example.com/oparl/papers/247208',
  };

  const registry: Registry = {
    id: 'magdeburg-8',
    name: 'Wahlperiode VIII',
    lastUpdate: '2026-03-03',
    sessions: [],
    factions: [
      { id: 'cdu', name: 'CDU', seats: 10 },
      { id: 'spd', name: 'SPD', seats: 5 },
    ],
    parties: [],
    persons: [
      { id: 'p1', name: 'Alice', factionId: 'cdu', partyId: 'cdu', start: null, end: null },
      { id: 'p2', name: 'Bob', factionId: 'spd', partyId: 'spd', start: null, end: null },
    ],
  };

  const parliamentPeriods: ParliamentPeriodData[] = [{
    registry,
    sessions: [{
      sessionId: '2026-03-02',
      date: '2026-03-02',
      scan: [{
        votingFilename: '2026-03-02-001.png',
        videoTimestamp: '00:13:20',
        votingSubject: {
          agendaItem: '6.13.1',
          motionId: 'A0216/25/1',
          title: 'Spätshops',
          type: 'Änderungsantrag',
          authors: ['Ausschuss KRB'],
        },
        votes: [
          { name: 'Alice', vote: 'J' },
          { name: 'Bob', vote: 'E' },
        ],
      }],
    }],
  }];

  it('links a voting to its paper via the OParl chain', () => {
    const index = buildPaperVotingsIndex(COUNCIL_ORG, parliamentPeriods, [meeting], [agendaItem], [consultation]);

    const votings = index.get(247208);
    assertEquals(votings?.length, 1);
    assertEquals(votings?.[0].votingId, 1);
    assertEquals(votings?.[0].parliamentPeriodId, 'magdeburg-8');
    assertEquals(votings?.[0].sessionId, '2026-03-02');
    assertEquals(votings?.[0].accepted, true);
    assertEquals(votings?.[0].votesByFactions.map((f) => f.factionName), ['CDU', 'SPD']);
    assertEquals(votings?.[0].votesByFactions[0].votes, [{ personName: 'Alice', vote: 'J' }]);
  });

  it('skips votings from meetings that are not council meetings', () => {
    const committeeMeeting: OparlMeeting = { ...meeting, organization: ['some/committee'] };

    const index = buildPaperVotingsIndex(
      COUNCIL_ORG,
      parliamentPeriods,
      [committeeMeeting],
      [agendaItem],
      [consultation],
    );

    assertEquals(index.size, 0);
  });

  it('skips votings whose agenda item cannot be resolved to a paper', () => {
    const unrelatedAgendaItem: OparlAgendaItem = { ...agendaItem, number: '9.9' };

    const index = buildPaperVotingsIndex(
      COUNCIL_ORG,
      parliamentPeriods,
      [meeting],
      [unrelatedAgendaItem],
      [consultation],
    );

    assertEquals(index.size, 0);
  });
});
