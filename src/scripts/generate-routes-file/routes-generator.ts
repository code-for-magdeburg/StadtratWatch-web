import { IElectoralPeriodsSource } from './electoral-periods-source.ts';
import { IRoutesStore } from './routes-store.ts';


export class RoutesGenerator {


  constructor(private readonly electoralPeriodsSource: IElectoralPeriodsSource, private readonly routesStore: IRoutesStore) {
  }


  public generateRoutes(): void {

    const routes: string[] = [];

    routes.push('/'); // because of redirect to current electoral period

    const registries = this.electoralPeriodsSource.getElectoralPeriods();
    for (const registry of registries) {

      routes.push(`/ep/${registry.electoralPeriod}`);
      routes.push(`/ep/${registry.electoralPeriod}/parties`);
      routes.push(...registry.parties.map(party => `/ep/${registry.electoralPeriod}/party/${party.id}`));
      routes.push(`/ep/${registry.electoralPeriod}/factions`);
      routes.push(...registry.factions.map(faction => `/ep/${registry.electoralPeriod}/faction/${faction.id}`));
      routes.push(`/ep/${registry.electoralPeriod}/persons`);
      routes.push(...registry.persons.map(person => `/ep/${registry.electoralPeriod}/person/${person.id}`));

      routes.push(`/ep/${registry.electoralPeriod}/sessions`);
      routes.push(...registry.sessions.map(session => `/ep/${registry.electoralPeriod}/session/${session.id}`));
      for (const session of registry.sessions) {
        const sessionScan = this.electoralPeriodsSource.getSessionScan(session, registry.electoralPeriod);
        const votingIds = sessionScan.map((_, index: number) => index + 1);
        routes.push(...votingIds.map(votingId => `/ep/${registry.electoralPeriod}/session/${session.id}/voting/${votingId}`));
      }

    }

    this.routesStore.writeRoutes(routes);

  }


}
