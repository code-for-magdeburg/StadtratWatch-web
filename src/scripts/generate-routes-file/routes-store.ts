export interface IRoutesStore {
  writeRoutes(routes: string[]): void;
}


export class RoutesStore implements IRoutesStore {


  constructor(private readonly directory: string) {
  }


  public writeRoutes(routes: string[]): void {
    Deno.writeTextFileSync(`${this.directory}/routes.txt`, routes.join('\n'));
  }


}
