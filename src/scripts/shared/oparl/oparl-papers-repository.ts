import { OparlPaper } from '../model/oparl.ts';

export interface OparlPapersRepository {
  getPapersByMeeting(meetingId: string): OparlPaper[];
}

export class OparlPapersInMemoryRepository implements OparlPapersRepository {
  constructor(private readonly papers: OparlPaper[]) {
  }

  public getPapersByMeeting(meetingId: string): OparlPaper[] {
    return this.papers.filter(
      (paper) =>
        (paper.consultation || []).some(
          (consultation) => consultation.meeting === meetingId,
        ),
    );
  }
}
