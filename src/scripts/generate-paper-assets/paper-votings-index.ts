import { OparlAgendaItem, OparlConsultation, OparlMeeting } from '../shared/model/oparl.ts';
import { Registry } from '@srw-astro/models/registry';
import { SessionScanItem, SessionScanVote } from '@srw-astro/models/session-scan';
import { ParliamentPeriodData } from './session-data-store.ts';
import { PaperVotesByFactionDto, PaperVotingDto } from './model.ts';

/**
 * Builds a reverse index mapping a paper id to the votings related to it.
 *
 * A voting is linked to a paper via the OParl chain
 *   session date -> meeting -> agenda item (by number) -> consultation -> paper
 * mirroring the forward logic in astro `_helpers2.ts` (getPaperId). Votings that cannot be
 * resolved to a paper are skipped, just like in the existing Astro code.
 */
export function buildPaperVotingsIndex(
  councilOrganizationId: string,
  parliamentPeriods: ParliamentPeriodData[],
  meetings: OparlMeeting[],
  agendaItems: OparlAgendaItem[],
  consultations: OparlConsultation[],
): Map<number, PaperVotingDto[]> {
  const councilMeetings = meetings.filter((meeting) => meeting.organization?.includes(councilOrganizationId));

  const index = new Map<number, PaperVotingDto[]>();

  for (const period of parliamentPeriods) {
    for (const session of period.sessions) {
      const meeting = councilMeetings.find(
        (meeting) => meeting.start && meeting.start.slice(0, 10) === session.date,
      );
      if (!meeting) {
        continue;
      }

      for (const voting of session.scan) {
        const paperId = resolvePaperId(voting, meeting, agendaItems, consultations);
        if (paperId === null) {
          continue;
        }

        const dto: PaperVotingDto = {
          parliamentPeriodId: period.registry.id,
          sessionId: session.sessionId,
          votingId: getVotingId(voting),
          date: session.date,
          agendaItem: voting.votingSubject.agendaItem,
          motionId: voting.votingSubject.motionId,
          title: voting.votingSubject.title,
          type: voting.votingSubject.type,
          authors: voting.votingSubject.authors,
          accepted: votingAccepted(voting),
          votesByFactions: getVotesByFactions(voting.votes, period.registry),
        };

        const existing = index.get(paperId);
        if (existing) {
          existing.push(dto);
        } else {
          index.set(paperId, [dto]);
        }
      }
    }
  }

  for (const votings of index.values()) {
    votings.sort((a, b) => (a.date === b.date ? a.votingId - b.votingId : a.date.localeCompare(b.date)));
  }

  return index;
}

function resolvePaperId(
  voting: SessionScanItem,
  meeting: OparlMeeting,
  agendaItems: OparlAgendaItem[],
  consultations: OparlConsultation[],
): number | null {
  const agendaItem = agendaItems.find(
    (agendaItem) =>
      agendaItem.meeting === meeting.id &&
      agendaItem.number &&
      agendaItem.number === voting.votingSubject.agendaItem,
  );
  if (!agendaItem) {
    return null;
  }

  const consultation = consultations.find((consultation) => consultation.id === agendaItem.consultation);
  if (!consultation || !consultation.paper) {
    return null;
  }

  return +consultation.paper.split('/').pop()!;
}

function getVotingId(voting: SessionScanItem): number {
  return +voting.votingFilename.substring(11, 14);
}

function votingAccepted(voting: SessionScanItem): boolean {
  const votedFor = voting.votes.filter((vote) => vote.vote === 'J').length;
  const votedAgainst = voting.votes.filter((vote) => vote.vote === 'N').length;
  return votedFor > votedAgainst;
}

// Mirror of getVotesByFactions in
// astro/src/pages/pp/[parliamentPeriodId]/session/[sessionId]/_votings.astro
function getVotesByFactions(votes: SessionScanVote[], registry: Registry): PaperVotesByFactionDto[] {
  const votesWithFactionId = votes
    .map((vote) => {
      const person = registry.persons.find((p) => p.name === vote.name);
      if (!person) {
        console.warn(`Person ${vote.name} not found in registry ${registry.id}`);
        return null;
      }
      return { personName: person.name, factionId: person.factionId, vote: vote.vote };
    })
    .filter((vote): vote is { personName: string; factionId: string; vote: string } => vote !== null);

  return registry.factions
    .toSorted((a, b) => b.seats - a.seats)
    .map((faction) => {
      const factionVotes = votesWithFactionId
        .filter((v) => v.factionId === faction.id)
        .map((vote) => ({ ...vote, orderIndex: voteOrderIndex(vote.vote) }))
        .toSorted((a, b) => a.orderIndex - b.orderIndex)
        .map((vote) => ({ personName: vote.personName, vote: vote.vote }));
      return {
        factionId: faction.id,
        factionName: faction.name,
        votes: factionVotes,
      };
    });
}

function voteOrderIndex(vote: string): number {
  switch (vote) {
    case 'J':
      return 1;
    case 'N':
      return 2;
    case 'E':
      return 3;
    default:
      return 4;
  }
}
