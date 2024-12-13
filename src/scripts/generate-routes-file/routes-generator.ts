import { IElectoralPeriodsSource } from './electoral-periods-source.ts';
import { IRoutesStore } from './routes-store.ts';


export class RoutesGenerator {


  constructor(private readonly electoralPeriodsSource: IElectoralPeriodsSource, private readonly routesStore: IRoutesStore) {
  }


  public generateRoutes(): void {

    const routes: string[] = [];

    routes.push('/'); // because of redirect to current electoral period

    const electoralPeriods = this.electoralPeriodsSource.getElectoralPeriods();
    for (const electoralPeriod of electoralPeriods) {

      routes.push(`/ep/${electoralPeriod.registry.electoralPeriod}`);
      routes.push(`/ep/${electoralPeriod.registry.electoralPeriod}/parties`);
      routes.push(...electoralPeriod.registry.parties.map(party => `/ep/${electoralPeriod.registry.electoralPeriod}/party/${party.id}`));
      routes.push(`/ep/${electoralPeriod.registry.electoralPeriod}/factions`);
      routes.push(...electoralPeriod.registry.factions.map(faction => `/ep/${electoralPeriod.registry.electoralPeriod}/faction/${faction.id}`));
      routes.push(`/ep/${electoralPeriod.registry.electoralPeriod}/persons`);
      routes.push(...electoralPeriod.registry.persons.map(person => `/ep/${electoralPeriod.registry.electoralPeriod}/person/${person.id}`));

      routes.push(`/ep/${electoralPeriod.registry.electoralPeriod}/sessions`);
      routes.push(...electoralPeriod.registry.sessions.map(session => `/ep/${electoralPeriod.registry.electoralPeriod}/session/${session.id}`));
      for (const session of electoralPeriod.registry.sessions) {
        const sessionScan = this.electoralPeriodsSource.getSessionScan(session, electoralPeriod.electoralPeriodDir);
        const votingIds = sessionScan.map((_, index: number) => index + 1);
        routes.push(...votingIds.map(votingId => `/ep/${electoralPeriod.registry.electoralPeriod}/session/${session.id}/voting/${votingId}`));
      }

    }

    this.routesStore.writeRoutes(routes);

  }


}
