import type { OparlMeeting } from '@srw-astro/models/oparl';

import type { OparlFilesRepository } from '../shared/oparl/oparl-files-repository.ts';
import type { OparlMeetingsRepository } from '../shared/oparl/oparl-meetings-repository.ts';
import type { IPaperFilesDownloader } from './paper-files-downloader.ts';

export class PaperFilesCollector {
  constructor(
    private readonly meetingsRepository: OparlMeetingsRepository,
    private readonly filesRepository: OparlFilesRepository,
    private readonly downloader: IPaperFilesDownloader,
    private readonly organizationId: string,
  ) {}

  public async collectFiles(year: string): Promise<void> {
    const meetings = this.meetingsRepository
      .getMeetingsByOrganization(this.organizationId)
      .filter((meeting) => meeting.start && meeting.start.startsWith(year));
    for (const meeting of meetings) {
      await this.processMeeting(meeting);
    }
  }

  private async processMeeting(meeting: OparlMeeting): Promise<void> {
    const files = this.filesRepository.getFilesByMeeting(meeting.id);
    for (const file of files) {
      await this.downloader.downloadFile(file.id);
    }
  }
}
