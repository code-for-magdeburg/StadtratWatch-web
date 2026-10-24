import { describe, expect, it } from 'bun:test';

import type { OparlPaper } from '@srw-astro/models/oparl';

import { OparlPapersInMemoryRepository } from './oparl-papers-repository.ts';

describe('OparlPapersInMemoryRepository', () => {
  describe('getAllPapers', () => {
    it('should return all papers', () => {
      const papers: OparlPaper[] = [
        {
          id: 'paper-1',
          type: 'paper',
          name: 'Paper 1',
        },
        {
          id: 'paper-2',
          type: 'paper',
          name: 'Paper 2',
        },
        {
          id: 'paper-3',
          type: 'paper',
          name: 'Paper 3',
        },
      ];

      const repository = new OparlPapersInMemoryRepository(papers);
      const result = repository.getAllPapers();

      expect(result.length).toEqual(3);
      expect(result[0].id).toEqual('paper-1');
      expect(result[1].id).toEqual('paper-2');
      expect(result[2].id).toEqual('paper-3');
    });

    it('should return empty array when no papers exist', () => {
      const repository = new OparlPapersInMemoryRepository([]);
      const result = repository.getAllPapers();

      expect(result.length).toEqual(0);
    });

    it('should preserve all paper properties', () => {
      const papers: OparlPaper[] = [
        {
          id: 'paper-1',
          type: 'paper',
          name: 'Important Paper',
          reference: 'REF-2024-001',
          paperType: 'Antrag',
          deleted: true,
          consultation: [
            {
              id: 'consultation-1',
              type: 'consultation',
              name: 'Consultation 1',
              meeting: 'meeting-1',
            },
          ],
        },
      ];

      const repository = new OparlPapersInMemoryRepository(papers);
      const result = repository.getAllPapers();

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual('paper-1');
      expect(result[0].name).toEqual('Important Paper');
      expect(result[0].reference).toEqual('REF-2024-001');
      expect(result[0].paperType).toEqual('Antrag');
      expect(result[0].deleted).toEqual(true);
      expect(result[0].consultation?.length).toEqual(1);
      expect(result[0].consultation?.[0].id).toEqual('consultation-1');
    });

    it('should return same reference as constructor array', () => {
      const papers: OparlPaper[] = [
        {
          id: 'paper-1',
          type: 'paper',
          name: 'Paper 1',
        },
      ];

      const repository = new OparlPapersInMemoryRepository(papers);
      const result = repository.getAllPapers();

      // Check that it returns the same reference
      expect(result).toBe(papers);
    });

    it('should handle papers with various optional properties', () => {
      const papers: OparlPaper[] = [
        {
          id: 'paper-1',
          type: 'paper',
          name: 'Paper 1',
        },
        {
          id: 'paper-2',
          type: 'paper',
          name: 'Paper 2',
          reference: 'REF-002',
        },
        {
          id: 'paper-3',
          type: 'paper',
          name: 'Paper 3',
          paperType: 'Beschlussvorlage',
        },
        {
          id: 'paper-4',
          type: 'paper',
          name: 'Paper 4',
          consultation: [],
        },
      ];

      const repository = new OparlPapersInMemoryRepository(papers);
      const result = repository.getAllPapers();

      expect(result.length).toEqual(4);
      expect(result[0].reference).toEqual(undefined);
      expect(result[1].reference).toEqual('REF-002');
      expect(result[2].paperType).toEqual('Beschlussvorlage');
      expect(result[3].consultation).toEqual([]);
    });
  });

  describe('getPapersByMeeting', () => {
    it('should return papers matching the meeting ID', () => {
      const papers: OparlPaper[] = [
        {
          id: 'paper-1',
          type: 'paper',
          name: 'Paper 1',
          consultation: [
            {
              id: 'consultation-1',
              type: 'consultation',
              name: 'Consultation 1',
              meeting: 'meeting-1',
            },
          ],
        },
        {
          id: 'paper-2',
          type: 'paper',
          name: 'Paper 2',
          consultation: [
            {
              id: 'consultation-2',
              type: 'consultation',
              name: 'Consultation 2',
              meeting: 'meeting-2',
            },
          ],
        },
        {
          id: 'paper-3',
          type: 'paper',
          name: 'Paper 3',
          consultation: [
            {
              id: 'consultation-3',
              type: 'consultation',
              name: 'Consultation 3',
              meeting: 'meeting-1',
            },
          ],
        },
      ];

      const repository = new OparlPapersInMemoryRepository(papers);
      const result = repository.getPapersByMeeting('meeting-1');

      expect(result.length).toEqual(2);
      expect(result[0].id).toEqual('paper-1');
      expect(result[1].id).toEqual('paper-3');
    });

    it('should return empty array when no papers match', () => {
      const papers: OparlPaper[] = [
        {
          id: 'paper-1',
          type: 'paper',
          name: 'Paper 1',
          consultation: [
            {
              id: 'consultation-1',
              type: 'consultation',
              name: 'Consultation 1',
              meeting: 'meeting-1',
            },
          ],
        },
      ];

      const repository = new OparlPapersInMemoryRepository(papers);
      const result = repository.getPapersByMeeting('meeting-2');

      expect(result.length).toEqual(0);
    });

    it('should handle papers with multiple consultations', () => {
      const papers: OparlPaper[] = [
        {
          id: 'paper-1',
          type: 'paper',
          name: 'Paper 1',
          consultation: [
            {
              id: 'consultation-1',
              type: 'consultation',
              name: 'Consultation 1',
              meeting: 'meeting-1',
            },
            {
              id: 'consultation-2',
              type: 'consultation',
              name: 'Consultation 2',
              meeting: 'meeting-2',
            },
          ],
        },
      ];

      const repository = new OparlPapersInMemoryRepository(papers);
      const result1 = repository.getPapersByMeeting('meeting-1');
      const result2 = repository.getPapersByMeeting('meeting-2');

      expect(result1.length).toEqual(1);
      expect(result1[0].id).toEqual('paper-1');
      expect(result2.length).toEqual(1);
      expect(result2[0].id).toEqual('paper-1');
    });

    it('should handle papers with undefined consultation', () => {
      const papers: OparlPaper[] = [
        {
          id: 'paper-1',
          type: 'paper',
          name: 'Paper 1',
        },
        {
          id: 'paper-2',
          type: 'paper',
          name: 'Paper 2',
          consultation: [
            {
              id: 'consultation-1',
              type: 'consultation',
              name: 'Consultation 1',
              meeting: 'meeting-1',
            },
          ],
        },
      ];

      const repository = new OparlPapersInMemoryRepository(papers);
      const result = repository.getPapersByMeeting('meeting-1');

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual('paper-2');
    });

    it('should handle papers with empty consultation array', () => {
      const papers: OparlPaper[] = [
        {
          id: 'paper-1',
          type: 'paper',
          name: 'Paper 1',
          consultation: [],
        },
        {
          id: 'paper-2',
          type: 'paper',
          name: 'Paper 2',
          consultation: [
            {
              id: 'consultation-1',
              type: 'consultation',
              name: 'Consultation 1',
              meeting: 'meeting-1',
            },
          ],
        },
      ];

      const repository = new OparlPapersInMemoryRepository(papers);
      const result = repository.getPapersByMeeting('meeting-1');

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual('paper-2');
    });

    it('should handle consultation with undefined meeting', () => {
      const papers: OparlPaper[] = [
        {
          id: 'paper-1',
          type: 'paper',
          name: 'Paper 1',
          consultation: [
            {
              id: 'consultation-1',
              type: 'consultation',
              name: 'Consultation 1',
            },
          ],
        },
        {
          id: 'paper-2',
          type: 'paper',
          name: 'Paper 2',
          consultation: [
            {
              id: 'consultation-2',
              type: 'consultation',
              name: 'Consultation 2',
              meeting: 'meeting-1',
            },
          ],
        },
      ];

      const repository = new OparlPapersInMemoryRepository(papers);
      const result = repository.getPapersByMeeting('meeting-1');

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual('paper-2');
    });

    it('should handle empty papers array', () => {
      const repository = new OparlPapersInMemoryRepository([]);
      const result = repository.getPapersByMeeting('meeting-1');

      expect(result.length).toEqual(0);
    });

    it('should return different instances for different queries', () => {
      const papers: OparlPaper[] = [
        {
          id: 'paper-1',
          type: 'paper',
          name: 'Paper 1',
          consultation: [
            {
              id: 'consultation-1',
              type: 'consultation',
              name: 'Consultation 1',
              meeting: 'meeting-1',
            },
          ],
        },
        {
          id: 'paper-2',
          type: 'paper',
          name: 'Paper 2',
          consultation: [
            {
              id: 'consultation-2',
              type: 'consultation',
              name: 'Consultation 2',
              meeting: 'meeting-2',
            },
          ],
        },
      ];

      const repository = new OparlPapersInMemoryRepository(papers);
      const result1 = repository.getPapersByMeeting('meeting-1');
      const result2 = repository.getPapersByMeeting('meeting-2');

      expect(result1.length).toEqual(1);
      expect(result1[0].id).toEqual('paper-1');
      expect(result2.length).toEqual(1);
      expect(result2[0].id).toEqual('paper-2');
    });

    it('should preserve all paper properties', () => {
      const papers: OparlPaper[] = [
        {
          id: 'paper-1',
          type: 'paper',
          name: 'Important Paper',
          reference: 'REF-2024-001',
          paperType: 'Antrag',
          deleted: true,
          consultation: [
            {
              id: 'consultation-1',
              type: 'consultation',
              name: 'Consultation 1',
              meeting: 'meeting-1',
            },
          ],
        },
      ];

      const repository = new OparlPapersInMemoryRepository(papers);
      const result = repository.getPapersByMeeting('meeting-1');

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual('paper-1');
      expect(result[0].name).toEqual('Important Paper');
      expect(result[0].reference).toEqual('REF-2024-001');
      expect(result[0].paperType).toEqual('Antrag');
      expect(result[0].deleted).toEqual(true);
    });
  });
});
