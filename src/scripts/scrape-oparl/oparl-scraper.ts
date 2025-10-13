import { type OparlBody, type OparlObject } from '../shared/model/oparl.ts';
import { type OparlClient } from './oparl-client.ts';
import { type IOparlObjectFileStore } from './oparl-file-store.ts';

enum OparlObjectType {
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

export class OparlScraper {
  constructor(private readonly client: OparlClient, private readonly oparlObjectsStore: IOparlObjectFileStore) {}

  public async fetchFull(oparlBodyUrl: string, createdSince: string): Promise<void> {
    console.log(`Fetching all data created since ${createdSince}...`);

    const oparlBody = await this.fetchOparlBody(oparlBodyUrl);

    await this.fetchAndStoreObjects(oparlBody.organization, createdSince, OparlObjectType.Organization);
    await this.fetchAndStoreObjects(oparlBody.person, createdSince, OparlObjectType.Person);
    await this.fetchAndStoreObjects(oparlBody.meeting, createdSince, OparlObjectType.Meeting);
    await this.fetchAndStoreObjects(oparlBody.paper, createdSince, OparlObjectType.Paper);
    await this.fetchAndStoreObjects(oparlBody.membership, createdSince, OparlObjectType.Membership);
    await this.fetchAndStoreObjects(oparlBody.locationList, createdSince, OparlObjectType.Location);
    await this.fetchAndStoreObjects(oparlBody.agendaItem, createdSince, OparlObjectType.AgendaItem);
    await this.fetchAndStoreObjects(oparlBody.consultations, createdSince, OparlObjectType.Consultation);
    await this.fetchAndStoreObjects(oparlBody.files, createdSince, OparlObjectType.File);
  }

  public async fetchIncremental(oparlBodyUrl: string, modifiedSince: string): Promise<void> {
    console.log(`Fetching changes since ${modifiedSince}...`);

    const oparlBody = await this.fetchOparlBody(oparlBodyUrl);

    await this.fetchAndStoreIncrementalObjects(oparlBody.organization, modifiedSince, OparlObjectType.Organization);
    await this.fetchAndStoreIncrementalObjects(oparlBody.person, modifiedSince, OparlObjectType.Person);
    await this.fetchAndStoreIncrementalObjects(oparlBody.meeting, modifiedSince, OparlObjectType.Meeting);
    await this.fetchAndStoreIncrementalObjects(oparlBody.paper, modifiedSince, OparlObjectType.Paper);
    await this.fetchAndStoreIncrementalObjects(oparlBody.membership, modifiedSince, OparlObjectType.Membership);
    await this.fetchAndStoreIncrementalObjects(oparlBody.locationList, modifiedSince, OparlObjectType.Location);
    await this.fetchAndStoreIncrementalObjects(oparlBody.agendaItem, modifiedSince, OparlObjectType.AgendaItem);
    await this.fetchAndStoreIncrementalObjects(oparlBody.consultations, modifiedSince, OparlObjectType.Consultation);
    await this.fetchAndStoreIncrementalObjects(oparlBody.files, modifiedSince, OparlObjectType.File);
  }

  private async fetchOparlBody(oparlBodyUrl: string): Promise<OparlBody> {
    const response = await fetch(oparlBodyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch OParl body from ${oparlBodyUrl}: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  private async fetchAndStoreObjects(
    objectsUrl: string,
    createdSince: string | null,
    objectType: OparlObjectType,
  ): Promise<void> {
    const objects = await this.client.fetchObjects(objectsUrl, createdSince);
    const filename = this.getObjectTypeFilename(objectType);
    this.oparlObjectsStore.saveObjects(objects, filename);
  }

  private async fetchAndStoreIncrementalObjects(
    objectsUrl: string,
    modifiedSince: string,
    objectType: OparlObjectType,
  ): Promise<void> {
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
      const index = updatedObjects.findIndex((obj) => obj.id === modifiedObject.id);
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
