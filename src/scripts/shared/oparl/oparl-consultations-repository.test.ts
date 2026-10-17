import { describe, expect, it } from 'bun:test';
import type { OparlConsultation } from '@srw-astro/models/oparl';
import {
  OparlConsultationsInMemoryRepository,
  type OparlConsultationsRepository,
} from './oparl-consultations-repository.ts';

describe('OparlConsultationsInMemoryRepository', () => {
  const mockConsultations: OparlConsultation[] = [
    {
      id: 'https://example.org/oparl/v1.1/consultations/1',
      type: 'https://schema.oparl.org/1.1/Consultation',
      name: 'First consultation',
      meeting: 'https://example.org/oparl/v1.1/meetings/1',
      paper: 'https://example.org/oparl/v1.1/papers/100',
      agendaItem: 'https://example.org/oparl/v1.1/agenda-items/1',
    },
    {
      id: 'https://example.org/oparl/v1.1/consultations/2',
      type: 'https://schema.oparl.org/1.1/Consultation',
      name: 'Second consultation',
      meeting: 'https://example.org/oparl/v1.1/meetings/1',
      paper: 'https://example.org/oparl/v1.1/papers/200',
    },
  ];

  it('should implement OparlConsultationsRepository interface', () => {
    const repository: OparlConsultationsRepository = new OparlConsultationsInMemoryRepository(mockConsultations);
    expect(typeof repository.getConsultationById).toEqual('function');
  });

  describe('getConsultationById', () => {
    const repository = new OparlConsultationsInMemoryRepository(mockConsultations);

    it('should return consultation when ID exists', () => {
      const result = repository.getConsultationById('https://example.org/oparl/v1.1/consultations/1');
      expect(result).toEqual(mockConsultations[0]);
    });

    it('should return null when ID does not exist', () => {
      const result = repository.getConsultationById('https://example.org/oparl/v1.1/consultations/999');
      expect(result).toEqual(null);
    });

    it('should return null for empty string ID', () => {
      const result = repository.getConsultationById('');
      expect(result).toEqual(null);
    });
  });

  it('should work with empty array', () => {
    const repository = new OparlConsultationsInMemoryRepository([]);
    const result = repository.getConsultationById('https://example.org/oparl/v1.1/consultations/1');
    expect(result).toEqual(null);
  });

  it('should return first match for duplicate IDs', () => {
    const duplicates: OparlConsultation[] = [
      {
        id: 'https://example.org/oparl/v1.1/consultations/1',
        type: 'https://schema.oparl.org/1.1/Consultation',
        name: 'First occurrence',
      },
      {
        id: 'https://example.org/oparl/v1.1/consultations/1',
        type: 'https://schema.oparl.org/1.1/Consultation',
        name: 'Second occurrence',
      },
    ];
    const repository = new OparlConsultationsInMemoryRepository(duplicates);
    const result = repository.getConsultationById('https://example.org/oparl/v1.1/consultations/1');
    expect(result?.name).toEqual('First occurrence');
  });
});
