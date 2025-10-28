import { assertEquals } from '@std/assert';
import { describe, it } from '@std/testing/bdd';
import { OparlFilesInMemoryRepository } from './oparl-files-repository.ts';
import { OparlPapersInMemoryRepository } from './oparl-papers-repository.ts';
import type { OparlFile, OparlPaper } from '../model/oparl.ts';

describe('OparlFilesInMemoryRepository', () => {
  describe('getFilesByPaper', () => {
    it('should return files linked to a specific paper', () => {
      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'File 1',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/file1.pdf',
        },
        {
          id: 'file-2',
          type: 'file',
          name: 'File 2',
          paper: ['paper-2'],
          accessUrl: 'https://example.com/file2.pdf',
        },
        {
          id: 'file-3',
          type: 'file',
          name: 'File 3',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/file3.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository([]);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result = repository.getFilesByPaper('paper-1');

      assertEquals(result.length, 2);
      assertEquals(result[0].id, 'file-1');
      assertEquals(result[1].id, 'file-3');
    });

    it('should return empty array when no files match the paper', () => {
      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'File 1',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/file1.pdf',
        },
        {
          id: 'file-2',
          type: 'file',
          name: 'File 2',
          paper: ['paper-2'],
          accessUrl: 'https://example.com/file2.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository([]);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result = repository.getFilesByPaper('paper-3');

      assertEquals(result.length, 0);
    });

    it('should handle files with multiple papers', () => {
      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'File 1',
          paper: ['paper-1', 'paper-2', 'paper-3'],
          accessUrl: 'https://example.com/file1.pdf',
        },
        {
          id: 'file-2',
          type: 'file',
          name: 'File 2',
          paper: ['paper-2'],
          accessUrl: 'https://example.com/file2.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository([]);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result1 = repository.getFilesByPaper('paper-1');
      const result2 = repository.getFilesByPaper('paper-2');
      const result3 = repository.getFilesByPaper('paper-3');

      assertEquals(result1.length, 1);
      assertEquals(result1[0].id, 'file-1');
      assertEquals(result2.length, 2);
      assertEquals(result2[0].id, 'file-1');
      assertEquals(result2[1].id, 'file-2');
      assertEquals(result3.length, 1);
      assertEquals(result3[0].id, 'file-1');
    });

    it('should handle files with undefined paper property', () => {
      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'File 1',
          accessUrl: 'https://example.com/file1.pdf',
        },
        {
          id: 'file-2',
          type: 'file',
          name: 'File 2',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/file2.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository([]);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result = repository.getFilesByPaper('paper-1');

      assertEquals(result.length, 1);
      assertEquals(result[0].id, 'file-2');
    });

    it('should handle files with empty paper array', () => {
      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'File 1',
          paper: [],
          accessUrl: 'https://example.com/file1.pdf',
        },
        {
          id: 'file-2',
          type: 'file',
          name: 'File 2',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/file2.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository([]);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result = repository.getFilesByPaper('paper-1');

      assertEquals(result.length, 1);
      assertEquals(result[0].id, 'file-2');
    });

    it('should handle empty files array', () => {
      const papersRepository = new OparlPapersInMemoryRepository([]);
      const repository = new OparlFilesInMemoryRepository([], papersRepository);
      const result = repository.getFilesByPaper('paper-1');

      assertEquals(result.length, 0);
    });

    it('should preserve all file properties', () => {
      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'Important Document.pdf',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/important-document.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository([]);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result = repository.getFilesByPaper('paper-1');

      assertEquals(result.length, 1);
      assertEquals(result[0].id, 'file-1');
      assertEquals(result[0].name, 'Important Document.pdf');
      assertEquals(result[0].accessUrl, 'https://example.com/important-document.pdf');
      assertEquals(result[0].paper, ['paper-1']);
    });

    it('should match exact paper IDs including full URLs', () => {
      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'File 1',
          paper: ['https://oparl.example.com/paper-1'],
          accessUrl: 'https://example.com/file1.pdf',
        },
        {
          id: 'file-2',
          type: 'file',
          name: 'File 2',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/file2.pdf',
        },
        {
          id: 'file-3',
          type: 'file',
          name: 'File 3',
          paper: ['paper-2'],
          accessUrl: 'https://example.com/file3.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository([]);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result1 = repository.getFilesByPaper('https://oparl.example.com/paper-1');
      const result2 = repository.getFilesByPaper('paper-1');

      assertEquals(result1.length, 1);
      assertEquals(result1[0].id, 'file-1');
      assertEquals(result2.length, 1);
      assertEquals(result2[0].id, 'file-2');
    });

    it('should return different results for different paper queries', () => {
      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'File 1',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/file1.pdf',
        },
        {
          id: 'file-2',
          type: 'file',
          name: 'File 2',
          paper: ['paper-2'],
          accessUrl: 'https://example.com/file2.pdf',
        },
        {
          id: 'file-3',
          type: 'file',
          name: 'File 3',
          paper: ['paper-3'],
          accessUrl: 'https://example.com/file3.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository([]);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result1 = repository.getFilesByPaper('paper-1');
      const result2 = repository.getFilesByPaper('paper-2');
      const result3 = repository.getFilesByPaper('paper-3');

      assertEquals(result1.length, 1);
      assertEquals(result1[0].id, 'file-1');
      assertEquals(result2.length, 1);
      assertEquals(result2[0].id, 'file-2');
      assertEquals(result3.length, 1);
      assertEquals(result3[0].id, 'file-3');
    });
  });

  describe('getFilesByMeeting', () => {
    it('should return files linked to papers in the meeting', () => {
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

      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'File 1',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/file1.pdf',
        },
        {
          id: 'file-2',
          type: 'file',
          name: 'File 2',
          paper: ['paper-2'],
          accessUrl: 'https://example.com/file2.pdf',
        },
        {
          id: 'file-3',
          type: 'file',
          name: 'File 3',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/file3.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository(papers);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result = repository.getFilesByMeeting('meeting-1');

      assertEquals(result.length, 2);
      assertEquals(result[0].id, 'file-1');
      assertEquals(result[1].id, 'file-3');
    });

    it('should return empty array when no files match', () => {
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

      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'File 1',
          paper: ['paper-2'],
          accessUrl: 'https://example.com/file1.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository(papers);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result = repository.getFilesByMeeting('meeting-1');

      assertEquals(result.length, 0);
    });

    it('should return empty array when meeting has no papers', () => {
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

      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'File 1',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/file1.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository(papers);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result = repository.getFilesByMeeting('meeting-2');

      assertEquals(result.length, 0);
    });

    it('should handle files with multiple papers', () => {
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

      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'File 1',
          paper: ['paper-1', 'paper-2'],
          accessUrl: 'https://example.com/file1.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository(papers);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result1 = repository.getFilesByMeeting('meeting-1');
      const result2 = repository.getFilesByMeeting('meeting-2');

      assertEquals(result1.length, 1);
      assertEquals(result1[0].id, 'file-1');
      assertEquals(result2.length, 1);
      assertEquals(result2[0].id, 'file-1');
    });

    it('should handle files with undefined paper property', () => {
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

      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'File 1',
          accessUrl: 'https://example.com/file1.pdf',
        },
        {
          id: 'file-2',
          type: 'file',
          name: 'File 2',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/file2.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository(papers);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result = repository.getFilesByMeeting('meeting-1');

      assertEquals(result.length, 1);
      assertEquals(result[0].id, 'file-2');
    });

    it('should handle files with empty paper array', () => {
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

      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'File 1',
          paper: [],
          accessUrl: 'https://example.com/file1.pdf',
        },
        {
          id: 'file-2',
          type: 'file',
          name: 'File 2',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/file2.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository(papers);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result = repository.getFilesByMeeting('meeting-1');

      assertEquals(result.length, 1);
      assertEquals(result[0].id, 'file-2');
    });

    it('should handle empty files array', () => {
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

      const papersRepository = new OparlPapersInMemoryRepository(papers);
      const repository = new OparlFilesInMemoryRepository([], papersRepository);
      const result = repository.getFilesByMeeting('meeting-1');

      assertEquals(result.length, 0);
    });

    it('should handle paper linked to multiple meetings', () => {
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

      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'File 1',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/file1.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository(papers);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result1 = repository.getFilesByMeeting('meeting-1');
      const result2 = repository.getFilesByMeeting('meeting-2');

      assertEquals(result1.length, 1);
      assertEquals(result1[0].id, 'file-1');
      assertEquals(result2.length, 1);
      assertEquals(result2[0].id, 'file-1');
    });

    it('should preserve all file properties', () => {
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

      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'Important Document.pdf',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/important-document.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository(papers);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result = repository.getFilesByMeeting('meeting-1');

      assertEquals(result.length, 1);
      assertEquals(result[0].id, 'file-1');
      assertEquals(result[0].name, 'Important Document.pdf');
      assertEquals(result[0].accessUrl, 'https://example.com/important-document.pdf');
      assertEquals(result[0].paper, ['paper-1']);
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

      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'File 1',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/file1.pdf',
        },
        {
          id: 'file-2',
          type: 'file',
          name: 'File 2',
          paper: ['paper-2'],
          accessUrl: 'https://example.com/file2.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository(papers);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result1 = repository.getFilesByMeeting('meeting-1');
      const result2 = repository.getFilesByMeeting('meeting-2');

      assertEquals(result1.length, 1);
      assertEquals(result1[0].id, 'file-1');
      assertEquals(result2.length, 1);
      assertEquals(result2[0].id, 'file-2');
    });

    it('should filter out files not linked to any paper in the meeting', () => {
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
              meeting: 'meeting-1',
            },
          ],
        },
      ];

      const files: OparlFile[] = [
        {
          id: 'file-1',
          type: 'file',
          name: 'File 1',
          paper: ['paper-1'],
          accessUrl: 'https://example.com/file1.pdf',
        },
        {
          id: 'file-2',
          type: 'file',
          name: 'File 2',
          paper: ['paper-3'], // paper-3 is not in meeting-1
          accessUrl: 'https://example.com/file2.pdf',
        },
        {
          id: 'file-3',
          type: 'file',
          name: 'File 3',
          paper: ['paper-2'],
          accessUrl: 'https://example.com/file3.pdf',
        },
      ];

      const papersRepository = new OparlPapersInMemoryRepository(papers);
      const repository = new OparlFilesInMemoryRepository(files, papersRepository);
      const result = repository.getFilesByMeeting('meeting-1');

      assertEquals(result.length, 2);
      assertEquals(result[0].id, 'file-1');
      assertEquals(result[1].id, 'file-3');
    });
  });
});
