import { OparlPaper } from '../model/oparl.ts';

export interface OparlPapersRepository {
  getAllPapers(): OparlPaper[];
  getPapersByMeeting(meetingId: string): OparlPaper[];
}

export class OparlPapersInMemoryRepository implements OparlPapersRepository {
  constructor(private readonly papers: OparlPaper[]) {
  }

  public getAllPapers(): OparlPaper[] {
    return this.papers;
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
