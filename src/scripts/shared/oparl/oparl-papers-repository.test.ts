import { assertEquals } from '@std/assert';
import { OparlPapersInMemoryRepository } from './oparl-papers-repository.ts';
import { OparlPaper } from '../model/oparl.ts';

Deno.test('getPapersByMeeting - returns papers matching the meeting ID', () => {
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

  assertEquals(result.length, 2);
  assertEquals(result[0].id, 'paper-1');
  assertEquals(result[1].id, 'paper-3');
});

Deno.test('getPapersByMeeting - returns empty array when no papers match', () => {
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

  assertEquals(result.length, 0);
});

Deno.test('getPapersByMeeting - handles papers with multiple consultations', () => {
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

  assertEquals(result1.length, 1);
  assertEquals(result1[0].id, 'paper-1');
  assertEquals(result2.length, 1);
  assertEquals(result2[0].id, 'paper-1');
});

Deno.test('getPapersByMeeting - handles papers with undefined consultation', () => {
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

  assertEquals(result.length, 1);
  assertEquals(result[0].id, 'paper-2');
});

Deno.test('getPapersByMeeting - handles papers with empty consultation array', () => {
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

  assertEquals(result.length, 1);
  assertEquals(result[0].id, 'paper-2');
});

Deno.test('getPapersByMeeting - handles consultation with undefined meeting', () => {
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

  assertEquals(result.length, 1);
  assertEquals(result[0].id, 'paper-2');
});

Deno.test('getPapersByMeeting - handles empty papers array', () => {
  const repository = new OparlPapersInMemoryRepository([]);
  const result = repository.getPapersByMeeting('meeting-1');

  assertEquals(result.length, 0);
});

Deno.test('getPapersByMeeting - returns different instances for different queries', () => {
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

  assertEquals(result1.length, 1);
  assertEquals(result1[0].id, 'paper-1');
  assertEquals(result2.length, 1);
  assertEquals(result2[0].id, 'paper-2');
});

Deno.test('getPapersByMeeting - preserves all paper properties', () => {
  const papers: OparlPaper[] = [
    {
      id: 'paper-1',
      type: 'paper',
      name: 'Important Paper',
      reference: 'REF-2024-001',
      paperType: 'Antrag',
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

  assertEquals(result.length, 1);
  assertEquals(result[0].id, 'paper-1');
  assertEquals(result[0].name, 'Important Paper');
  assertEquals(result[0].reference, 'REF-2024-001');
  assertEquals(result[0].paperType, 'Antrag');
});
