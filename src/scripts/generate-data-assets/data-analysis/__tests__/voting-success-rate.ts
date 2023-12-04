import { calcVotingsSuccessRate } from '../../generate-fraction-files';
import {
  SessionDetailsDto, SessionFractionDto,
  SessionPersonDto,
  SessionVotingDto,
  Vote,
  VoteResult,
  VotingResult
} from '../../../../app/model/Session';


describe('Calculating voting success rate', () => {

  describe('of a fraction', () => {

    it('should return 0 if there are no votings', () => {
      const [fractionOfOne] = createFractionPersons([1]);
      const votingsSuccessRate = calcVotingsSuccessRate(fractionOfOne[0].fraction, [])
      expect(votingsSuccessRate).toBe(0);
    });

    it('should be 100% if fraction voted for passed voting', () => {

      const fraction1 = createSessionFraction('fraction-1', 'Fraction 1');
      const fraction2 = createSessionFraction('fraction-2', 'Fraction 2');

      const personsFraction1 = createSessionPersons(2, fraction1.name, 'party1');
      const personsFraction2 = createSessionPersons(1, fraction2.name, 'party2');

      const passedVoting = createVoting(1, personsFraction1, personsFraction2, [], []);
      const session = createSession([passedVoting], [fraction1, fraction2], [...personsFraction1, ...personsFraction2]);

      const votingsSuccessRate = calcVotingsSuccessRate(fraction1.id, [session]);

      expect(votingsSuccessRate).toBe(1);

    });

    it('should be 100% if fraction voted against rejected voting', () => {

      const fraction1 = createSessionFraction('fraction-1', 'Fraction 1');
      const fraction2 = createSessionFraction('fraction-2', 'Fraction 2');

      const personsFraction1 = createSessionPersons(2, fraction1.name, 'party1');
      const personsFraction2 = createSessionPersons(1, fraction2.name, 'party2');

      const rejectedVoting = createVoting(1, personsFraction2, personsFraction1, [], []);
      const session = createSession([rejectedVoting], [fraction1, fraction2], [...personsFraction1, ...personsFraction2]);

      const votingsSuccessRate = calcVotingsSuccessRate(fraction1.id, [session]);

      expect(votingsSuccessRate).toBe(1);

    });

    it('should be 0% if fraction voted against passed voting', () => {

      const fraction1 = createSessionFraction('fraction-1', 'Fraction 1');
      const fraction2 = createSessionFraction('fraction-2', 'Fraction 2');

      const personsFraction1 = createSessionPersons(2, fraction1.name, 'party1');
      const personsFraction2 = createSessionPersons(3, fraction2.name, 'party2');

      const passedVoting = createVoting(1, personsFraction2, personsFraction1, [], []);
      const session = createSession([passedVoting], [fraction1, fraction2], [...personsFraction1, ...personsFraction2]);

      const votingsSuccessRate = calcVotingsSuccessRate(fraction1.id, [session]);

      expect(votingsSuccessRate).toBe(0);

    });

    it('should be 0% if fraction voted for rejected voting', () => {

      const fraction1 = createSessionFraction('fraction-1', 'Fraction 1');
      const fraction2 = createSessionFraction('fraction-2', 'Fraction 2');

      const personsFraction1 = createSessionPersons(2, fraction1.name, 'party1');
      const personsFraction2 = createSessionPersons(3, fraction2.name, 'party2');

      const rejectedVoting = createVoting(1, personsFraction1, personsFraction2, [], []);
      const session = createSession([rejectedVoting], [fraction1, fraction2], [...personsFraction1, ...personsFraction2]);

      const votingsSuccessRate = calcVotingsSuccessRate(fraction1.id, [session]);

      expect(votingsSuccessRate).toBe(0);

    });

    it('should be 50% if fraction half of votings were successful', () => {

      const fraction1 = createSessionFraction('fraction-1', 'Fraction 1');
      const fraction2 = createSessionFraction('fraction-2', 'Fraction 2');
      const fraction3 = createSessionFraction('fraction-3', 'Fraction 3');

      const personsFraction1 = createSessionPersons(1, fraction1.name, 'party1');
      const personsFraction2 = createSessionPersons(2, fraction2.name, 'party2');
      const personsFraction3 = createSessionPersons(3, fraction3.name, 'party3');

      const voting1 = createVoting(1, personsFraction2, personsFraction1, personsFraction3, []);
      const voting2 = createVoting(2, personsFraction2, personsFraction3, personsFraction1, []);
      const session = createSession([voting1, voting2], [fraction1, fraction2, fraction3], [...personsFraction1, ...personsFraction2, ...personsFraction3]);

      const votingsSuccessRate = calcVotingsSuccessRate(fraction2.id, [session]);

      expect(votingsSuccessRate).toBe(.5);

    });

  });

});


function createSessionFraction(id: string, fractionName: string): SessionFractionDto {
  return { id, name: fractionName };
}


function createSessionPersons(count: number, fraction: string, party: string): SessionPersonDto[] {
  return Array.from(
    { length: count },
    (_, index) => createPerson(
      `${fraction}-${index}`,
      fraction,
      party
    )
  );
}


function createFractionPersons(counts: number[]): SessionPersonDto[][] {
  let personId = 1;
  return counts.map((memberCount, fractionIndex) => Array.from(
      { length: memberCount },
      () => createPerson(
        `${personId++}`,
        `fraction${fractionIndex + 1}`,
        `party${fractionIndex + 1}`
      )
    )
  );
}


function createPerson(id: string, fraction: string, party: string): SessionPersonDto {
  return { id, name: 'Person ' + id, party, fraction };
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


function createSession(votings: SessionVotingDto[], fractions: SessionFractionDto[], persons: SessionPersonDto[]): SessionDetailsDto {
  return {
    id: 'id',
    date: 'date',
    meetingMinutesUrl: 'meetingMinutesUrl',
    youtubeUrl: 'youtubeUrl',
    fractions,
    parties: [],
    persons,
    votings,
  };
}
