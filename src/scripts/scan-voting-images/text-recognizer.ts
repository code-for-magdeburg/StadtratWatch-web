import { ScanConfigLayout } from './scan-config.ts';
import { SessionScanVotingSubject } from '@srw-astro/models/session-scan';
import { Worker } from 'npm:tesseract.js';


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
      { rectangle: layout.videoTimestampRectangle }
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
      { rectangle: layout.votingSubjectIdRectangle }
    );

    const votingSubjectTitle = await this.worker.recognize(
      filepath,
      { rectangle: layout.votingSubjectTitleRectangle }
    );

    const title = votingSubjectTitle.data.text
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .trim();

    const parts = votingSubjectId.data.text.split('-');
    const agendaItem = parts[0].replace(/,/g, '.').replace(/[^0-9.]/g, '');
    const applicationId = parts.length > 1 ? parts[1].replace(/[^0-9\/]+$/g, '') : '';

    return {
      agendaItem,
      applicationId,
      title,
      type: null,
      authors: []
    };

  }


}
