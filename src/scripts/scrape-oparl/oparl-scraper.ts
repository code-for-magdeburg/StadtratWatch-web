import { type OparlObject, type OparlSystem } from './model.ts';
import { type OparlSystemClient } from './oparl-system-client.ts';
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
