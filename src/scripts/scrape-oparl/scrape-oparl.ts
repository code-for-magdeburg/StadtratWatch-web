import * as path from '@std/path';
import { existsSync } from '@std/fs/exists';


export type OparlSystem = {
  organization: string;
  person: string;
  meeting: string;
  paper: string;
  membership: string;
  locationList: string;
  agendaItem: string;
  consultations: string;
  files: string;
};


export type OparlObject = {
  id: string;
};


export interface IOparlObjectFileStore {
  saveObjects(objects: OparlObject[], filename: string): void;
  loadObjects(filename: string): OparlObject[];
}


export class OparlObjectsFileStore implements IOparlObjectFileStore {


  constructor(private readonly directory: string) {
  }


  public saveObjects(objects: OparlObject[], filename: string): void {
    Deno.writeTextFileSync(
      this.getObjectFilePath(filename),
      JSON.stringify(objects, null, 2)
    );
  }


  public loadObjects(filename: string): OparlObject[] {
    const objectsJson = Deno.readTextFileSync(this.getObjectFilePath(filename));
    return JSON.parse(objectsJson) as OparlObject[];
  }


  private getObjectFilePath(filename: string) {
    return path.join(this.directory, filename);
  }


}


export class OparlScraper {


  constructor(private readonly client: OparlSystemClient, private readonly oparlObjectsStore: IOparlObjectFileStore) {}


  public async fetchFull(oparlSystemUrl: string, createdSince: string): Promise<void> {

    console.log(`Fetching all data created since ${createdSince}...`);

    const oparlSystem = await this.fetchOparlSystem(oparlSystemUrl);

    await this.fetchAndStoreObjects(oparlSystem.organization, createdSince, 'organizations.json');
    await this.fetchAndStoreObjects(oparlSystem.person, createdSince, 'persons.json');
    await this.fetchAndStoreObjects(oparlSystem.meeting, createdSince, 'meetings.json');
    await this.fetchAndStoreObjects(oparlSystem.paper, createdSince, 'papers.json');
    await this.fetchAndStoreObjects(oparlSystem.membership, createdSince, 'memberships.json');
    await this.fetchAndStoreObjects(oparlSystem.locationList, createdSince, 'locations.json');
    await this.fetchAndStoreObjects(oparlSystem.agendaItem, createdSince, 'agenda-items.json');
    await this.fetchAndStoreObjects(oparlSystem.consultations, createdSince, 'consultations.json');
    await this.fetchAndStoreObjects(oparlSystem.files, createdSince, 'files.json');

  }


  public async fetchIncremental(oparlSystemUrl: string, modifiedSince: string): Promise<void> {

    console.log(`Fetching changes since ${modifiedSince}...`);

    const oparlSystem = await this.fetchOparlSystem(oparlSystemUrl);

    await this.fetchAndStoreIncrementalObjects(oparlSystem.organization, modifiedSince, 'organizations.json');
    await this.fetchAndStoreIncrementalObjects(oparlSystem.person, modifiedSince, 'persons.json');
    await this.fetchAndStoreIncrementalObjects(oparlSystem.meeting, modifiedSince, 'meetings.json');
    await this.fetchAndStoreIncrementalObjects(oparlSystem.paper, modifiedSince, 'papers.json');
    await this.fetchAndStoreIncrementalObjects(oparlSystem.membership, modifiedSince, 'memberships.json');
    await this.fetchAndStoreIncrementalObjects(oparlSystem.locationList, modifiedSince, 'locations.json');
    await this.fetchAndStoreIncrementalObjects(oparlSystem.agendaItem, modifiedSince, 'agenda-items.json');
    await this.fetchAndStoreIncrementalObjects(oparlSystem.consultations, modifiedSince, 'consultations.json');
    await this.fetchAndStoreIncrementalObjects(oparlSystem.files, modifiedSince, 'files.json');

  }


  private async fetchOparlSystem(oparlSystemUrl: string): Promise<OparlSystem> {
    const response = await fetch(oparlSystemUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch OParl system from ${oparlSystemUrl}: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }


  private async fetchAndStoreObjects(objectsUrl: string, createdSince: string | null, filename: string): Promise<void> {
    const objects = await this.client.fetchObjects(objectsUrl, createdSince);
    this.oparlObjectsStore.saveObjects(objects, filename);
  }


  private async fetchAndStoreIncrementalObjects(objectsUrl: string, modifiedSince: string,
                                                filename: string): Promise<void> {

    const modifiedObjects = await this.client.fetchModifiedObjects(objectsUrl, modifiedSince);
    if (modifiedObjects.length === 0) {
      console.log('No modified objects found.');
      return;
    }

    const existingObjects = this.oparlObjectsStore.loadObjects(filename);
    const updatedObjects = this.updateObjects(existingObjects, modifiedObjects);
    this.oparlObjectsStore.saveObjects(updatedObjects, filename);

  }


  private updateObjects(existingObjects: OparlObject[], modifiedObjects: OparlObject[]): OparlObject[] {

    const updatedObjects = [...existingObjects];

    for (const modifiedObject of modifiedObjects) {
      const index = updatedObjects.findIndex(obj => obj.id === modifiedObject.id);
      if (index !== -1) {
        updatedObjects[index] = modifiedObject;
      } else {
        updatedObjects.push(modifiedObject);
      }
    }

    return updatedObjects;

  }


}


export class OparlSystemClient {


  constructor(private readonly fetchDelayMs: number) {}


  public async fetchObjects(objectsUrl: string, createdSince: string | null): Promise<OparlObject[]> {

    console.log('Fetching objects from', objectsUrl);

    let pageIndex = 1;
    const objects = [];

    let url = OparlSystemClient.buildUrlWithParams(objectsUrl, createdSince);
    while (url) {

      const response = await fetch(url);
      if (response.ok) {
        const page = await response.json();
        objects.push(...page.data);

        pageIndex++;
        url = OparlSystemClient.buildUrlWithParams(page.links.next, createdSince);

        await new Promise(resolve => setTimeout(resolve, this.fetchDelayMs));
      } else {
        console.error('Failed to fetch objects:', response.status, response.statusText);
        url = null;
      }

    }

    console.log('Fetched', objects.length, 'objects.');

    return Promise.resolve(objects);

  }


  public async fetchModifiedObjects(objectsUrl: string, modifiedSince: string): Promise<OparlObject[]> {

    console.log('Fetching objects from', objectsUrl);

    let pageIndex = 1;
    const objects = [];

    let url = OparlSystemClient.buildUrlWithModifiedSinceParams(objectsUrl, modifiedSince);
    while (url) {

      console.log('Fetching page: ', pageIndex);

      const response = await fetch(url);
      if (response.ok) {
        const page = await response.json();
        objects.push(...page.data);

        pageIndex++;
        url = OparlSystemClient.buildUrlWithModifiedSinceParams(page.links.next, modifiedSince);

        await new Promise(resolve => setTimeout(resolve, this.fetchDelayMs));
      } else {
        console.error('Failed to fetch objects:', response.status, response.statusText);
        url = null;
      }

    }

    console.log('Fetched', objects.length, 'objects.');

    return Promise.resolve(objects);

  }


  private static buildUrlWithParams(baseUrl: string, createdSince: string | null): URL | null {
    if (!baseUrl) {
      return null;
    }

    const url = new URL(baseUrl);
    if (createdSince) {
      url.searchParams.set('created_since', createdSince);
      url.searchParams.set('omit_internal', 'true');
    }

    return url;
  }


  private static buildUrlWithModifiedSinceParams(baseUrl: string, modifiedSince: string): URL | null {
    if (!baseUrl) {
      return null;
    }

    const url = this.buildUrlWithParams(baseUrl, null);
    if (url) {
      url.searchParams.set('modified_since', modifiedSince);
    }

    return url;
  }


}


export interface IScraperMetadataStore {
  getLastSuccessfulRunDate(): string | null;
  setLastSuccessfulRunDate(date: string): void;
}


export class ScraperMetadataFileStore implements IScraperMetadataStore {


  constructor(private readonly directory: string) {
  }


  public getLastSuccessfulRunDate(): string | null {
    const metadataFilePath = this.getMetadataFilePath();
    if (!existsSync(metadataFilePath)) {
      return null;
    }

    return Deno.readTextFileSync(metadataFilePath);
  }


  public setLastSuccessfulRunDate(date: string): void {
    Deno.writeTextFileSync(this.getMetadataFilePath(), date);
  }


  private getMetadataFilePath(): string {
    return path.join(this.directory, 'scraper-metadata.txt');
  }


}
