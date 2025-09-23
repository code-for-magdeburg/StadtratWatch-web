import * as path from '@std/path';
import { existsSync } from '@std/fs/exists';


export enum OparlObjectType {
  Organization,
  Person,
  Meeting,
  Paper,
  Membership,
  Location,
  AgendaItem,
  Consultation,
  File,
}

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

    await this.fetchAndStoreObjects(oparlSystem.organization, createdSince, OparlObjectType.Organization);
    await this.fetchAndStoreObjects(oparlSystem.person, createdSince, OparlObjectType.Person);
    await this.fetchAndStoreObjects(oparlSystem.meeting, createdSince, OparlObjectType.Meeting);
    await this.fetchAndStoreObjects(oparlSystem.paper, createdSince, OparlObjectType.Paper);
    await this.fetchAndStoreObjects(oparlSystem.membership, createdSince, OparlObjectType.Membership);
    await this.fetchAndStoreObjects(oparlSystem.locationList, createdSince, OparlObjectType.Location);
    await this.fetchAndStoreObjects(oparlSystem.agendaItem, createdSince, OparlObjectType.AgendaItem);
    await this.fetchAndStoreObjects(oparlSystem.consultations, createdSince, OparlObjectType.Consultation);
    await this.fetchAndStoreObjects(oparlSystem.files, createdSince, OparlObjectType.File);

  }


  public async fetchIncremental(oparlSystemUrl: string, modifiedSince: string): Promise<void> {

    console.log(`Fetching changes since ${modifiedSince}...`);

    const oparlSystem = await this.fetchOparlSystem(oparlSystemUrl);

    await this.fetchAndStoreIncrementalObjects(oparlSystem.organization, modifiedSince, OparlObjectType.Organization);
    await this.fetchAndStoreIncrementalObjects(oparlSystem.person, modifiedSince, OparlObjectType.Person);
    await this.fetchAndStoreIncrementalObjects(oparlSystem.meeting, modifiedSince, OparlObjectType.Meeting);
    await this.fetchAndStoreIncrementalObjects(oparlSystem.paper, modifiedSince, OparlObjectType.Paper);
    await this.fetchAndStoreIncrementalObjects(oparlSystem.membership, modifiedSince, OparlObjectType.Membership);
    await this.fetchAndStoreIncrementalObjects(oparlSystem.locationList, modifiedSince, OparlObjectType.Location);
    await this.fetchAndStoreIncrementalObjects(oparlSystem.agendaItem, modifiedSince, OparlObjectType.AgendaItem);
    await this.fetchAndStoreIncrementalObjects(oparlSystem.consultations, modifiedSince, OparlObjectType.Consultation);
    await this.fetchAndStoreIncrementalObjects(oparlSystem.files, modifiedSince, OparlObjectType.File);

  }


  private async fetchOparlSystem(oparlSystemUrl: string): Promise<OparlSystem> {
    const response = await fetch(oparlSystemUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch OParl system from ${oparlSystemUrl}: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }


  private async fetchAndStoreObjects(objectsUrl: string, createdSince: string | null, objectType: OparlObjectType): Promise<void> {
    const objects = await this.client.fetchObjects(objectsUrl, createdSince);
    const filename = this.getObjectTypeFilename(objectType);
    this.oparlObjectsStore.saveObjects(objects, filename);
  }


  private async fetchAndStoreIncrementalObjects(objectsUrl: string, modifiedSince: string,
                                                objectType: OparlObjectType): Promise<void> {

    const modifiedObjects = await this.client.fetchModifiedObjects(objectsUrl, modifiedSince);
    if (modifiedObjects.length === 0) {
      console.log('No modified objects found.');
      return;
    }

    const filename = this.getObjectTypeFilename(objectType);
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


  private getObjectTypeFilename(objectType: OparlObjectType): string {
    switch (objectType) {
      case OparlObjectType.Organization:
        return 'organizations.json';
      case OparlObjectType.Person:
        return 'persons.json';
      case OparlObjectType.Meeting:
        return 'meetings.json';
      case OparlObjectType.Paper:
        return 'papers.json';
      case OparlObjectType.Membership:
        return 'memberships.json';
      case OparlObjectType.Location:
        return 'locations.json';
      case OparlObjectType.AgendaItem:
        return 'agenda-items.json';
      case OparlObjectType.Consultation:
        return 'consultations.json';
      case OparlObjectType.File:
        return 'files.json';
      default:
        throw new Error('Unknown OParl object type');
    }
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
