import { OparlAgendaItem } from '@srw-astro/models/oparl';

export interface OparlAgendaItemsRepository {
  getAgendaItemById(agendaItemId: string): OparlAgendaItem | null;
}

export class OparlAgendaItemsInMemoryRepository implements OparlAgendaItemsRepository {
  constructor(private readonly agendaItems: OparlAgendaItem[]) {
  }

  public getAgendaItemById(agendaItemId: string): OparlAgendaItem | null {
    return this.agendaItems.find((a) => a.id === agendaItemId) || null;
  }
}
