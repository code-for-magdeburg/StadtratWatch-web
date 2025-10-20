import { OparlPapersRepository } from './oparl-papers-repository.ts';
import { OparlFile } from '../model/oparl.ts';

export interface OparlFilesRepository {
  getFilesByMeeting(meetingId: string): OparlFile[];
}

export class OparlFilesInMemoryRepository implements OparlFilesRepository {
  constructor(private readonly files: OparlFile[], private readonly papersRepository: OparlPapersRepository) {
  }

  public getFilesByMeeting(meetingId: string): OparlFile[] {
    const paperIds = this.papersRepository
      .getPapersByMeeting(meetingId)
      .map((paper) => paper.id);

    return this.files.filter(
      (file) => (file.paper || []).some((paperId) => paperIds.includes(paperId)),
    );
  }
}
