import { assertEquals } from '@std/assert';
import { describe, it } from '@std/testing/bdd';
import { OparlOrganizationsInMemoryRepository } from './oparl-organizations-repository.ts';
import type { OparlOrganization } from '../model/oparl.ts';

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

      assertEquals(result?.id, 'org-2');
      assertEquals(result?.name, 'Finance Committee');
      assertEquals(result?.type, 'organization');
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

      assertEquals(result, null);
    });

    it('should return null when searching empty array', () => {
      const repository = new OparlOrganizationsInMemoryRepository([]);
      const result = repository.getOrganizationById('org-1');

      assertEquals(result, null);
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

      assertEquals(result?.name, 'First Organization');
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

      assertEquals(result?.id, 'org-1');
      assertEquals(result?.type, 'organization');
      assertEquals(result?.name, 'City Council of Magdeburg');
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

      assertEquals(repository.getOrganizationById('Org-1')?.name, 'Uppercase Organization');
      assertEquals(repository.getOrganizationById('org-1'), null);
      assertEquals(repository.getOrganizationById('ORG-1'), null);
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

      assertEquals(
        repository.getOrganizationById('https://example.com/oparl/organization/123')?.name,
        'URL-based ID',
      );
      assertEquals(
        repository.getOrganizationById('org:committee:456')?.name,
        'Colon-separated ID',
      );
      assertEquals(
        repository.getOrganizationById('org/sub/789')?.name,
        'Slash-separated ID',
      );
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

      assertEquals(result1?.name, 'City Council');
      assertEquals(result2?.name, 'Finance Committee');
      assertEquals(result3?.name, 'Planning Committee');
      assertEquals(resultNull, null);
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

      assertEquals(result?.name, '');
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

      assertEquals(result?.name, longName);
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

      assertEquals(
        repository.getOrganizationById('org-1')?.name,
        'Committee for "Special Projects" & Innovation',
      );
      assertEquals(repository.getOrganizationById('org-2')?.name, 'Fraktion CDU/CSU');
      assertEquals(repository.getOrganizationById('org-3')?.name, 'Arbeitsgruppe § 42');
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

      assertEquals(
        repository.getOrganizationById('org-1')?.name,
        'Ausschuss für Bürgerbeteiligung',
      );
      assertEquals(repository.getOrganizationById('org-2')?.name, 'Комитет по образованию');
      assertEquals(repository.getOrganizationById('org-3')?.name, '市民参加委員会');
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

      assertEquals(result1?.id, 'org-1');
      assertEquals(result2?.id, 'org-2');
      assertEquals(result1?.name, 'Organization 1');
      assertEquals(result2?.name, 'Organization 2');
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

      assertEquals(result?.name, 'Numeric ID Organization');
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

      assertEquals(repository.getOrganizationById('org 1')?.name, 'Whitespace ID');
      assertEquals(repository.getOrganizationById('org\t2')?.name, 'Tab ID');
      assertEquals(repository.getOrganizationById('org  1'), null);
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

      assertEquals(result1?.name, 'Organization 0');
      assertEquals(result500?.name, 'Organization 500');
      assertEquals(result999?.name, 'Organization 999');
      assertEquals(resultNone, null);
    });
  });
});
