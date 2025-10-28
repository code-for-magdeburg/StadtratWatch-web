import { OparlMeeting } from '../model/oparl.ts';

export interface OparlMeetingsRepository {
  getMeetingById(meetingId: string): OparlMeeting | null;
  getMeetingsByOrganization(organizationId: string): OparlMeeting[];
}

export class OparlMeetingsInMemoryRepository implements OparlMeetingsRepository {
  constructor(private readonly meetings: OparlMeeting[]) {
  }

  public getMeetingById(meetingId: string): OparlMeeting | null {
    return this.meetings.find((meeting) => meeting.id === meetingId) || null;
  }

  public getMeetingsByOrganization(organizationId: string): OparlMeeting[] {
    return this.meetings.filter((meeting) => (meeting.organization || []).includes(organizationId));
  }
}
