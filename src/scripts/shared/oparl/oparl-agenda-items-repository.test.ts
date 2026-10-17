import { describe, expect, it } from 'bun:test';
import type { OparlAgendaItem } from '@srw-astro/models/oparl';
import {
  OparlAgendaItemsInMemoryRepository,
  type OparlAgendaItemsRepository,
} from './oparl-agenda-items-repository.ts';

describe('OparlAgendaItemsInMemoryRepository', () => {
  const mockAgendaItems: OparlAgendaItem[] = [
    {
      id: 'https://example.org/oparl/v1.1/agenda-items/1',
      type: 'https://schema.oparl.org/1.1/AgendaItem',
      name: 'First agenda item',
      order: 1,
      meeting: 'https://example.org/oparl/v1.1/meetings/1',
      number: '1.1',
      public: true,
      consultation: 'https://example.org/oparl/v1.1/consultations/1',
      result: 'Approved',
    },
    {
      id: 'https://example.org/oparl/v1.1/agenda-items/2',
      type: 'https://schema.oparl.org/1.1/AgendaItem',
      name: 'Second agenda item',
      order: 2,
      meeting: 'https://example.org/oparl/v1.1/meetings/1',
      number: '1.2',
      public: false,
    },
    {
      id: 'https://example.org/oparl/v1.1/agenda-items/3',
      type: 'https://schema.oparl.org/1.1/AgendaItem',
      name: 'Third agenda item',
      order: 3,
      meeting: 'https://example.org/oparl/v1.1/meetings/2',
      number: '2.1',
      public: true,
      result: 'Rejected',
    },
  ];

  it('should implement OparlAgendaItemsRepository interface', () => {
    const repository: OparlAgendaItemsRepository = new OparlAgendaItemsInMemoryRepository(
      mockAgendaItems,
    );
    expect(typeof repository.getAgendaItemById).toEqual('function');
  });

  describe('getAgendaItemById', () => {
    const repository = new OparlAgendaItemsInMemoryRepository(mockAgendaItems);

    it('should return agenda item when ID exists', () => {
      const result = repository.getAgendaItemById('https://example.org/oparl/v1.1/agenda-items/1');
      expect(result).toEqual(mockAgendaItems[0]);
    });

    it('should return correct agenda item for each ID', () => {
      const result1 = repository.getAgendaItemById('https://example.org/oparl/v1.1/agenda-items/1');
      const result2 = repository.getAgendaItemById('https://example.org/oparl/v1.1/agenda-items/2');
      const result3 = repository.getAgendaItemById('https://example.org/oparl/v1.1/agenda-items/3');

      expect(result1?.name).toEqual('First agenda item');
      expect(result2?.name).toEqual('Second agenda item');
      expect(result3?.name).toEqual('Third agenda item');
    });

    it('should return null when ID does not exist', () => {
      const result = repository.getAgendaItemById('https://example.org/oparl/v1.1/agenda-items/999');
      expect(result).toEqual(null);
    });

    it('should return null for empty string ID', () => {
      const result = repository.getAgendaItemById('');
      expect(result).toEqual(null);
    });

    it('should return null for malformed ID', () => {
      const result = repository.getAgendaItemById('not-a-valid-url');
      expect(result).toEqual(null);
    });

    it('should handle agenda items with optional fields', () => {
      const result = repository.getAgendaItemById('https://example.org/oparl/v1.1/agenda-items/2');
      expect(result?.consultation).toEqual(undefined);
      expect(result?.result).toEqual(undefined);
    });

    it('should handle agenda items with all fields', () => {
      const result = repository.getAgendaItemById('https://example.org/oparl/v1.1/agenda-items/1');
      expect(result?.meeting).toEqual('https://example.org/oparl/v1.1/meetings/1');
      expect(result?.number).toEqual('1.1');
      expect(result?.public).toEqual(true);
      expect(result?.consultation).toEqual('https://example.org/oparl/v1.1/consultations/1');
      expect(result?.result).toEqual('Approved');
    });
  });

  it('should work with empty array', () => {
    const repository = new OparlAgendaItemsInMemoryRepository([]);
    const result = repository.getAgendaItemById('https://example.org/oparl/v1.1/agenda-items/1');
    expect(result).toEqual(null);
  });

  it('should work with single item array', () => {
    const repository = new OparlAgendaItemsInMemoryRepository([mockAgendaItems[0]]);
    const result1 = repository.getAgendaItemById('https://example.org/oparl/v1.1/agenda-items/1');
    const result2 = repository.getAgendaItemById('https://example.org/oparl/v1.1/agenda-items/2');

    expect(result1).toEqual(mockAgendaItems[0]);
    expect(result2).toEqual(null);
  });

  it('should handle duplicate IDs (returns first match)', () => {
    const duplicateItems: OparlAgendaItem[] = [
      {
        id: 'https://example.org/oparl/v1.1/agenda-items/1',
        type: 'https://schema.oparl.org/1.1/AgendaItem',
        name: 'First occurrence',
        order: 1,
      },
      {
        id: 'https://example.org/oparl/v1.1/agenda-items/1',
        type: 'https://schema.oparl.org/1.1/AgendaItem',
        name: 'Second occurrence',
        order: 2,
      },
    ];
    const repository = new OparlAgendaItemsInMemoryRepository(duplicateItems);
    const result = repository.getAgendaItemById('https://example.org/oparl/v1.1/agenda-items/1');

    expect(result?.name).toEqual('First occurrence');
  });

  it('should be case-sensitive for IDs', () => {
    const repository = new OparlAgendaItemsInMemoryRepository(mockAgendaItems);
    const result1 = repository.getAgendaItemById('https://example.org/oparl/v1.1/agenda-items/1');
    const result2 = repository.getAgendaItemById('https://EXAMPLE.ORG/oparl/v1.1/agenda-items/1');

    expect(result1).toEqual(mockAgendaItems[0]);
    expect(result2).toEqual(null);
  });

  describe('getAgendaItemsByMeeting', () => {
    const repository = new OparlAgendaItemsInMemoryRepository(mockAgendaItems);

    it('should return all agenda items of a meeting', () => {
      const result = repository.getAgendaItemsByMeeting('https://example.org/oparl/v1.1/meetings/1');
      expect(result.map((a) => a.id)).toEqual([
        'https://example.org/oparl/v1.1/agenda-items/1',
        'https://example.org/oparl/v1.1/agenda-items/2',
      ]);
    });

    it('should return single agenda item for a meeting with one item', () => {
      const result = repository.getAgendaItemsByMeeting('https://example.org/oparl/v1.1/meetings/2');
      expect(result.map((a) => a.id)).toEqual(['https://example.org/oparl/v1.1/agenda-items/3']);
    });

    it('should return empty array for unknown meeting', () => {
      const result = repository.getAgendaItemsByMeeting('https://example.org/oparl/v1.1/meetings/999');
      expect(result).toEqual([]);
    });
  });
});
