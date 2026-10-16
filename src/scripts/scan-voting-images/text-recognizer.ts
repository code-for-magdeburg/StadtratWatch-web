import type { ScanConfigLayout } from './scan-config.ts';
import type { SessionScanVotingSubject } from '@srw-astro/models/session-scan';
import type { Worker } from 'tesseract.js';

export interface ITextRecognizer {
  getVideoTimestamp(filepath: string, layout: ScanConfigLayout): Promise<string>;
  getVotingSubject(filepath: string, layout: ScanConfigLayout): Promise<SessionScanVotingSubject>;
}

export class TextRecognizer implements ITextRecognizer {
  constructor(private readonly worker: Worker) {
  }

  public async getVideoTimestamp(filepath: string, layout: ScanConfigLayout): Promise<string> {
    const { data: { text } } = await this.worker.recognize(
      filepath,
      { rectangle: layout.videoTimestampRectangle },
    );
    const timestamp = text.split('/')[0].trim();

    const timestampParts = timestamp.split(':');
    if (timestampParts[0].length === 1) {
      timestampParts[0] = `0${timestampParts[0]}`;
    }

    if (timestampParts.length === 2) {
      timestampParts.unshift('00');
    }

    return timestampParts.join(':');
  }

  public async getVotingSubject(filepath: string, layout: ScanConfigLayout): Promise<SessionScanVotingSubject> {
    const votingSubjectId = await this.worker.recognize(
      filepath,
      { rectangle: layout.votingSubjectIdRectangle },
    );

    const votingSubjectTitle = await this.worker.recognize(
      filepath,
      { rectangle: layout.votingSubjectTitleRectangle },
    );

    const title = votingSubjectTitle.data.text
      .replaceAll(/(\r\n|\n|\r|\|)/gm, ' ')
      .trim();

    const parts = votingSubjectId.data.text.split('-');
    const agendaItem = parts[0].replaceAll(',', '.').replaceAll(/[^0-9.]/g, '').trim();
    const motionId = parts.length > 1 ? parts[1].replaceAll(/[^0-9/]+$/g, '').trim() : '';

    return {
      agendaItem,
      motionId,
      title,
      type: null,
      authors: [],
    };
  }
}
