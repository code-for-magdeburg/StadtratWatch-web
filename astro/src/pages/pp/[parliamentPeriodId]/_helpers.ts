import type { GetStaticPaths, InferGetStaticPropsType } from 'astro';
import { getCollection } from 'astro:content';
import type { SessionInput } from '@models/SessionInput';

const getParliamentPeriodStaticPaths = (async () => {
  const parliamentPeriods = await getCollection('parliamentPeriods');
  const oparlMeetings = (await getCollection('oparlMeetings')).filter(
    (meeting) =>
      meeting.data.organization &&
      meeting.data.organization.includes(
        'https://ratsinfo.magdeburg.de/oparl/bodies/0001/organizations/gr/1',
      ),
  );
  const oparlAgendaItems = (await getCollection('oparlAgendaItems')).filter(
    (agendaItem) =>
      agendaItem.data.meeting &&
      oparlMeetings.some((meeting) => meeting.id === agendaItem.data.meeting),
  );
  const oparlConsultations = (await getCollection('oparlConsultations')).filter(
    (consultation) =>
      consultation.data.meeting &&
      oparlMeetings.some((meeting) => meeting.id === consultation.data.meeting),
  );

  return parliamentPeriods.map((parliamentPeriod) => {
    return {
      params: { parliamentPeriodId: parliamentPeriod.id },
      props: {
        parliamentPeriod: parliamentPeriod.data,
        oparlMeetings: oparlMeetings.map((meeting) => meeting.data),
        oparlAgendaItems: oparlAgendaItems.map((agendaItem) => agendaItem.data),
        oparlConsultations: oparlConsultations.map(
          (consultation) => consultation.data,
        ),
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
          sessionScan.sessionId === `${parliamentPeriod.id}/${session.id}`,
      );
      const speeches = sessionSpeeches
        .filter(
          (sessionSpeech) =>
            sessionSpeech.sessionId === `${parliamentPeriod.id}/${session.id}`,
        )
        .flatMap((sessionSpeech) => sessionSpeech.speeches);
      return {
        session,
        votings: sessionScan?.scan || [],
        speeches,
      } as SessionInput;
    });
    const { oparlMeetings, oparlAgendaItems, oparlConsultations } = path.props;
    return {
      params: { parliamentPeriodId: parliamentPeriod.id },
      props: {
        parliamentPeriod,
        sessionInputs,
        oparlMeetings,
        oparlAgendaItems,
        oparlConsultations,
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
      oparlMeetings,
      oparlAgendaItems,
      oparlConsultations,
    } = path.props;
    return sessionInputs.map((sessionInput) => ({
      params: {
        parliamentPeriodId: parliamentPeriod.id,
        sessionId: sessionInput.session.id,
      },
      props: {
        parliamentPeriod,
        sessionInput,
        oparlMeetings,
        oparlAgendaItems,
        oparlConsultations,
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
      oparlMeetings,
      oparlAgendaItems,
      oparlConsultations,
    } = path.props as ParliamentPeriodWithSessionsProps;
    return parliamentPeriod.factions.map((faction) => ({
      params: {
        parliamentPeriodId: parliamentPeriod.id,
        factionId: faction.id,
      },
      props: {
        parliamentPeriod,
        faction,
        sessionInputs,
        oparlMeetings,
        oparlAgendaItems,
        oparlConsultations,
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
    const { parliamentPeriod, sessionInputs } = path.props;
    return parliamentPeriod.parties.map((party) => ({
      params: {
        parliamentPeriodId: parliamentPeriod.id,
        partyId: party.id,
      },
      props: { parliamentPeriod, party, sessionInputs },
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
      oparlMeetings,
      oparlAgendaItems,
      oparlConsultations,
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
          oparlMeetings,
          oparlAgendaItems,
          oparlConsultations,
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
      props: { parliamentPeriod, sessionInputs, person },
    }));
  });
};
