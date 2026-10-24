import { describe, expect, it } from 'bun:test';

import type { OparlOrganization } from '@srw-astro/models/oparl';

import { OparlOrganizationsInMemoryRepository } from './oparl-organizations-repository.ts';

describe('OparlOrganizationsInMemoryRepository', () => {
  describe('getOrganizationById', () => {
    it('should return organization matching the ID', () => {
      const organizations: OparlOrganization[] = [
        {
          id: 'org-1',
          type: 'organization',
          name: 'City Council',
        },
        {
          id: 'org-2',
          type: 'organization',
          name: 'Finance Committee',
        },
        {
          id: 'org-3',
          type: 'organization',
          name: 'Planning Committee',
        },
      ];

      const repository = new OparlOrganizationsInMemoryRepository(organizations);
      const result = repository.getOrganizationById('org-2');

      expect(result?.id).toEqual('org-2');
      expect(result?.name).toEqual('Finance Committee');
      expect(result?.type).toEqual('organization');
    });

    it('should return null when organization not found', () => {
      const organizations: OparlOrganization[] = [
        {
          id: 'org-1',
          type: 'organization',
          name: 'City Council',
        },
        {
          id: 'org-2',
          type: 'organization',
          name: 'Finance Committee',
        },
      ];

      const repository = new OparlOrganizationsInMemoryRepository(organizations);
      const result = repository.getOrganizationById('org-999');

      expect(result).toEqual(null);
    });

    it('should return null when searching empty array', () => {
      const repository = new OparlOrganizationsInMemoryRepository([]);
      const result = repository.getOrganizationById('org-1');

      expect(result).toEqual(null);
    });

    it('should return first match when duplicate IDs exist', () => {
      const organizations: OparlOrganization[] = [
        {
          id: 'org-1',
          type: 'organization',
          name: 'First Organization',
        },
        {
          id: 'org-1',
          type: 'organization',
          name: 'Duplicate Organization',
        },
      ];

      const repository = new OparlOrganizationsInMemoryRepository(organizations);
      const result = repository.getOrganizationById('org-1');

      expect(result?.name).toEqual('First Organization');
    });

    it('should preserve all organization properties', () => {
      const organizations: OparlOrganization[] = [
        {
          id: 'org-1',
          type: 'organization',
          name: 'City Council of Magdeburg',
        },
      ];

      const repository = new OparlOrganizationsInMemoryRepository(organizations);
      const result = repository.getOrganizationById('org-1');

      expect(result?.id).toEqual('org-1');
      expect(result?.type).toEqual('organization');
      expect(result?.name).toEqual('City Council of Magdeburg');
    });

    it('should perform case-sensitive ID matching', () => {
      const organizations: OparlOrganization[] = [
        {
          id: 'Org-1',
          type: 'organization',
          name: 'Uppercase Organization',
        },
      ];

      const repository = new OparlOrganizationsInMemoryRepository(organizations);

      expect(repository.getOrganizationById('Org-1')?.name).toEqual('Uppercase Organization');
      expect(repository.getOrganizationById('org-1')).toEqual(null);
      expect(repository.getOrganizationById('ORG-1')).toEqual(null);
    });

    it('should handle organizations with special characters in ID', () => {
      const organizations: OparlOrganization[] = [
        {
          id: 'https://example.com/oparl/organization/123',
          type: 'organization',
          name: 'URL-based ID',
        },
        {
          id: 'org:committee:456',
          type: 'organization',
          name: 'Colon-separated ID',
        },
        {
          id: 'org/sub/789',
          type: 'organization',
          name: 'Slash-separated ID',
        },
      ];

      const repository = new OparlOrganizationsInMemoryRepository(organizations);

      expect(repository.getOrganizationById('https://example.com/oparl/organization/123')?.name).toEqual(
        'URL-based ID',
      );
      expect(repository.getOrganizationById('org:committee:456')?.name).toEqual('Colon-separated ID');
      expect(repository.getOrganizationById('org/sub/789')?.name).toEqual('Slash-separated ID');
    });

    it('should handle multiple queries returning different results', () => {
      const organizations: OparlOrganization[] = [
        {
          id: 'org-1',
          type: 'organization',
          name: 'City Council',
        },
        {
          id: 'org-2',
          type: 'organization',
          name: 'Finance Committee',
        },
        {
          id: 'org-3',
          type: 'organization',
          name: 'Planning Committee',
        },
      ];

      const repository = new OparlOrganizationsInMemoryRepository(organizations);

      const result1 = repository.getOrganizationById('org-1');
      const result2 = repository.getOrganizationById('org-2');
      const result3 = repository.getOrganizationById('org-3');
      const resultNull = repository.getOrganizationById('org-999');

      expect(result1?.name).toEqual('City Council');
      expect(result2?.name).toEqual('Finance Committee');
      expect(result3?.name).toEqual('Planning Committee');
      expect(resultNull).toEqual(null);
    });

    it('should handle organizations with empty string name', () => {
      const organizations: OparlOrganization[] = [
        {
          id: 'org-1',
          type: 'organization',
          name: '',
        },
      ];

      const repository = new OparlOrganizationsInMemoryRepository(organizations);
      const result = repository.getOrganizationById('org-1');

      expect(result?.name).toEqual('');
    });

    it('should handle organizations with very long names', () => {
      const longName =
        'Standing Committee for Urban Development, Planning, Environmental Protection, and Climate Action of the City Council';
      const organizations: OparlOrganization[] = [
        {
          id: 'org-1',
          type: 'organization',
          name: longName,
        },
      ];

      const repository = new OparlOrganizationsInMemoryRepository(organizations);
      const result = repository.getOrganizationById('org-1');

      expect(result?.name).toEqual(longName);
    });

    it('should handle organizations with special characters in name', () => {
      const organizations: OparlOrganization[] = [
        {
          id: 'org-1',
          type: 'organization',
          name: 'Committee for "Special Projects" & Innovation',
        },
        {
          id: 'org-2',
          type: 'organization',
          name: 'Fraktion CDU/CSU',
        },
        {
          id: 'org-3',
          type: 'organization',
          name: 'Arbeitsgruppe § 42',
        },
      ];

      const repository = new OparlOrganizationsInMemoryRepository(organizations);

      expect(repository.getOrganizationById('org-1')?.name).toEqual('Committee for "Special Projects" & Innovation');
      expect(repository.getOrganizationById('org-2')?.name).toEqual('Fraktion CDU/CSU');
      expect(repository.getOrganizationById('org-3')?.name).toEqual('Arbeitsgruppe § 42');
    });

    it('should handle organizations with Unicode characters in name', () => {
      const organizations: OparlOrganization[] = [
        {
          id: 'org-1',
          type: 'organization',
          name: 'Ausschuss für Bürgerbeteiligung',
        },
        {
          id: 'org-2',
          type: 'organization',
          name: 'Комитет по образованию',
        },
        {
          id: 'org-3',
          type: 'organization',
          name: '市民参加委員会',
        },
      ];

      const repository = new OparlOrganizationsInMemoryRepository(organizations);

      expect(repository.getOrganizationById('org-1')?.name).toEqual('Ausschuss für Bürgerbeteiligung');
      expect(repository.getOrganizationById('org-2')?.name).toEqual('Комитет по образованию');
      expect(repository.getOrganizationById('org-3')?.name).toEqual('市民参加委員会');
    });

    it('should return different instances for different queries', () => {
      const organizations: OparlOrganization[] = [
        {
          id: 'org-1',
          type: 'organization',
          name: 'Organization 1',
        },
        {
          id: 'org-2',
          type: 'organization',
          name: 'Organization 2',
        },
      ];

      const repository = new OparlOrganizationsInMemoryRepository(organizations);
      const result1 = repository.getOrganizationById('org-1');
      const result2 = repository.getOrganizationById('org-2');

      expect(result1?.id).toEqual('org-1');
      expect(result2?.id).toEqual('org-2');
      expect(result1?.name).toEqual('Organization 1');
      expect(result2?.name).toEqual('Organization 2');
    });

    it('should handle organizations with numeric IDs', () => {
      const organizations: OparlOrganization[] = [
        {
          id: '123',
          type: 'organization',
          name: 'Numeric ID Organization',
        },
      ];

      const repository = new OparlOrganizationsInMemoryRepository(organizations);
      const result = repository.getOrganizationById('123');

      expect(result?.name).toEqual('Numeric ID Organization');
    });

    it('should handle organizations with whitespace in ID', () => {
      const organizations: OparlOrganization[] = [
        {
          id: 'org 1',
          type: 'organization',
          name: 'Whitespace ID',
        },
        {
          id: 'org\t2',
          type: 'organization',
          name: 'Tab ID',
        },
      ];

      const repository = new OparlOrganizationsInMemoryRepository(organizations);

      expect(repository.getOrganizationById('org 1')?.name).toEqual('Whitespace ID');
      expect(repository.getOrganizationById('org\t2')?.name).toEqual('Tab ID');
      expect(repository.getOrganizationById('org  1')).toEqual(null);
    });

    it('should handle large number of organizations efficiently', () => {
      const organizations: OparlOrganization[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `org-${i}`,
        type: 'organization',
        name: `Organization ${i}`,
      }));

      const repository = new OparlOrganizationsInMemoryRepository(organizations);

      const result1 = repository.getOrganizationById('org-0');
      const result500 = repository.getOrganizationById('org-500');
      const result999 = repository.getOrganizationById('org-999');
      const resultNone = repository.getOrganizationById('org-1000');

      expect(result1?.name).toEqual('Organization 0');
      expect(result500?.name).toEqual('Organization 500');
      expect(result999?.name).toEqual('Organization 999');
      expect(resultNone).toEqual(null);
    });
  });
});
