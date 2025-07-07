import { assert, describe, beforeEach, test } from 'vitest';
import { calcApplicationsSuccessRateOfFaction } from '@data-analysis/ApplicationsSuccess.ts';
import type { RegistryFaction, RegistrySession } from '@models/registry.ts';
import type { SessionInput } from '@models/SessionInput.ts';

describe('ApplicationsSuccess', () => {
  let faction1: RegistryFaction;
  let faction2: RegistryFaction;
  let session1: RegistrySession;

  beforeEach(() => {
    faction1 = {
      id: 'faction-1',
      name: 'Faction 1',
      seats: 1,
    };

    faction2 = {
      id: 'faction-2',
      name: 'Faction 2',
      seats: 1,
    };

    session1 = {
      id: 'session-1',
      date: '2023-01-01',
      title: 'Session 1',
      youtubeUrl: 'https://youtube.com/session1',
      meetingMinutesUrl: 'https://example.com/minutes1',
    };
  });

  test('is null when no sessions are provided', () => {
    const applicationsSuccessRate = calcApplicationsSuccessRateOfFaction(
      faction1,
      [],
    );

    assert.isNull(applicationsSuccessRate);
  });

  test('is null when no votings are provided at all', () => {
    const sessions: SessionInput[] = [
      {
        session: session1,
        votings: [],
        speeches: [],
      }
    ];

    const applicationsSuccessRate = calcApplicationsSuccessRateOfFaction(
      faction1,
      sessions,
    );

    assert.isNull(applicationsSuccessRate);
  });

  test('is null when no applications are provided by faction', () => {
    const sessions: SessionInput[] = [
      {
        session: session1,
        votings: [
          {
            votingFilename: 'voting-1',
            videoTimestamp: '00:00:00',
            votingSubject: {
              agendaItem: 'Agenda Item 1',
              applicationId: 'app-1',
              title: 'Application 1',
              type: 'Antrag',
              authors: [faction2.name],
            },
            votes: []
          }
        ],
        speeches: [],
      }
    ];

    const applicationsSuccessRate = calcApplicationsSuccessRateOfFaction(
      faction1,
      sessions,
    );

    assert.isNull(applicationsSuccessRate);
  });

  test('is not null when application are provided by faction', () => {
    const sessions: SessionInput[] = [
      {
        session: session1,
        votings: [
          {
            votingFilename: 'voting-1',
            videoTimestamp: '00:00:00',
            votingSubject: {
              agendaItem: 'Agenda Item 1',
              applicationId: 'app-1',
              title: 'Application 1',
              type: 'Antrag',
              authors: [faction1.name],
            },
            votes: []
          }
        ],
        speeches: [],
      }
    ];

    const applicationsSuccessRate = calcApplicationsSuccessRateOfFaction(
      faction1,
      sessions,
    );

    assert.isNotNull(applicationsSuccessRate);
  });

  test('is 100% when all applications passed', () => {
    const sessions: SessionInput[] = [
      {
        session: session1,
        votings: [
          {
            votingFilename: 'voting-1',
            videoTimestamp: '00:00:00',
            votingSubject: {
              agendaItem: 'Agenda Item 1',
              applicationId: 'app-1',
              title: 'Application 1',
              type: 'Antrag',
              authors: [faction1.name],
            },
            votes: [
              { name: 'Member 1', vote: 'J' },
            ]
          }
        ],
        speeches: [],
      }
    ];

    const applicationsSuccessRate = calcApplicationsSuccessRateOfFaction(
      faction1,
      sessions,
    );

    assert.equal(applicationsSuccessRate, 1);
  });

  test('is 0% when no applications passed', () => {
    const sessions: SessionInput[] = [
      {
        session: session1,
        votings: [
          {
            votingFilename: 'voting-1',
            videoTimestamp: '00:00:00',
            votingSubject: {
              agendaItem: 'Agenda Item 1',
              applicationId: 'app-1',
              title: 'Application 1',
              type: 'Antrag',
              authors: [faction1.name],
            },
            votes: [
              { name: 'Member 1', vote: 'N' },
            ]
          }
        ],
        speeches: [],
      }
    ];

    const applicationsSuccessRate = calcApplicationsSuccessRateOfFaction(
      faction1,
      sessions,
    );

    assert.equal(applicationsSuccessRate, 0);
  });

  test('is 40% when two out of five applications passed', () => {
    const sessions: SessionInput[] = [
      {
        session: session1,
        votings: [
          {
            votingFilename: 'voting-1',
            videoTimestamp: '00:00:00',
            votingSubject: {
              agendaItem: 'Agenda Item 1',
              applicationId: 'app-1',
              title: 'Application 1',
              type: 'Antrag',
              authors: [faction1.name],
            },
            votes: [
              { name: 'Member 1', vote: 'J' },
            ]
          },
          {
            votingFilename: 'voting-2',
            videoTimestamp: '00:00:00',
            votingSubject: {
              agendaItem: 'Agenda Item 2',
              applicationId: 'app-2',
              title: 'Application 2',
              type: 'Antrag',
              authors: [faction1.name],
            },
            votes: [
              { name: 'Member 1', vote: 'J' },
            ]
          },
          {
            votingFilename: 'voting-3',
            videoTimestamp: '00:00:00',
            votingSubject: {
              agendaItem: 'Agenda Item 3',
              applicationId: 'app-3',
              title: 'Application 3',
              type: 'Antrag',
              authors: [faction1.name],
            },
            votes: [
              { name: 'Member 1', vote: 'N' },
            ]
          },
          {
            votingFilename: 'voting-4',
            videoTimestamp: '00:00:00',
            votingSubject: {
              agendaItem: 'Agenda Item 4',
              applicationId: 'app-4',
              title: 'Application 4',
              type: 'Antrag',
              authors: [faction1.name],
            },
            votes: [
              { name: 'Member 1', vote: 'N' },
            ]
          },
          {
            votingFilename: 'voting-5',
            videoTimestamp: '00:00:00',
            votingSubject: {
              agendaItem: 'Agenda Item 5',
              applicationId: 'app-5',
              title: 'Application 5',
              type: 'Antrag',
              authors: [faction1.name],
            },
            votes: [
              { name: 'Member 1', vote: 'N' },
            ]
          }
        ],
        speeches: [],
      }
    ];

    const applicationsSuccessRate = calcApplicationsSuccessRateOfFaction(
      faction1,
      sessions,
    );

    assert.equal(applicationsSuccessRate, .4);
  });

  test('counts partial votings proportionately', () => {
    const sessions: SessionInput[] = [
      {
        session: session1,
        votings: [
          {
            votingFilename: 'voting-1',
            videoTimestamp: '00:00:00',
            votingSubject: {
              agendaItem: 'Agenda Item 1',
              applicationId: 'app-1',
              title: 'Application 1',
              type: 'Antrag',
              authors: [faction1.name],
            },
            votes: [
              { name: 'Member 1', vote: 'J' },
            ]
          },
          {
            votingFilename: 'voting-2',
            videoTimestamp: '00:00:00',
            votingSubject: {
              agendaItem: 'Agenda Item 2',
              applicationId: 'app-2',
              title: 'Application 2',
              type: 'Antrag',
              authors: [faction1.name],
            },
            votes: [
              { name: 'Member 1', vote: 'J' },
            ]
          },
          {
            votingFilename: 'voting-3',
            videoTimestamp: '00:00:00',
            votingSubject: {
              agendaItem: 'Agenda Item 2',
              applicationId: 'app-2',
              title: 'Application 2',
              type: 'Antrag',
              authors: [faction1.name],
            },
            votes: [
              { name: 'Member 1', vote: 'N' },
            ]
          }
        ],
        speeches: [],
      }
    ];

    const applicationsSuccessRate = calcApplicationsSuccessRateOfFaction(
      faction1,
      sessions,
    );

    assert.equal(applicationsSuccessRate, .75);
  });

});
