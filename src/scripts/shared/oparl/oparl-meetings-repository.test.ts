import { describe, expect, it } from 'bun:test';
import { OparlMeetingsInMemoryRepository } from './oparl-meetings-repository.ts';
import type { OparlMeeting } from '@srw-astro/models/oparl';

describe('OparlMeetingsInMemoryRepository', () => {
  describe('getMeetingById', () => {
    it('should return the meeting when ID matches', () => {
      const meetings: OparlMeeting[] = [
        {
          id: 'meeting-1',
          type: 'meeting',
          name: 'Meeting 1',
          organization: ['org-1'],
        },
        {
          id: 'meeting-2',
          type: 'meeting',
          name: 'Meeting 2',
          organization: ['org-2'],
        },
      ];

      const repository = new OparlMeetingsInMemoryRepository(meetings);
      const result = repository.getMeetingById('meeting-1');

      expect(result?.id).toEqual('meeting-1');
      expect(result?.name).toEqual('Meeting 1');
    });

    it('should return null when ID does not match', () => {
      const meetings: OparlMeeting[] = [
        {
          id: 'meeting-1',
          type: 'meeting',
          name: 'Meeting 1',
          organization: ['org-1'],
        },
      ];

      const repository = new OparlMeetingsInMemoryRepository(meetings);
      const result = repository.getMeetingById('non-existent-id');

      expect(result).toEqual(null);
    });

    it('should return null when meetings array is empty', () => {
      const repository = new OparlMeetingsInMemoryRepository([]);
      const result = repository.getMeetingById('meeting-1');

      expect(result).toEqual(null);
    });

    it('should return the first matching meeting when duplicates exist', () => {
      const meetings: OparlMeeting[] = [
        {
          id: 'meeting-1',
          type: 'meeting',
          name: 'First Meeting',
          organization: ['org-1'],
        },
        {
          id: 'meeting-1',
          type: 'meeting',
          name: 'Duplicate Meeting',
          organization: ['org-2'],
        },
      ];

      const repository = new OparlMeetingsInMemoryRepository(meetings);
      const result = repository.getMeetingById('meeting-1');

      expect(result?.name).toEqual('First Meeting');
    });

    it('should preserve all meeting properties', () => {
      const meetings: OparlMeeting[] = [
        {
          id: 'meeting-1',
          type: 'meeting',
          name: 'City Council Meeting',
          organization: ['org-1'],
          start: '2024-01-15T10:00:00Z',
          end: '2024-01-15T12:00:00Z',
          cancelled: false,
        },
      ];

      const repository = new OparlMeetingsInMemoryRepository(meetings);
      const result = repository.getMeetingById('meeting-1');

      expect(result?.id).toEqual('meeting-1');
      expect(result?.name).toEqual('City Council Meeting');
      expect(result?.start).toEqual('2024-01-15T10:00:00Z');
      expect(result?.end).toEqual('2024-01-15T12:00:00Z');
      expect(result?.cancelled).toEqual(false);
    });

    it('should handle cancelled meetings', () => {
      const meetings: OparlMeeting[] = [
        {
          id: 'meeting-1',
          type: 'meeting',
          name: 'Cancelled Meeting',
          organization: ['org-1'],
          cancelled: true,
        },
      ];

      const repository = new OparlMeetingsInMemoryRepository(meetings);
      const result = repository.getMeetingById('meeting-1');

      expect(result?.id).toEqual('meeting-1');
      expect(result?.cancelled).toEqual(true);
    });

    it('should be case-sensitive when matching IDs', () => {
      const meetings: OparlMeeting[] = [
        {
          id: 'meeting-1',
          type: 'meeting',
          name: 'Meeting 1',
          organization: ['org-1'],
        },
      ];

      const repository = new OparlMeetingsInMemoryRepository(meetings);
      const result = repository.getMeetingById('MEETING-1');

      expect(result).toEqual(null);
    });

    it('should handle special characters in IDs', () => {
      const meetings: OparlMeeting[] = [
        {
          id: 'https://oparl.example.org/meeting/12345',
          type: 'meeting',
          name: 'Meeting with URL ID',
          organization: ['org-1'],
        },
      ];

      const repository = new OparlMeetingsInMemoryRepository(meetings);
      const result = repository.getMeetingById('https://oparl.example.org/meeting/12345');

      expect(result?.id).toEqual('https://oparl.example.org/meeting/12345');
      expect(result?.name).toEqual('Meeting with URL ID');
    });
  });

  describe('getMeetingsByOrganization', () => {
    it('should return meetings matching the organization ID', () => {
      const meetings: OparlMeeting[] = [
        {
          id: 'meeting-1',
          type: 'meeting',
          name: 'Meeting 1',
          organization: ['org-1', 'org-2'],
        },
        {
          id: 'meeting-2',
          type: 'meeting',
          name: 'Meeting 2',
          organization: ['org-3'],
        },
        {
          id: 'meeting-3',
          type: 'meeting',
          name: 'Meeting 3',
          organization: ['org-1'],
        },
      ];

      const repository = new OparlMeetingsInMemoryRepository(meetings);
      const result = repository.getMeetingsByOrganization('org-1');

      expect(result.length).toEqual(2);
      expect(result[0].id).toEqual('meeting-1');
      expect(result[1].id).toEqual('meeting-3');
    });

    it('should return empty array when no meetings match', () => {
      const meetings: OparlMeeting[] = [
        {
          id: 'meeting-1',
          type: 'meeting',
          name: 'Meeting 1',
          organization: ['org-2', 'org-3'],
        },
        {
          id: 'meeting-2',
          type: 'meeting',
          name: 'Meeting 2',
          organization: ['org-4'],
        },
      ];

      const repository = new OparlMeetingsInMemoryRepository(meetings);
      const result = repository.getMeetingsByOrganization('org-1');

      expect(result.length).toEqual(0);
    });

    it('should handle meetings without organization field', () => {
      const meetings: OparlMeeting[] = [
        {
          id: 'meeting-1',
          type: 'meeting',
          name: 'Meeting 1',
          organization: ['org-1'],
        },
        {
          id: 'meeting-2',
          type: 'meeting',
          name: 'Meeting 2',
        },
      ];

      const repository = new OparlMeetingsInMemoryRepository(meetings);
      const result = repository.getMeetingsByOrganization('org-1');

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual('meeting-1');
    });

    it('should handle empty meetings array', () => {
      const repository = new OparlMeetingsInMemoryRepository([]);
      const result = repository.getMeetingsByOrganization('org-1');

      expect(result.length).toEqual(0);
    });

    it('should return all meetings when all match', () => {
      const meetings: OparlMeeting[] = [
        {
          id: 'meeting-1',
          type: 'meeting',
          name: 'Meeting 1',
          organization: ['org-1'],
        },
        {
          id: 'meeting-2',
          type: 'meeting',
          name: 'Meeting 2',
          organization: ['org-1', 'org-2'],
        },
        {
          id: 'meeting-3',
          type: 'meeting',
          name: 'Meeting 3',
          organization: ['org-3', 'org-1'],
        },
      ];

      const repository = new OparlMeetingsInMemoryRepository(meetings);
      const result = repository.getMeetingsByOrganization('org-1');

      expect(result.length).toEqual(3);
      expect(result[0].id).toEqual('meeting-1');
      expect(result[1].id).toEqual('meeting-2');
      expect(result[2].id).toEqual('meeting-3');
    });

    it('should preserve all meeting properties', () => {
      const meetings: OparlMeeting[] = [
        {
          id: 'meeting-1',
          type: 'meeting',
          name: 'City Council Meeting',
          organization: ['org-1'],
          start: '2024-01-15T10:00:00Z',
          end: '2024-01-15T12:00:00Z',
          cancelled: false,
        },
      ];

      const repository = new OparlMeetingsInMemoryRepository(meetings);
      const result = repository.getMeetingsByOrganization('org-1');

      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual('meeting-1');
      expect(result[0].name).toEqual('City Council Meeting');
      expect(result[0].start).toEqual('2024-01-15T10:00:00Z');
      expect(result[0].end).toEqual('2024-01-15T12:00:00Z');
      expect(result[0].cancelled).toEqual(false);
    });

    it('should handle cancelled meetings', () => {
      const meetings: OparlMeeting[] = [
        {
          id: 'meeting-1',
          type: 'meeting',
          name: 'Meeting 1',
          organization: ['org-1'],
          cancelled: false,
        },
        {
          id: 'meeting-2',
          type: 'meeting',
          name: 'Meeting 2',
          organization: ['org-1'],
          cancelled: true,
        },
      ];

      const repository = new OparlMeetingsInMemoryRepository(meetings);
      const result = repository.getMeetingsByOrganization('org-1');

      expect(result.length).toEqual(2);
      expect(result[0].id).toEqual('meeting-1');
      expect(result[1].id).toEqual('meeting-2');
    });

    it('should return different instances for different queries', () => {
      const meetings: OparlMeeting[] = [
        {
          id: 'meeting-1',
          type: 'meeting',
          name: 'Meeting 1',
          organization: ['org-1'],
        },
        {
          id: 'meeting-2',
          type: 'meeting',
          name: 'Meeting 2',
          organization: ['org-2'],
        },
      ];

      const repository = new OparlMeetingsInMemoryRepository(meetings);
      const result1 = repository.getMeetingsByOrganization('org-1');
      const result2 = repository.getMeetingsByOrganization('org-2');

      expect(result1.length).toEqual(1);
      expect(result1[0].id).toEqual('meeting-1');
      expect(result2.length).toEqual(1);
      expect(result2[0].id).toEqual('meeting-2');
    });

    it('should handle meetings with multiple organizations', () => {
      const meetings: OparlMeeting[] = [
        {
          id: 'meeting-1',
          type: 'meeting',
          name: 'Joint Meeting',
          organization: ['org-1', 'org-2', 'org-3'],
        },
      ];

      const repository = new OparlMeetingsInMemoryRepository(meetings);
      const result1 = repository.getMeetingsByOrganization('org-1');
      const result2 = repository.getMeetingsByOrganization('org-2');
      const result3 = repository.getMeetingsByOrganization('org-3');

      expect(result1.length).toEqual(1);
      expect(result1[0].id).toEqual('meeting-1');
      expect(result2.length).toEqual(1);
      expect(result2[0].id).toEqual('meeting-1');
      expect(result3.length).toEqual(1);
      expect(result3[0].id).toEqual('meeting-1');
    });
  });
});
