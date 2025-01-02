import { SessionScan, SessionScanItem } from '../shared/model/session-scan.ts';
import { Registry, RegistrySession } from '../shared/model/registry.ts';
import { IElectoralPeriodsSource } from './electoral-periods-source.ts';
import { RoutesGenerator } from './routes-generator.ts';
import { IRoutesStore } from './routes-store.ts';
import { assertSpyCall, assertSpyCalls, spy } from '@std/testing/mock';


const mockEmptyElectoralPeriodsSource: IElectoralPeriodsSource = {

  getElectoralPeriods: function (): Registry[] {
    return [];
  },

  getSessionScan: function (_session: RegistrySession, _electoralPeriodDir: string): SessionScan {
    return [];
  }

};

const mockElectoralPeriodsSource: IElectoralPeriodsSource = {

  getElectoralPeriods: function (): Registry[] {
    return [
      {
        id: 'magdeburg-7',
        name: 'Wahlperiode VII',
        sessions: [
          {
            id: 'session-7-1',
            date: '2022-01-01',
            meetingMinutesUrl: 'xxx'
          },
          {
            id: 'session-7-2',
            date: '2022-02-01',
            meetingMinutesUrl: 'yyy'
          },
          {
            id: 'session-7-3',
            date: '2022-03-01',
            meetingMinutesUrl: 'yyy'
          },
        ],
        factions: [
          {
            id: 'faction-7-1',
            name: 'Faction 1',
            seats: 10
          },
          {
            id: 'faction-7-2',
            name: 'Faction 2',
            seats: 10
          },
        ],
        parties: [
          {
            id: 'party-7-1',
            name: 'Party 1',
            seats: 10
          },
          {
            id: 'party-7-2',
            name: 'Party 2',
            seats: 10
          }
        ],
        persons: [
          {
            id: 'person-7-1',
            name: 'Person 1',
            factionId: 'faction-7-1',
            partyId: 'party-7-1',
            start: null,
            end: null
          },
          {
            id: 'person-7-2',
            name: 'Person 2',
            factionId: 'faction-7-1',
            partyId: 'party-7-1',
            start: null,
            end: null
          },
          {
            id: 'person-7-3',
            name: 'Person 3',
            factionId: 'faction-7-2',
            partyId: 'party-7-2',
            start: null,
            end: null
          },
          {
            id: 'person-7-4',
            name: 'Person 4',
            factionId: 'faction-7-2',
            partyId: 'party-7-2',
            start: null,
            end: null
          }
        ]
      },
      {
        id: 'magdeburg-8',
        name: 'Wahlperiode VIII',
        sessions: [
          {
            id: 'session-8-1',
            date: '2024-01-01',
            meetingMinutesUrl: 'xxx'
          },
        ],
        factions: [
          {
            id: 'faction-8-1',
            name: 'Faction 1',
            seats: 10
          },
        ],
        parties: [
          {
            id: 'party-8-1',
            name: 'Party 1',
            seats: 10
          }
        ],
        persons: [
          {
            id: 'person-8-1',
            name: 'Person 1',
            factionId: 'faction-8-1',
            partyId: 'party-8-1',
            start: null,
            end: null
          },
          {
            id: 'person-8-2',
            name: 'Person 2',
            factionId: 'faction-8-1',
            partyId: 'party-8-1',
            start: null,
            end: null
          }
        ]
      }
    ];
  },

  getSessionScan: function (_session: RegistrySession, _electoralPeriodDir: string): SessionScan {

    if (_session.id === 'session-7-1') {
      return createNVotings(3);
    }

    if (_session.id === 'session-7-2') {
      return createNVotings(2);
    }

    if (_session.id === 'session-7-3') {
      return createNVotings(0);
    }

    if (_session.id === 'session-8-1') {
      return createNVotings(1);
    }

    return createNVotings(0);

  }

};

const mockRoutesStore: IRoutesStore = {
  writeRoutes: function (_routes: string[]): void {
    return;
  },
};


function createNVotings(n: number): SessionScan {
  return Array
    .from({ length: n }, (_, index) => index + 1)
    .map(votingId => {
      return {
        votingFilename: `voting-${votingId.toString().padStart(3, '0')}.png`,
      } as SessionScanItem;
    });
}


Deno.test('Write only root route for empty electoral periods', () => {

  using writeRoutesSpy = spy(mockRoutesStore, 'writeRoutes');

  const generator = new RoutesGenerator(mockEmptyElectoralPeriodsSource, mockRoutesStore);
  generator.generateRoutes();

  assertSpyCalls(writeRoutesSpy, 1);
  assertSpyCall(writeRoutesSpy, 0, { args:[['/']] });

});


Deno.test('Write routes for all electoral periods', () => {

  using writeRoutesSpy = spy(mockRoutesStore, 'writeRoutes');

  const generator = new RoutesGenerator(mockElectoralPeriodsSource, mockRoutesStore);
  generator.generateRoutes();

  assertSpyCalls(writeRoutesSpy, 1);
  assertSpyCall(
    writeRoutesSpy,
    0,
    {
      args:[
        [
          "/",
          "/ep/magdeburg-7",
          "/ep/magdeburg-7/parties",
          "/ep/magdeburg-7/party/party-7-1",
          "/ep/magdeburg-7/party/party-7-2",
          "/ep/magdeburg-7/factions",
          "/ep/magdeburg-7/faction/faction-7-1",
          "/ep/magdeburg-7/faction/faction-7-2",
          "/ep/magdeburg-7/persons",
          "/ep/magdeburg-7/person/person-7-1",
          "/ep/magdeburg-7/person/person-7-2",
          "/ep/magdeburg-7/person/person-7-3",
          "/ep/magdeburg-7/person/person-7-4",
          "/ep/magdeburg-7/sessions",
          "/ep/magdeburg-7/session/session-7-1",
          "/ep/magdeburg-7/session/session-7-2",
          "/ep/magdeburg-7/session/session-7-3",
          "/ep/magdeburg-7/session/session-7-1/voting/1",
          "/ep/magdeburg-7/session/session-7-1/voting/2",
          "/ep/magdeburg-7/session/session-7-1/voting/3",
          "/ep/magdeburg-7/session/session-7-2/voting/1",
          "/ep/magdeburg-7/session/session-7-2/voting/2",
          "/ep/magdeburg-8",
          "/ep/magdeburg-8/parties",
          "/ep/magdeburg-8/party/party-8-1",
          "/ep/magdeburg-8/factions",
          "/ep/magdeburg-8/faction/faction-8-1",
          "/ep/magdeburg-8/persons",
          "/ep/magdeburg-8/person/person-8-1",
          "/ep/magdeburg-8/person/person-8-2",
          "/ep/magdeburg-8/sessions",
          "/ep/magdeburg-8/session/session-8-1",
          "/ep/magdeburg-8/session/session-8-1/voting/1"
        ]
      ]
    });

});
