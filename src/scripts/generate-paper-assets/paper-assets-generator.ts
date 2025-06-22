import { ScrapedSession } from '../shared/model/scraped-session.ts';
import { IPaperAssetsStore } from './paper-assets-store.ts';
import { IPaperFilesStore } from './paper-files-store.ts';
import { PaperFileDto, PapersDto } from '@srw-astro/models';


export class PaperAssetsGenerator {


  constructor(private readonly paperFilesStore: IPaperFilesStore, private readonly assetsStore: IPaperAssetsStore) {
  }


  public generatePaperAssets(scrapedSession: ScrapedSession) {

    const papers: PapersDto = [];

    scrapedSession.meetings
      .filter(meeting => !meeting.cancelled)
      .filter(meeting => !!meeting.original_id)
      .filter(meeting => meeting.organization_name === 'Stadtrat')
      // .filter(meeting => meeting.start >= '2019')
      .forEach(meeting => {

        scrapedSession.agenda_items
          .filter(agendaItem => agendaItem.meeting_id === meeting.original_id)
          .filter(agendaItem => !!agendaItem.paper_original_id)
          .filter(
            agendaItem => !papers.some(paper => paper.id === agendaItem.paper_original_id!)
          )
          .forEach(agendaItem => {

            const paperId = agendaItem.paper_original_id!;
            const files = scrapedSession.files
              .filter(file => file.paper_original_id === paperId)
              .map<PaperFileDto>(file => ({
                id: file.original_id,
                name: file.name,
                url: file.url,
                size: this.paperFilesStore.getFileSize(meeting, file),
              }));
            const paper = scrapedSession.papers.find(p => p.original_id === paperId);
            papers.push({
              id: paperId,
              reference: agendaItem.paper_reference,
              type: paper ? paper.paper_type : null,
              title: paper ? paper.name : '',
              files
            });

          });

      });

    this.assetsStore.writePaperAssets(papers);

  }


}
