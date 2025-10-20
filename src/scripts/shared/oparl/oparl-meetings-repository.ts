import { OparlMeeting } from '../model/oparl.ts';

export interface OparlMeetingsRepository {
  getMeetingsByOrganization(organizationId: string): OparlMeeting[];
}

export class OparlMeetingsInMemoryRepository implements OparlMeetingsRepository {
  constructor(private readonly meetings: OparlMeeting[]) {
  }

  public getMeetingsByOrganization(organizationId: string): OparlMeeting[] {
    return this.meetings.filter((meeting) => (meeting.organization || []).includes(organizationId));
  }
}
