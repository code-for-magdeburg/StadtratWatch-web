import { OparlOrganization } from '../model/oparl.ts';

export interface OparlOrganizationsRepository {
  getOrganizationById(organizationId: string): OparlOrganization | null;
}

export class OparlOrganizationsInMemoryRepository implements OparlOrganizationsRepository {
  constructor(private readonly organizations: OparlOrganization[]) {
  }

  public getOrganizationById(organizationId: string): OparlOrganization | null {
    return this.organizations.find((organization) => organization.id === organizationId) || null;
  }
}
