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
  params,
  props
}: {
  params: { parliamentPeriodId: string };
  props: { parliamentPeriod: Registry };
}) {
  const { parliamentPeriodId } = params;

  const meta = generateMeta();

  const { parliamentPeriod } = props;

  const response = { meta, parliamentPeriod };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export const getStaticPaths = getStaticParliamentPeriodPaths;
