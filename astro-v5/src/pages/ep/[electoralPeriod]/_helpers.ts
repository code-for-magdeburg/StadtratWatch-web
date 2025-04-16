import type {GetStaticPaths, InferGetStaticPropsType} from "astro";
import {getCollection} from "astro:content";


export type ElectoralPeriodProps = InferGetStaticPropsType<typeof getElectoralPeriodStaticPaths>;


export const getElectoralPeriodStaticPaths = (async () => {
  const electoralPeriods = await getCollection('electoralPeriods');
  return electoralPeriods.map(electoralPeriod => ({
    params: { electoralPeriod: electoralPeriod.id },
    props: { electoralPeriod: electoralPeriod.data}
  }));
}) satisfies GetStaticPaths;
