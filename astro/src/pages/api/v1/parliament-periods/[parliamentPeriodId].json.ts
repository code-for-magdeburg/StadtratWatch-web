import { getCollection } from 'astro:content';
import { generateMeta } from '../_helpers.ts';
import type { Registry } from '@models/registry.ts';

async function getStaticParliamentPeriodPaths() {
  const parliamentPeriods = await getCollection('parliamentPeriods');
  return parliamentPeriods.map((parliamentPeriod) => ({
    params: { parliamentPeriodId: parliamentPeriod.id },
    props: { parliamentPeriod: parliamentPeriod.data },
  }));
}

export async function GET({
  props,
}: {
  params: { parliamentPeriodId: string };
  props: { parliamentPeriod: Registry };
}) {
  const response = {
    meta: generateMeta(),
    parliamentPeriod: props.parliamentPeriod,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export const getStaticPaths = getStaticParliamentPeriodPaths;
