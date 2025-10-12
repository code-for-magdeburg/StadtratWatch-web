import type { SessionScanItem } from '@models/session-scan';
import type {
  OparlAgendaItem,
  OparlConsultation,
  OparlMeeting
} from '@models/oparl';

export function getPaperId(sessionDate: string, voting: SessionScanItem,
                           meetings: OparlMeeting[],
                           agendaItems: OparlAgendaItem[],
                           consultations: OparlConsultation[]): number | null {

  const meeting = meetings.find(
    meeting => meeting.start && meeting.start.slice(0, 10) === sessionDate
  );
  if (!meeting) {
    console.warn('No OParl meeting found for session', sessionDate);
  }

  const agendaItem = agendaItems.find(
    agendaItem =>
      agendaItem.meeting
      && agendaItem.meeting === meeting?.id
      && agendaItem.number
      && agendaItem.number === voting.votingSubject.agendaItem
  );
  if (!agendaItem) {
    console.warn(
      'No OParl agenda item found for voting',
      sessionDate,
      voting.votingSubject.agendaItem
    );

    return null;
  }

  const consultation = consultations.find(
    consultation => consultation.id === agendaItem.consultation
  );
  if (!consultation) {
    console.warn(
      'No OParl consultation found for agenda item',
      agendaItem.id
    );

    return null;
  }

  if (!consultation.paper) {
    console.warn('No paper found for consultation', consultation.id);
    return null;
  }

  return +consultation.paper.split('/').pop()!

}
