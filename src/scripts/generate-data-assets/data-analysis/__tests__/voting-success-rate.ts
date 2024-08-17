import {
  calcFactionVotingSuccessRate,
  calcPartyVotingSuccessRate,
  calcPersonVotingSuccess
} from '../voting-success-rate';
import {
  SessionDetailsDto, SessionFactionDto, SessionPartyDto,
  SessionPersonDto,
  SessionVotingDto,
  Vote,
  VoteResult,
  VotingResult
} from '../../../../app/model/Session';
import { RegistryPerson } from '../../../shared/model/registry';


describe('Calculating voting success rate', () => {


  describe('of a faction', () => {

    it('should return 0 if there are no votings', () => {
      const faction = createSessionFaction('faction-1', 'Faction 1');
      const party = createSessionParty('party-1', 'Party 1');
      const persons = createSessionPersons(1, faction.name, party.name);
      const session = createSession([], [faction], [party], persons);
      const votingsSuccessRate = calcFactionVotingSuccessRate(faction.id, [session]);
      expect(votingsSuccessRate).toBe(0);
    });

    it('should be 100% if faction voted for passed voting', () => {

      const faction1 = createSessionFaction('faction-1', 'Faction 1');
      const faction2 = createSessionFaction('faction-2', 'Faction 2');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');

      const personsFaction1 = createSessionPersons(2, faction1.name, party1.name);
      const personsFaction2 = createSessionPersons(1, faction2.name, party2.name);

      const passedVoting = createVoting(1, personsFaction1, personsFaction2, [], []);
      const session = createSession([passedVoting], [faction1, faction2], [party1, party2], [...personsFaction1, ...personsFaction2]);

      const votingsSuccessRate = calcFactionVotingSuccessRate(faction1.id, [session]);

      expect(votingsSuccessRate).toBe(1);

    });

    it('should be 100% if faction voted against rejected voting', () => {

      const faction1 = createSessionFaction('faction-1', 'Faction 1');
      const faction2 = createSessionFaction('faction-2', 'Faction 2');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');

      const personsFaction1 = createSessionPersons(2, faction1.name, party1.name);
      const personsFaction2 = createSessionPersons(1, faction2.name, party2.name);

      const rejectedVoting = createVoting(1, personsFaction2, personsFaction1, [], []);
      const session = createSession([rejectedVoting], [faction1, faction2], [party1, party2], [...personsFaction1, ...personsFaction2]);

      const votingsSuccessRate = calcFactionVotingSuccessRate(faction1.id, [session]);

      expect(votingsSuccessRate).toBe(1);

    });

    it('should be 0% if faction voted against passed voting', () => {

      const faction1 = createSessionFaction('faction-1', 'Faction 1');
      const faction2 = createSessionFaction('faction-2', 'Faction 2');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');

      const personsFaction1 = createSessionPersons(2, faction1.name, party1.name);
      const personsFaction2 = createSessionPersons(3, faction2.name, party2.name);

      const passedVoting = createVoting(1, personsFaction2, personsFaction1, [], []);
      const session = createSession([passedVoting], [faction1, faction2], [party1, party2], [...personsFaction1, ...personsFaction2]);

      const votingsSuccessRate = calcFactionVotingSuccessRate(faction1.id, [session]);

      expect(votingsSuccessRate).toBe(0);

    });

    it('should be 0% if faction voted for rejected voting', () => {

      const faction1 = createSessionFaction('faction-1', 'Faction 1');
      const faction2 = createSessionFaction('faction-2', 'Faction 2');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');

      const personsFaction1 = createSessionPersons(2, faction1.name, party1.name);
      const personsFaction2 = createSessionPersons(3, faction2.name, party2.name);

      const rejectedVoting = createVoting(1, personsFaction1, personsFaction2, [], []);
      const session = createSession([rejectedVoting], [faction1, faction2], [party1, party2], [...personsFaction1, ...personsFaction2]);

      const votingsSuccessRate = calcFactionVotingSuccessRate(faction1.id, [session]);

      expect(votingsSuccessRate).toBe(0);

    });

    it('should be 50% if faction half of votings were successful', () => {

      const faction1 = createSessionFaction('faction-1', 'Faction 1');
      const faction2 = createSessionFaction('faction-2', 'Faction 2');
      const faction3 = createSessionFaction('faction-3', 'Faction 3');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');
      const party3 = createSessionParty('party-3', 'Party 3');

      const personsFaction1 = createSessionPersons(1, faction1.name, party1.name);
      const personsFaction2 = createSessionPersons(2, faction2.name, party2.name);
      const personsFaction3 = createSessionPersons(3, faction3.name, party3.name);

      const voting1 = createVoting(1, personsFaction2, personsFaction1, personsFaction3, []);
      const voting2 = createVoting(2, personsFaction2, personsFaction3, personsFaction1, []);
      const session = createSession([voting1, voting2], [faction1, faction2, faction3], [party1, party2, party3], [...personsFaction1, ...personsFaction2, ...personsFaction3]);

      const votingsSuccessRate = calcFactionVotingSuccessRate(faction2.id, [session]);

      expect(votingsSuccessRate).toBe(.5);

    });

  });


  describe('of a party', () => {

    it('should return 0 if there are no votings', () => {
      const faction = createSessionFaction('faction-1', 'Faction 1');
      const party = createSessionParty('party-1', 'Party 1');
      const persons = createSessionPersons(1, faction.name, party.name);
      const session = createSession([], [faction], [party], persons);
      const votingsSuccessRate = calcPartyVotingSuccessRate(party.id, [session])
      expect(votingsSuccessRate).toBe(0);
    });

    it('should be 100% if party voted for passed voting', () => {

      const faction = createSessionFaction('faction-1', 'Faction 1');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');

      const personsParty1 = createSessionPersons(2, faction.name, party1.name);
      const personsParty2 = createSessionPersons(1, faction.name, party2.name);

      const passedVoting = createVoting(1, personsParty1, personsParty2, [], []);
      const session = createSession([passedVoting], [faction], [party1, party2], [...personsParty1, ...personsParty2]);

      const votingsSuccessRate = calcPartyVotingSuccessRate(party1.id, [session]);

      expect(votingsSuccessRate).toBe(1);

    });

    it('should be 100% if party voted against rejected voting', () => {

      const faction = createSessionFaction('faction-1', 'Faction 1');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');

      const personsParty1 = createSessionPersons(2, faction.name, party1.name);
      const personsParty2 = createSessionPersons(1, faction.name, party2.name);

      const rejectedVoting = createVoting(1, personsParty2, personsParty1, [], []);
      const session = createSession([rejectedVoting], [faction], [party1, party2], [...personsParty1, ...personsParty2]);

      const votingsSuccessRate = calcPartyVotingSuccessRate(party1.id, [session]);

      expect(votingsSuccessRate).toBe(1);

    });

    it('should be 0% if party voted against passed voting', () => {

      const faction = createSessionFaction('faction-1', 'Faction 1');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');

      const personsParty1 = createSessionPersons(2, faction.name, party1.name);
      const personsParty2 = createSessionPersons(3, faction.name, party2.name);

      const passedVoting = createVoting(1, personsParty2, personsParty1, [], []);
      const session = createSession([passedVoting], [faction], [party1, party2], [...personsParty1, ...personsParty2]);

      const votingsSuccessRate = calcPartyVotingSuccessRate(party1.id, [session]);

      expect(votingsSuccessRate).toBe(0);

    });

    it('should be 0% if party voted for rejected voting', () => {

      const faction = createSessionFaction('faction-1', 'Faction 1');
      const minorityParty = createSessionParty('minority', 'Minority');
      const majorityParty = createSessionParty('majority', 'Majority');

      const personsMinorityParty = createSessionPersons(2, faction.name, minorityParty.name);
      const personsMajorityParty = createSessionPersons(3, faction.name, majorityParty.name);

      const rejectedVoting = createVoting(1, personsMinorityParty, personsMajorityParty, [], []);
      const session = createSession([rejectedVoting], [faction], [minorityParty, majorityParty], [...personsMinorityParty, ...personsMajorityParty]);

      const votingsSuccessRate = calcPartyVotingSuccessRate(minorityParty.id, [session]);

      expect(votingsSuccessRate).toBe(0);

    });

    it('should be 50% if half of votings were successful', () => {

      const faction = createSessionFaction('faction-1', 'Faction 1');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');
      const party3 = createSessionParty('party-3', 'Party 3');

      const personsParty1 = createSessionPersons(1, faction.name, party1.name);
      const personsParty2 = createSessionPersons(2, faction.name, party2.name);
      const personsParty3 = createSessionPersons(3, faction.name, party3.name);

      const voting1 = createVoting(1, personsParty2, personsParty1, personsParty3, []);
      const voting2 = createVoting(2, personsParty2, personsParty3, personsParty1, []);
      const session = createSession([voting1, voting2], [faction], [party1, party2, party3], [...personsParty1, ...personsParty2, ...personsParty3]);

      const votingsSuccessRate = calcPartyVotingSuccessRate(party2.id, [session]);

      expect(votingsSuccessRate).toBe(.5);

    });

  });


  describe('of a person', () => {

    it('should return null if there are no votings', () => {
      const faction = createSessionFaction('faction-1', 'Faction 1');
      const party = createSessionParty('party-1', 'Party 1');
      const person: RegistryPerson = createPerson('person-1', 'Hans Hansen', faction, party);
      const sessionPerson = createSessionPerson(person);
      const session = createSession([], [faction], [party], [sessionPerson]);
      const votingsSuccessRate = calcPersonVotingSuccess([session], person);
      expect(votingsSuccessRate).toEqual({ successCount: 0, successRate: 0 });
    });

    it('should be 100% if person voted for passed voting', () => {

      const faction = createSessionFaction('faction-1', 'Faction 1');
      const party = createSessionParty('party-1', 'Party 1');

      const person1: RegistryPerson = createPerson('person-1', 'Hans Hansen', faction, party);
      const person2: RegistryPerson = createPerson('person-2', 'Jens Jensen', faction, party);

      const sessionPerson1 = createSessionPerson(person1);
      const sessionPerson2 = createSessionPerson(person2);

      const passedVoting = createVoting(1, [sessionPerson1, sessionPerson2], [], [], []);
      const session = createSession([passedVoting], [faction], [party], [sessionPerson1, sessionPerson2]);

      const votingsSuccessRate = calcPersonVotingSuccess([session], person1);

      expect(votingsSuccessRate).toEqual({ successCount: 1, successRate: 1 });

    });

    it('should be 100% if person voted against rejected voting', () => {

      const faction = createSessionFaction('faction-1', 'Faction 1');
      const party = createSessionParty('party-1', 'Party 1');

      const person1: RegistryPerson = createPerson('person-1', 'Hans Hansen', faction, party);
      const person2: RegistryPerson = createPerson('person-2', 'Jens Jensen', faction, party);

      const sessionPerson1 = createSessionPerson(person1);
      const sessionPerson2 = createSessionPerson(person2);

      const rejectedVoting = createVoting(1, [], [sessionPerson1, sessionPerson2], [], []);
      const session = createSession([rejectedVoting], [faction], [party], [sessionPerson1, sessionPerson2]);

      const votingsSuccessRate = calcPersonVotingSuccess([session], person1);

      expect(votingsSuccessRate).toEqual({ successCount: 1, successRate: 1 });

    });

    it('should be 0% if person voted against passed voting', () => {

      const faction = createSessionFaction('faction-1', 'Faction 1');
      const party = createSessionParty('party-1', 'Party 1');

      const person1: RegistryPerson = createPerson('person-1', 'Hans Hansen', faction, party);
      const person2: RegistryPerson = createPerson('person-2', 'Jens Jensen', faction, party);
      const person3: RegistryPerson = createPerson('person-3', 'Britt Schmidt', faction, party);

      const sessionPerson1 = createSessionPerson(person1);
      const sessionPerson2 = createSessionPerson(person2);
      const sessionPerson3 = createSessionPerson(person3);

      const passedVoting = createVoting(1, [sessionPerson2, sessionPerson3], [sessionPerson1], [], []);
      const session = createSession([passedVoting], [faction], [party], [sessionPerson1, sessionPerson2, sessionPerson3]);

      const votingsSuccessRate = calcPersonVotingSuccess([session], person1);

      expect(votingsSuccessRate).toEqual({ successCount: 0, successRate: 0 });

    });

    it('should be 0% if person voted for rejected voting', () => {

      const faction = createSessionFaction('faction-1', 'Faction 1');
      const party = createSessionParty('party-1', 'Party 1');

      const person1: RegistryPerson = createPerson('person-1', 'Hans Hansen', faction, party);
      const person2: RegistryPerson = createPerson('person-2', 'Jens Jensen', faction, party);
      const person3: RegistryPerson = createPerson('person-3', 'Britt Schmidt', faction, party);

      const sessionPerson1 = createSessionPerson(person1);
      const sessionPerson2 = createSessionPerson(person2);
      const sessionPerson3 = createSessionPerson(person3);

      const rejectedVoting = createVoting(1, [sessionPerson1], [sessionPerson2, sessionPerson3], [], []);
      const session = createSession([rejectedVoting], [faction], [party], [sessionPerson1, sessionPerson2, sessionPerson3]);

      const votingsSuccessRate = calcPersonVotingSuccess([session], person1);

      expect(votingsSuccessRate).toEqual({ successCount: 0, successRate: 0 });

    });

    it('should be 50% if half of votings were successful', () => {

      const faction = createSessionFaction('faction-1', 'Faction 1');
      const party = createSessionParty('party-1', 'Party 1');

      const person1: RegistryPerson = createPerson('person-1', 'Hans Hansen', faction, party);
      const person2: RegistryPerson = createPerson('person-2', 'Jens Jensen', faction, party);
      const person3: RegistryPerson = createPerson('person-3', 'Britt Schmidt', faction, party);

      const sessionPerson1 = createSessionPerson(person1);
      const sessionPerson2 = createSessionPerson(person2);
      const sessionPerson3 = createSessionPerson(person3);

      const voting1 = createVoting(1, [sessionPerson1], [sessionPerson2, sessionPerson3], [], []);
      const voting2 = createVoting(2, [sessionPerson1, sessionPerson2], [sessionPerson3], [], []);
      const session = createSession([voting1, voting2], [faction], [party], [sessionPerson1, sessionPerson2, sessionPerson3]);

      const votingsSuccessRate = calcPersonVotingSuccess([session], person1);

      expect(votingsSuccessRate).toEqual({ successCount: 1, successRate: .5 });

    });

  });


});


function createSessionFaction(id: string, factionName: string): SessionFactionDto {
  return { id, name: factionName };
}


function createSessionParty(id: string, partyName: string): SessionPartyDto {
  return { id, name: partyName };
}


function createPerson(id: string, name: string, faction: SessionFactionDto, party: SessionPartyDto): RegistryPerson {
  return { id, name, factionId: faction.id, partyId: party.id, start: null, end: null };
}


function createSessionPersons(count: number, faction: string, party: string): SessionPersonDto[] {
  return Array.from(
    { length: count },
    (_, index) => createSessionPerson(
      `${faction}-${party}-${index}`,
      faction,
      party
    )
  );
}


function createSessionPerson(person: RegistryPerson): SessionPersonDto;
function createSessionPerson(id: string, faction: string, party: string): SessionPersonDto;
function createSessionPerson(personOrId: RegistryPerson | string, faction?: string, party?: string): SessionPersonDto {

  if (typeof personOrId === 'string' && faction && party) {
    return { id: personOrId, name: `Person ${personOrId}`, party, faction };
  }

  const person = personOrId as RegistryPerson;

  return { id: person.id, name: person.name, party: person.partyId, faction: person.factionId };

}


function createVoting(votingId: number, votingFor: SessionPersonDto[], votingAgainst: SessionPersonDto[],
                      votingAbstained: SessionPersonDto[], didNotVote: SessionPersonDto[]): SessionVotingDto {
  const votesFor: Vote[] = votingFor.map(person => ({
    personId: person.id,
    vote: VoteResult.VOTE_FOR
  }));
  const votesAgainst: Vote[] = votingAgainst.map(person => ({
    personId: person.id,
    vote: VoteResult.VOTE_AGAINST
  }));
  const votesAbstained: Vote[] = votingAbstained.map(person => ({
    personId: person.id,
    vote: VoteResult.VOTE_ABSTENTION
  }));
  const withoutVotes: Vote[] = didNotVote.map(person => ({
    personId: person.id,
    vote: VoteResult.DID_NOT_VOTE
  }));
  const votes = [...votesFor, ...votesAgainst, ...votesAbstained, ...withoutVotes];
  const votingResult = votingFor.length > votingAgainst.length ? VotingResult.PASSED : VotingResult.REJECTED;
  return {
    id: votingId,
    videoTimestamp: 'videoTimestamp',
    votingSubject: {
      agendaItem: 'agendaItem',
      applicationId: 'applicationId',
      title: 'title',
      type: 'type',
      authors: [],
      documents: { paperId: null, applicationUrl: null, },
    },
    votes,
    votingResult
  };
}


function createSession(votings: SessionVotingDto[], factions: SessionFactionDto[], parties: SessionPartyDto[],
                       persons: SessionPersonDto[]): SessionDetailsDto {
  return {
    id: 'id',
    date: 'date',
    meetingMinutesUrl: 'meetingMinutesUrl',
    youtubeUrl: 'youtubeUrl',
    factions,
    parties,
    persons,
    votings,
    speeches: []
  };
}
