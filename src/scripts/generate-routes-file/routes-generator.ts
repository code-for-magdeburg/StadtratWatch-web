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

      routes.push(`/ep/${registry.id}`);
      routes.push(`/ep/${registry.id}/parties`);
      routes.push(...registry.parties.map(party => `/ep/${registry.id}/party/${party.id}`));
      routes.push(`/ep/${registry.id}/factions`);
      routes.push(...registry.factions.map(faction => `/ep/${registry.id}/faction/${faction.id}`));
      routes.push(`/ep/${registry.id}/persons`);
      routes.push(...registry.persons.map(person => `/ep/${registry.id}/person/${person.id}`));

      routes.push(`/ep/${registry.id}/sessions`);
      routes.push(...registry.sessions.map(session => `/ep/${registry.id}/session/${session.id}`));
      for (const session of registry.sessions) {
        const sessionScan = this.electoralPeriodsSource.getSessionScan(session, registry.id);
        const votingIds = sessionScan.map((_, index: number) => index + 1);
        routes.push(...votingIds.map(votingId => `/ep/${registry.id}/session/${session.id}/voting/${votingId}`));
      }

    }

    this.routesStore.writeRoutes(routes);

  }


}
