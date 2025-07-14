import type { GetStaticPaths, InferGetStaticPropsType } from 'astro';
import { getCollection } from 'astro:content';
import type { SessionInput } from '@models/SessionInput.ts';

export const getParliamentPeriodStaticPaths = (async () => {
  const parliamentPeriods = await getCollection('parliamentPeriods');
  const scrapedMeetings = await getCollection('scrapedMeetings');
  const scrapedAgendaItems = await getCollection('scrapedAgendaItems');
  const scrapedPapers = await getCollection('scrapedPapers');
  const scrapedFiles = await getCollection('scrapedFiles');
  return parliamentPeriods.map((parliamentPeriod) => {
    return {
      params: { parliamentPeriodId: parliamentPeriod.id },
      props: {
        parliamentPeriod: parliamentPeriod.data,
        scrapedMeetings: scrapedMeetings.map(meeting => meeting.data),
        scrapedAgendaItems: scrapedAgendaItems.map(
          (agendaItem) => agendaItem.data,
        ),
        scrapedPapers: scrapedPapers.map((paper) => paper.data),
        scrapedFiles: scrapedFiles.map((file) => file.data),
      },
    };
  });
}) satisfies GetStaticPaths;

export type ParliamentPeriodWithSessionsProps = InferGetStaticPropsType<
  typeof getParliamentPeriodWithSessionsPaths
>;

export const getParliamentPeriodWithSessionsPaths = (async () => {
  const sessionSpeechesCollection = await getCollection('sessionSpeeches');
  const sessionScansCollection = await getCollection('sessionScans');

  const parliamentPeriodStaticPaths = await getParliamentPeriodStaticPaths();
  return parliamentPeriodStaticPaths.map((path) => {
    const { parliamentPeriod } = path.props;

    const sessionScans = sessionScansCollection
      .filter((sessionScan) =>
        sessionScan.id.startsWith(`${parliamentPeriod.id}/`),
      )
      .map((sessionScan) => ({
        sessionId: sessionScan.id,
        scan: sessionScan.data,
      }));
    const sessionSpeeches = sessionSpeechesCollection
      .filter((sessionSpeech) =>
        sessionSpeech.id.startsWith(`${parliamentPeriod.id}/`),
      )
      .map((sessionSpeech) => ({
        sessionId: sessionSpeech.id,
        speeches: sessionSpeech.data,
      }));

    const sessionInputs = parliamentPeriod.sessions.map((session) => {
      const sessionScan = sessionScans.find(
        (sessionScan) =>
          sessionScan.sessionId === `${parliamentPeriod.id}/${session.id}`
      );
      const speeches = sessionSpeeches
        .filter(
          (sessionSpeech) =>
            sessionSpeech.sessionId === `${parliamentPeriod.id}/${session.id}`
        )
        .flatMap((sessionSpeech) => sessionSpeech.speeches);
      return {
        session,
        votings: sessionScan?.scan || [],
        speeches,
      } as SessionInput;
    });
    const { scrapedMeetings, scrapedAgendaItems, scrapedPapers, scrapedFiles } = path.props;
    return {
      params: { parliamentPeriodId: parliamentPeriod.id },
      props: {
        parliamentPeriod,
        sessionInputs,
        scrapedMeetings,
        scrapedAgendaItems,
        scrapedPapers,
        scrapedFiles,
      },
    };
  });
}) satisfies GetStaticPaths;

export type ParliamentPeriodWithSessionProps = InferGetStaticPropsType<
  typeof getParliamentPeriodWithSessionPaths
>;

export const getParliamentPeriodWithSessionPaths = async () => {
  const parliamentPeriodWithSessionsStaticPaths =
    await getParliamentPeriodWithSessionsPaths();
  return parliamentPeriodWithSessionsStaticPaths.flatMap((path) => {
    const {
      parliamentPeriod,
      sessionInputs,
      scrapedMeetings,
      scrapedAgendaItems,
      scrapedPapers,
      scrapedFiles,
    } = path.props;
    return sessionInputs.map((sessionInput) => ({
      params: {
        parliamentPeriodId: parliamentPeriod.id,
        sessionId: sessionInput.session.id,
      },
      props: {
        parliamentPeriod,
        sessionInput,
        scrapedMeetings,
        scrapedAgendaItems,
        scrapedPapers,
        scrapedFiles,
      },
    }));
  });
};

export type ParliamentPeriodWithFactionProps = InferGetStaticPropsType<
  typeof getParliamentPeriodWithFactionPaths
>;

export const getParliamentPeriodWithFactionPaths = async () => {
  const parliamentPeriodWithSessionsStaticPaths =
    await getParliamentPeriodWithSessionsPaths();
  return parliamentPeriodWithSessionsStaticPaths.flatMap((path) => {
    const {
      parliamentPeriod,
      sessionInputs,
      scrapedMeetings,
      scrapedAgendaItems,
      scrapedPapers,
      scrapedFiles,
    } = path.props;
    return parliamentPeriod.factions.map((faction) => ({
      params: {
        parliamentPeriodId: parliamentPeriod.id,
        factionId: faction.id,
      },
      props: {
        parliamentPeriod,
        faction,
        sessionInputs,
        scrapedMeetings,
        scrapedAgendaItems,
        scrapedPapers,
        scrapedFiles,
      },
    }));
  });
};

export type ParliamentPeriodWithPartyProps = InferGetStaticPropsType<
  typeof getParliamentPeriodWithPartyPaths
>;

export const getParliamentPeriodWithPartyPaths = async () => {
  const parliamentPeriodWithSessionsStaticPaths =
    await getParliamentPeriodWithSessionsPaths();
  return parliamentPeriodWithSessionsStaticPaths.flatMap((path) => {
    const {
      parliamentPeriod,
      sessionInputs,
      scrapedMeetings,
      scrapedAgendaItems,
      scrapedPapers,
      scrapedFiles,
    } = path.props;
    return parliamentPeriod.parties.map((party) => ({
      params: {
        parliamentPeriodId: parliamentPeriod.id,
        partyId: party.id,
      },
      props: {
        parliamentPeriod,
        party,
        sessionInputs,
        scrapedMeetings,
        scrapedAgendaItems,
        scrapedPapers,
        scrapedFiles,
      },
    }));
  });
};

export type ParliamentPeriodWithSessionAndVotingProps = InferGetStaticPropsType<
  typeof getParliamentPeriodWithSessionAndVotingPaths
>;

export const getParliamentPeriodWithSessionAndVotingPaths = async () => {
  const paths = await getParliamentPeriodWithSessionPaths();

  return paths.flatMap((path) => {
    const {
      parliamentPeriod,
      sessionInput,
      scrapedMeetings,
      scrapedAgendaItems,
      scrapedPapers,
    } = path.props;

    return sessionInput.votings.map((voting) => {
      return {
        params: {
          parliamentPeriodId: parliamentPeriod.id,
          sessionId: sessionInput.session.id,
          votingId: +voting.votingFilename.substring(11, 14),
        },
        props: {
          parliamentPeriod,
          sessionInput,
          scrapedMeetings,
          scrapedAgendaItems,
          scrapedPapers,
          voting,
        },
      };
    });
  });
};

export type ParliamentPeriodWithPersonProps = InferGetStaticPropsType<
  typeof getParliamentPeriodWithPersonPaths
>;

export const getParliamentPeriodWithPersonPaths = async () => {
  const parliamentPeriodWithSessionsStaticPaths =
    await getParliamentPeriodWithSessionsPaths();
  return parliamentPeriodWithSessionsStaticPaths.flatMap((path) => {
    const { parliamentPeriod, sessionInputs } = path.props;
    return parliamentPeriod.persons.map((person) => ({
      params: {
        parliamentPeriodId: parliamentPeriod.id,
        personId: person.id,
      },
      props: {
        parliamentPeriod,
        sessionInputs,
        person,
      },
    }));
  });
};
