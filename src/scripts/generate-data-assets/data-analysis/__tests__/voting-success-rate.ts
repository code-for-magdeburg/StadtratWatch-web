import {
  calcFactionVotingSuccessRate,
  calcPartyVotingSuccessRate,
  calcPersonVotingSuccess
} from '../voting-success-rate';
import {
  SessionDetailsDto, SessionFractionDto, SessionPartyDto,
  SessionPersonDto,
  SessionVotingDto,
  Vote,
  VoteResult,
  VotingResult
} from '../../../../app/model/Session';
import { RegistryPerson } from '../../../shared/model/registry';


describe('Calculating voting success rate', () => {


  describe('of a fraction', () => {

    it('should return 0 if there are no votings', () => {
      const fraction = createSessionFraction('fraction-1', 'Fraction 1');
      const party = createSessionParty('party-1', 'Party 1');
      const persons = createSessionPersons(1, fraction.name, party.name);
      const session = createSession([], [fraction], [party], persons);
      const votingsSuccessRate = calcFactionVotingSuccessRate(fraction.id, [session]);
      expect(votingsSuccessRate).toBe(0);
    });

    it('should be 100% if fraction voted for passed voting', () => {

      const fraction1 = createSessionFraction('fraction-1', 'Fraction 1');
      const fraction2 = createSessionFraction('fraction-2', 'Fraction 2');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');

      const personsFraction1 = createSessionPersons(2, fraction1.name, party1.name);
      const personsFraction2 = createSessionPersons(1, fraction2.name, party2.name);

      const passedVoting = createVoting(1, personsFraction1, personsFraction2, [], []);
      const session = createSession([passedVoting], [fraction1, fraction2], [party1, party2], [...personsFraction1, ...personsFraction2]);

      const votingsSuccessRate = calcFactionVotingSuccessRate(fraction1.id, [session]);

      expect(votingsSuccessRate).toBe(1);

    });

    it('should be 100% if fraction voted against rejected voting', () => {

      const fraction1 = createSessionFraction('fraction-1', 'Fraction 1');
      const fraction2 = createSessionFraction('fraction-2', 'Fraction 2');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');

      const personsFraction1 = createSessionPersons(2, fraction1.name, party1.name);
      const personsFraction2 = createSessionPersons(1, fraction2.name, party2.name);

      const rejectedVoting = createVoting(1, personsFraction2, personsFraction1, [], []);
      const session = createSession([rejectedVoting], [fraction1, fraction2], [party1, party2], [...personsFraction1, ...personsFraction2]);

      const votingsSuccessRate = calcFactionVotingSuccessRate(fraction1.id, [session]);

      expect(votingsSuccessRate).toBe(1);

    });

    it('should be 0% if fraction voted against passed voting', () => {

      const fraction1 = createSessionFraction('fraction-1', 'Fraction 1');
      const fraction2 = createSessionFraction('fraction-2', 'Fraction 2');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');

      const personsFraction1 = createSessionPersons(2, fraction1.name, party1.name);
      const personsFraction2 = createSessionPersons(3, fraction2.name, party2.name);

      const passedVoting = createVoting(1, personsFraction2, personsFraction1, [], []);
      const session = createSession([passedVoting], [fraction1, fraction2], [party1, party2], [...personsFraction1, ...personsFraction2]);

      const votingsSuccessRate = calcFactionVotingSuccessRate(fraction1.id, [session]);

      expect(votingsSuccessRate).toBe(0);

    });

    it('should be 0% if fraction voted for rejected voting', () => {

      const fraction1 = createSessionFraction('fraction-1', 'Fraction 1');
      const fraction2 = createSessionFraction('fraction-2', 'Fraction 2');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');

      const personsFraction1 = createSessionPersons(2, fraction1.name, party1.name);
      const personsFraction2 = createSessionPersons(3, fraction2.name, party2.name);

      const rejectedVoting = createVoting(1, personsFraction1, personsFraction2, [], []);
      const session = createSession([rejectedVoting], [fraction1, fraction2], [party1, party2], [...personsFraction1, ...personsFraction2]);

      const votingsSuccessRate = calcFactionVotingSuccessRate(fraction1.id, [session]);

      expect(votingsSuccessRate).toBe(0);

    });

    it('should be 50% if fraction half of votings were successful', () => {

      const fraction1 = createSessionFraction('fraction-1', 'Fraction 1');
      const fraction2 = createSessionFraction('fraction-2', 'Fraction 2');
      const fraction3 = createSessionFraction('fraction-3', 'Fraction 3');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');
      const party3 = createSessionParty('party-3', 'Party 3');

      const personsFraction1 = createSessionPersons(1, fraction1.name, party1.name);
      const personsFraction2 = createSessionPersons(2, fraction2.name, party2.name);
      const personsFraction3 = createSessionPersons(3, fraction3.name, party3.name);

      const voting1 = createVoting(1, personsFraction2, personsFraction1, personsFraction3, []);
      const voting2 = createVoting(2, personsFraction2, personsFraction3, personsFraction1, []);
      const session = createSession([voting1, voting2], [fraction1, fraction2, fraction3], [party1, party2, party3], [...personsFraction1, ...personsFraction2, ...personsFraction3]);

      const votingsSuccessRate = calcFactionVotingSuccessRate(fraction2.id, [session]);

      expect(votingsSuccessRate).toBe(.5);

    });

  });


  describe('of a party', () => {

    it('should return 0 if there are no votings', () => {
      const fraction = createSessionFraction('fraction-1', 'Fraction 1');
      const party = createSessionParty('party-1', 'Party 1');
      const persons = createSessionPersons(1, fraction.name, party.name);
      const session = createSession([], [fraction], [party], persons);
      const votingsSuccessRate = calcPartyVotingSuccessRate(party.id, [session])
      expect(votingsSuccessRate).toBe(0);
    });

    it('should be 100% if party voted for passed voting', () => {

      const fraction = createSessionFraction('fraction-1', 'Fraction 1');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');

      const personsParty1 = createSessionPersons(2, fraction.name, party1.name);
      const personsParty2 = createSessionPersons(1, fraction.name, party2.name);

      const passedVoting = createVoting(1, personsParty1, personsParty2, [], []);
      const session = createSession([passedVoting], [fraction], [party1, party2], [...personsParty1, ...personsParty2]);

      const votingsSuccessRate = calcPartyVotingSuccessRate(party1.id, [session]);

      expect(votingsSuccessRate).toBe(1);

    });

    it('should be 100% if party voted against rejected voting', () => {

      const fraction = createSessionFraction('fraction-1', 'Fraction 1');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');

      const personsParty1 = createSessionPersons(2, fraction.name, party1.name);
      const personsParty2 = createSessionPersons(1, fraction.name, party2.name);

      const rejectedVoting = createVoting(1, personsParty2, personsParty1, [], []);
      const session = createSession([rejectedVoting], [fraction], [party1, party2], [...personsParty1, ...personsParty2]);

      const votingsSuccessRate = calcPartyVotingSuccessRate(party1.id, [session]);

      expect(votingsSuccessRate).toBe(1);

    });

    it('should be 0% if party voted against passed voting', () => {

      const fraction = createSessionFraction('fraction-1', 'Fraction 1');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');

      const personsParty1 = createSessionPersons(2, fraction.name, party1.name);
      const personsParty2 = createSessionPersons(3, fraction.name, party2.name);

      const passedVoting = createVoting(1, personsParty2, personsParty1, [], []);
      const session = createSession([passedVoting], [fraction], [party1, party2], [...personsParty1, ...personsParty2]);

      const votingsSuccessRate = calcPartyVotingSuccessRate(party1.id, [session]);

      expect(votingsSuccessRate).toBe(0);

    });

    it('should be 0% if party voted for rejected voting', () => {

      const fraction = createSessionFraction('fraction-1', 'Fraction 1');
      const minorityParty = createSessionParty('minority', 'Minority');
      const majorityParty = createSessionParty('majority', 'Majority');

      const personsMinorityParty = createSessionPersons(2, fraction.name, minorityParty.name);
      const personsMajorityParty = createSessionPersons(3, fraction.name, majorityParty.name);

      const rejectedVoting = createVoting(1, personsMinorityParty, personsMajorityParty, [], []);
      const session = createSession([rejectedVoting], [fraction], [minorityParty, majorityParty], [...personsMinorityParty, ...personsMajorityParty]);

      const votingsSuccessRate = calcPartyVotingSuccessRate(minorityParty.id, [session]);

      expect(votingsSuccessRate).toBe(0);

    });

    it('should be 50% if half of votings were successful', () => {

      const fraction = createSessionFraction('fraction-1', 'Fraction 1');
      const party1 = createSessionParty('party-1', 'Party 1');
      const party2 = createSessionParty('party-2', 'Party 2');
      const party3 = createSessionParty('party-3', 'Party 3');

      const personsParty1 = createSessionPersons(1, fraction.name, party1.name);
      const personsParty2 = createSessionPersons(2, fraction.name, party2.name);
      const personsParty3 = createSessionPersons(3, fraction.name, party3.name);

      const voting1 = createVoting(1, personsParty2, personsParty1, personsParty3, []);
      const voting2 = createVoting(2, personsParty2, personsParty3, personsParty1, []);
      const session = createSession([voting1, voting2], [fraction], [party1, party2, party3], [...personsParty1, ...personsParty2, ...personsParty3]);

      const votingsSuccessRate = calcPartyVotingSuccessRate(party2.id, [session]);

      expect(votingsSuccessRate).toBe(.5);

    });

  });


  describe('of a person', () => {

    it('should return null if there are no votings', () => {
      const fraction = createSessionFraction('fraction-1', 'Fraction 1');
      const party = createSessionParty('party-1', 'Party 1');
      const person: RegistryPerson = createPerson('person-1', 'Hans Hansen', fraction, party);
      const sessionPerson = createSessionPerson(person);
      const session = createSession([], [fraction], [party], [sessionPerson]);
      const votingsSuccessRate = calcPersonVotingSuccess([session], person);
      expect(votingsSuccessRate).toEqual({ successCount: 0, successRate: 0 });
    });

    it('should be 100% if person voted for passed voting', () => {

      const fraction = createSessionFraction('fraction-1', 'Fraction 1');
      const party = createSessionParty('party-1', 'Party 1');

      const person1: RegistryPerson = createPerson('person-1', 'Hans Hansen', fraction, party);
      const person2: RegistryPerson = createPerson('person-2', 'Jens Jensen', fraction, party);

      const sessionPerson1 = createSessionPerson(person1);
      const sessionPerson2 = createSessionPerson(person2);

      const passedVoting = createVoting(1, [sessionPerson1, sessionPerson2], [], [], []);
      const session = createSession([passedVoting], [fraction], [party], [sessionPerson1, sessionPerson2]);

      const votingsSuccessRate = calcPersonVotingSuccess([session], person1);

      expect(votingsSuccessRate).toEqual({ successCount: 1, successRate: 1 });

    });

    it('should be 100% if person voted against rejected voting', () => {

      const fraction = createSessionFraction('fraction-1', 'Fraction 1');
      const party = createSessionParty('party-1', 'Party 1');

      const person1: RegistryPerson = createPerson('person-1', 'Hans Hansen', fraction, party);
      const person2: RegistryPerson = createPerson('person-2', 'Jens Jensen', fraction, party);

      const sessionPerson1 = createSessionPerson(person1);
      const sessionPerson2 = createSessionPerson(person2);

      const rejectedVoting = createVoting(1, [], [sessionPerson1, sessionPerson2], [], []);
      const session = createSession([rejectedVoting], [fraction], [party], [sessionPerson1, sessionPerson2]);

      const votingsSuccessRate = calcPersonVotingSuccess([session], person1);

      expect(votingsSuccessRate).toEqual({ successCount: 1, successRate: 1 });

    });

    it('should be 0% if person voted against passed voting', () => {

      const fraction = createSessionFraction('fraction-1', 'Fraction 1');
      const party = createSessionParty('party-1', 'Party 1');

      const person1: RegistryPerson = createPerson('person-1', 'Hans Hansen', fraction, party);
      const person2: RegistryPerson = createPerson('person-2', 'Jens Jensen', fraction, party);
      const person3: RegistryPerson = createPerson('person-3', 'Britt Schmidt', fraction, party);

      const sessionPerson1 = createSessionPerson(person1);
      const sessionPerson2 = createSessionPerson(person2);
      const sessionPerson3 = createSessionPerson(person3);

      const passedVoting = createVoting(1, [sessionPerson2, sessionPerson3], [sessionPerson1], [], []);
      const session = createSession([passedVoting], [fraction], [party], [sessionPerson1, sessionPerson2, sessionPerson3]);

      const votingsSuccessRate = calcPersonVotingSuccess([session], person1);

      expect(votingsSuccessRate).toEqual({ successCount: 0, successRate: 0 });

    });

    it('should be 0% if person voted for rejected voting', () => {

      const fraction = createSessionFraction('fraction-1', 'Fraction 1');
      const party = createSessionParty('party-1', 'Party 1');

      const person1: RegistryPerson = createPerson('person-1', 'Hans Hansen', fraction, party);
      const person2: RegistryPerson = createPerson('person-2', 'Jens Jensen', fraction, party);
      const person3: RegistryPerson = createPerson('person-3', 'Britt Schmidt', fraction, party);

      const sessionPerson1 = createSessionPerson(person1);
      const sessionPerson2 = createSessionPerson(person2);
      const sessionPerson3 = createSessionPerson(person3);

      const rejectedVoting = createVoting(1, [sessionPerson1], [sessionPerson2, sessionPerson3], [], []);
      const session = createSession([rejectedVoting], [fraction], [party], [sessionPerson1, sessionPerson2, sessionPerson3]);

      const votingsSuccessRate = calcPersonVotingSuccess([session], person1);

      expect(votingsSuccessRate).toEqual({ successCount: 0, successRate: 0 });

    });

    it('should be 50% if half of votings were successful', () => {

      const fraction = createSessionFraction('fraction-1', 'Fraction 1');
      const party = createSessionParty('party-1', 'Party 1');

      const person1: RegistryPerson = createPerson('person-1', 'Hans Hansen', fraction, party);
      const person2: RegistryPerson = createPerson('person-2', 'Jens Jensen', fraction, party);
      const person3: RegistryPerson = createPerson('person-3', 'Britt Schmidt', fraction, party);

      const sessionPerson1 = createSessionPerson(person1);
      const sessionPerson2 = createSessionPerson(person2);
      const sessionPerson3 = createSessionPerson(person3);

      const voting1 = createVoting(1, [sessionPerson1], [sessionPerson2, sessionPerson3], [], []);
      const voting2 = createVoting(2, [sessionPerson1, sessionPerson2], [sessionPerson3], [], []);
      const session = createSession([voting1, voting2], [fraction], [party], [sessionPerson1, sessionPerson2, sessionPerson3]);

      const votingsSuccessRate = calcPersonVotingSuccess([session], person1);

      expect(votingsSuccessRate).toEqual({ successCount: 1, successRate: .5 });

    });

  });


});


function createSessionFraction(id: string, fractionName: string): SessionFractionDto {
  return { id, name: fractionName };
}


function createSessionParty(id: string, partyName: string): SessionPartyDto {
  return { id, name: partyName };
}


function createPerson(id: string, name: string, fraction: SessionFractionDto, party: SessionPartyDto): RegistryPerson {
  return { id, name, fractionId: fraction.id, partyId: party.id, start: null, end: null };
}


function createSessionPersons(count: number, fraction: string, party: string): SessionPersonDto[] {
  return Array.from(
    { length: count },
    (_, index) => createSessionPerson(
      `${fraction}-${party}-${index}`,
      fraction,
      party
    )
  );
}


function createSessionPerson(person: RegistryPerson): SessionPersonDto;
function createSessionPerson(id: string, fraction: string, party: string): SessionPersonDto;
function createSessionPerson(personOrId: RegistryPerson | string, fraction?: string, party?: string): SessionPersonDto {

  if (typeof personOrId === 'string' && fraction && party) {
    return { id: personOrId, name: `Person ${personOrId}`, party, fraction };
  }

  const person = personOrId as RegistryPerson;

  return { id: person.id, name: person.name, party: person.partyId, fraction: person.fractionId };

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
      documents: { applicationUrl: null, },
    },
    votes,
    votingResult
  };
}


function createSession(votings: SessionVotingDto[], fractions: SessionFractionDto[], parties: SessionPartyDto[],
                       persons: SessionPersonDto[]): SessionDetailsDto {
  return {
    id: 'id',
    date: 'date',
    meetingMinutesUrl: 'meetingMinutesUrl',
    youtubeUrl: 'youtubeUrl',
    fractions,
    parties,
    persons,
    votings,
    speakingTimes: []
  };
}
