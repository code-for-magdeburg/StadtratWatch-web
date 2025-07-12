import { getCollection, getEntry } from 'astro:content';
import type { GetStaticPaths } from 'astro';
import { generateMeta } from '../_helpers.ts';

export const getStaticPaths = (async () => {
  const electoralPeriods = await getCollection('electoralPeriods');
  return electoralPeriods.map((electoralPeriod) => ({
    params: { id: electoralPeriod.id },
  }));
}) satisfies GetStaticPaths;

export async function GET({ params }: { params: { id: string } }) {
  const { id } = params;

  const electoralPeriodEntry = await getEntry('electoralPeriods', id);
  const { data } = electoralPeriodEntry || {};
  if (!data) {
    return new Response(null, {
      status: 404,
      statusText: 'Not found',
    });
  }

  const meta = generateMeta();

  const response = {
    meta,
    data,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
