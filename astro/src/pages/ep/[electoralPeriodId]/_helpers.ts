import type { GetStaticPaths, InferGetStaticPropsType } from 'astro';
import { getCollection } from 'astro:content';
import type { SessionInput } from '@models/SessionInput.ts';

export type ElectoralPeriodProps = InferGetStaticPropsType<
  typeof getElectoralPeriodStaticPaths
>;

export const getElectoralPeriodStaticPaths = (async () => {
  const electoralPeriods = await getCollection('electoralPeriods');
  const scrapedMeetings = await getCollection('scrapedMeetings');
  const scrapedAgendaItems = await getCollection('scrapedAgendaItems');
  const scrapedPapers = await getCollection('scrapedPapers');
  const scrapedFiles = await getCollection('scrapedFiles');
  return electoralPeriods.map((electoralPeriod) => {
    return {
      params: { electoralPeriodId: electoralPeriod.id },
      props: {
        electoralPeriod: electoralPeriod.data,
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

export type ElectoralPeriodWithSessionsProps = InferGetStaticPropsType<
  typeof getElectoralPeriodWithSessionsPaths
>;

export const getElectoralPeriodWithSessionsPaths = (async () => {
  const sessionConfigsCollection = await getCollection('sessionConfigs');
  const sessionSpeechesCollection = await getCollection('sessionSpeeches');
  const sessionScansCollection = await getCollection('sessionScans');

  const electoralPeriodStaticPaths = await getElectoralPeriodStaticPaths();
  return electoralPeriodStaticPaths.map((path) => {
    const { electoralPeriod } = path.props;

    const sessionConfigs = sessionConfigsCollection
      .filter((sessionConfig) =>
        sessionConfig.id.startsWith(`${electoralPeriod.id}/`),
      )
      .map((sessionConfig) => ({
        sessionId: sessionConfig.id,
        config: sessionConfig.data,
      }));
    const sessionScans = sessionScansCollection
      .filter((sessionScan) =>
        sessionScan.id.startsWith(`${electoralPeriod.id}/`),
      )
      .map((sessionScan) => ({
        sessionId: sessionScan.id,
        scan: sessionScan.data,
      }));
    const sessionSpeeches = sessionSpeechesCollection
      .filter((sessionSpeech) =>
        sessionSpeech.id.startsWith(`${electoralPeriod.id}/`),
      )
      .map((sessionSpeech) => ({
        sessionId: sessionSpeech.id,
        speeches: sessionSpeech.data,
      }));

    const sessionInputs = sessionConfigs.map((sessionConfig) => {
      const sessionScan = sessionScans.find(
        (sessionScan) => sessionScan.sessionId === sessionConfig.sessionId,
      );
      const speeches = sessionSpeeches
        .filter(
          (sessionSpeech) =>
            sessionSpeech.sessionId === sessionConfig.sessionId,
        )
        .flatMap((sessionSpeech) => sessionSpeech.speeches);
      return {
        sessionId: sessionConfig.sessionId.split('/')[1],
        config: sessionConfig.config,
        votings: sessionScan?.scan || [],
        speeches,
      } as SessionInput;
    });
    const { scrapedMeetings, scrapedAgendaItems, scrapedPapers, scrapedFiles } =
      path.props;
    return {
      params: { electoralPeriodId: electoralPeriod.id },
      props: {
        electoralPeriod,
        sessionInputs,
        scrapedMeetings,
        scrapedAgendaItems,
        scrapedPapers,
        scrapedFiles,
      },
    };
  });
}) satisfies GetStaticPaths;

export type ElectoralPeriodWithSessionProps = InferGetStaticPropsType<
  typeof getElectoralPeriodWithSessionPaths
>;

export const getElectoralPeriodWithSessionPaths = async () => {
  const electoralPeriodWithSessionsStaticPaths =
    await getElectoralPeriodWithSessionsPaths();
  return electoralPeriodWithSessionsStaticPaths.flatMap((path) => {
    const {
      electoralPeriod,
      sessionInputs,
      scrapedMeetings,
      scrapedAgendaItems,
      scrapedPapers,
      scrapedFiles,
    } = path.props;
    return sessionInputs.map((sessionInput) => ({
      params: {
        electoralPeriodId: electoralPeriod.id,
        sessionId: sessionInput.sessionId,
      },
      props: {
        electoralPeriod,
        sessionInput,
        scrapedMeetings,
        scrapedAgendaItems,
        scrapedPapers,
        scrapedFiles,
      },
    }));
  });
};

export type ElectoralPeriodWithFactionProps = InferGetStaticPropsType<
  typeof getElectoralPeriodWithFactionPaths
>;

export const getElectoralPeriodWithFactionPaths = async () => {
  const electoralPeriodWithSessionsStaticPaths =
    await getElectoralPeriodWithSessionsPaths();
  return electoralPeriodWithSessionsStaticPaths.flatMap((path) => {
    const {
      electoralPeriod,
      sessionInputs,
      scrapedMeetings,
      scrapedAgendaItems,
      scrapedPapers,
      scrapedFiles,
    } = path.props;
    return electoralPeriod.factions.map((faction) => ({
      params: {
        electoralPeriodId: electoralPeriod.id,
        factionId: faction.id,
      },
      props: {
        electoralPeriod,
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

export type ElectoralPeriodWithPartyProps = InferGetStaticPropsType<
  typeof getElectoralPeriodWithPartyPaths
>;

export const getElectoralPeriodWithPartyPaths = async () => {
  const electoralPeriodWithSessionsStaticPaths =
    await getElectoralPeriodWithSessionsPaths();
  return electoralPeriodWithSessionsStaticPaths.flatMap((path) => {
    const {
      electoralPeriod,
      sessionInputs,
      scrapedMeetings,
      scrapedAgendaItems,
      scrapedPapers,
      scrapedFiles,
    } = path.props;
    return electoralPeriod.parties.map((party) => ({
      params: {
        electoralPeriodId: electoralPeriod.id,
        partyId: party.id,
      },
      props: {
        electoralPeriod,
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

export type ElectoralPeriodWithSessionAndVotingProps = InferGetStaticPropsType<
  typeof getElectoralPeriodWithSessionAndVotingPaths
>;

export const getElectoralPeriodWithSessionAndVotingPaths = async () => {
  const paths = await getElectoralPeriodWithSessionPaths();

  return paths.flatMap((path) => {
    const {
      electoralPeriod,
      sessionInput,
      scrapedMeetings,
      scrapedAgendaItems,
      scrapedPapers,
    } = path.props;

    return sessionInput.votings.map((voting) => {
      return {
        params: {
          electoralPeriodId: electoralPeriod.id,
          sessionId: sessionInput.sessionId,
          votingId: +voting.votingFilename.substring(11, 14),
        },
        props: {
          electoralPeriod,
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

export type ElectoralPeriodWithPersonProps = InferGetStaticPropsType<
  typeof getElectoralPeriodWithPersonPaths
>;

export const getElectoralPeriodWithPersonPaths = async () => {
  const electoralPeriodWithSessionsStaticPaths =
    await getElectoralPeriodWithSessionsPaths();
  return electoralPeriodWithSessionsStaticPaths.flatMap((path) => {
    const { electoralPeriod, sessionInputs } = path.props;
    return electoralPeriod.persons.map((person) => ({
      params: {
        electoralPeriodId: electoralPeriod.id,
        personId: person.id,
      },
      props: {
        electoralPeriod,
        sessionInputs,
        person,
      },
    }));
  });
};
