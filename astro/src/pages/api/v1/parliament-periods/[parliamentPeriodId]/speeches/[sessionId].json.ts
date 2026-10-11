import { getStaticPaths as getStaticParliamentPeriodPaths } from '../../[parliamentPeriodId].json.ts';
import { generateMeta } from '../../../_helpers.ts';
import { getEntry } from 'astro:content';
import type { Registry, RegistrySession } from '@models/registry.ts';
import type { SessionSpeech } from '@models/session-speech.ts';
import type { AiTextAssessmentLabel } from '@models/ai-text-assessment.ts';
import { isAiTextAssessmentVisible } from '@utils/ai-text-assessment-visibility.ts';

export const getStaticPaths = async () => {
  const paths = await getStaticParliamentPeriodPaths();
  return paths.flatMap((path) =>
    path.props.parliamentPeriod.sessions.map((session) => ({
      params: {
        parliamentPeriodId: path.params.parliamentPeriodId,
        sessionId: session.id,
      },
      props: {
        parliamentPeriod: path.props.parliamentPeriod,
        session,
      },
    })),
  );
};

export async function GET({
  params,
  props,
}: {
  params: { parliamentPeriodId: string; sessionId: string };
  props: { parliamentPeriod: Registry; session: RegistrySession };
}) {
  const { parliamentPeriodId, sessionId } = params;

  const sessionSpeechesEntry = await getEntry(
    'sessionSpeeches',
    `${parliamentPeriodId}/${sessionId}`,
  );
  const { data: sessionSpeeches } = sessionSpeechesEntry || {};
  if (!sessionSpeeches) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const { parliamentPeriod } = props;
  const personsMap = new Map(
    parliamentPeriod.persons.map((person) => [person.name, person]),
  );
  const data = sessionSpeeches
    .filter((speech) => !speech.isChairPerson)
    .filter((speech) => !!speech.transcription)
    .map((speech) => {
      const person = personsMap.get(speech.speaker);
      return {
        personId: person ? person.id : null,
        speaker: person?.name || speech.speaker,
        start: speech.start,
        duration: speech.duration,
        onBehalfOf: speech.onBehalfOf,
        transcription: speech.transcription,
        ...getExposedAiTextAssessment(speech),
      };
    });

  const response = {
    meta: generateMeta(),
    data,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getExposedAiTextAssessment(
  speech: SessionSpeech,
): { aiTextAssessment: AiTextAssessmentLabel } | Record<string, never> {
  if (!isAiTextAssessmentVisible(speech)) {
    return {};
  }

  return { aiTextAssessment: speech.aiTextAssessment.label };
}
