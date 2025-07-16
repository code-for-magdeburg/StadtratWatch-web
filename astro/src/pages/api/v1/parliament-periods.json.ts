import { getCollection } from 'astro:content';
import { generateMeta } from './_helpers.ts';

export async function GET() {
  const parliamentPeriodsCollection = await getCollection('parliamentPeriods');

  const parliamentPeriods = parliamentPeriodsCollection.map((p) => {
    const { data } = p;
    return {
      id: data.id,
      name: data.name,
      lastUpdate: data.lastUpdate,
    };
  });

  const response = {
    meta: generateMeta(),
    data: parliamentPeriods,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
