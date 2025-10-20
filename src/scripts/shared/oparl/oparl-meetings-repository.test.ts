import { assertEquals } from '@std/assert';
import { OparlMeetingsInMemoryRepository } from './oparl-meetings-repository.ts';
import { OparlMeeting } from '../model/oparl.ts';

Deno.test('getMeetingsByOrganization - returns meetings matching the organization ID', () => {
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

  assertEquals(result.length, 2);
  assertEquals(result[0].id, 'meeting-1');
  assertEquals(result[1].id, 'meeting-3');
});

Deno.test('getMeetingsByOrganization - returns empty array when no meetings match', () => {
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

  assertEquals(result.length, 0);
});

Deno.test('getMeetingsByOrganization - handles meetings without organization field', () => {
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

  assertEquals(result.length, 1);
  assertEquals(result[0].id, 'meeting-1');
});

Deno.test('getMeetingsByOrganization - handles empty meetings array', () => {
  const repository = new OparlMeetingsInMemoryRepository([]);
  const result = repository.getMeetingsByOrganization('org-1');

  assertEquals(result.length, 0);
});

Deno.test('getMeetingsByOrganization - returns all meetings when all match', () => {
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

  assertEquals(result.length, 3);
  assertEquals(result[0].id, 'meeting-1');
  assertEquals(result[1].id, 'meeting-2');
  assertEquals(result[2].id, 'meeting-3');
});

Deno.test('getMeetingsByOrganization - preserves all meeting properties', () => {
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

  assertEquals(result.length, 1);
  assertEquals(result[0].id, 'meeting-1');
  assertEquals(result[0].name, 'City Council Meeting');
  assertEquals(result[0].start, '2024-01-15T10:00:00Z');
  assertEquals(result[0].end, '2024-01-15T12:00:00Z');
  assertEquals(result[0].cancelled, false);
});

Deno.test('getMeetingsByOrganization - handles cancelled meetings', () => {
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

  assertEquals(result.length, 2);
  assertEquals(result[0].id, 'meeting-1');
  assertEquals(result[1].id, 'meeting-2');
});

Deno.test('getMeetingsByOrganization - returns different instances for different queries', () => {
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

  assertEquals(result1.length, 1);
  assertEquals(result1[0].id, 'meeting-1');
  assertEquals(result2.length, 1);
  assertEquals(result2[0].id, 'meeting-2');
});

Deno.test('getMeetingsByOrganization - handles meetings with multiple organizations', () => {
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

  assertEquals(result1.length, 1);
  assertEquals(result1[0].id, 'meeting-1');
  assertEquals(result2.length, 1);
  assertEquals(result2[0].id, 'meeting-1');
  assertEquals(result3.length, 1);
  assertEquals(result3[0].id, 'meeting-1');
});
