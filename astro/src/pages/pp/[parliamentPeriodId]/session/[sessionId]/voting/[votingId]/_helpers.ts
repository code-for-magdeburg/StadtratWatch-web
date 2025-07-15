import type {
  ScrapedAgendaItem,
  ScrapedMeeting,
  ScrapedPaper,
} from '@models/scraped-session.ts';
import type { SessionScanItem } from '@models/session-scan.ts';

export function getPaperId(
  sessionId: string,
  sessionDate: string,
  voting: SessionScanItem,
  scrapedMeetings: ScrapedMeeting[],
  scrapedAgendaItems: ScrapedAgendaItem[],
  scrapedPapers: ScrapedPaper[],
): number | null {
  const scrapedStadtratMeetings = scrapedMeetings
    .filter((meeting) => meeting.organization_name === 'Stadtrat')
    .map<{ date: string | null; original_id: number | null }>((meeting) => ({
      date: meeting.start ? meeting.start.slice(0, 10) : null,
      original_id: meeting.original_id,
    }));
  const scrapedMeeting = scrapedStadtratMeetings.find(
    (meeting) => meeting.date === sessionDate,
  );

  const agendaItem = scrapedAgendaItems.find(
    (agendaItem) =>
      scrapedMeeting?.original_id &&
      agendaItem.key === `Ö ${voting.votingSubject.agendaItem}` &&
      agendaItem.meeting_id === scrapedMeeting.original_id,
  );
  if (!agendaItem) {
    console.warn(
      'No scraped agenda item found for voting',
      sessionId,
      voting.votingSubject.agendaItem,
    );
  }

  const scrapedPaperOriginalId = agendaItem?.paper_original_id;
  if (!scrapedPaperOriginalId) {
    console.warn(
      'No scraped paper original id found for voting',
      sessionId,
      voting.votingSubject.agendaItem,
    );
  }
  const paper =
    scrapedPapers.find(
      (paper) => paper.original_id === scrapedPaperOriginalId,
    ) || null;

  return paper?.original_id || null;
}
