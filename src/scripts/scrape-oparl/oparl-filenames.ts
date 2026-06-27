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

/** The filename each object type is stored under. */
export const OPARL_FILENAME_BY_TYPE: Record<OparlObjectType, string> = {
  [OparlObjectType.Organization]: 'organizations.json',
  [OparlObjectType.Person]: 'persons.json',
  [OparlObjectType.Meeting]: 'meetings.json',
  [OparlObjectType.Paper]: 'papers.json',
  [OparlObjectType.Membership]: 'memberships.json',
  [OparlObjectType.Location]: 'locations.json',
  [OparlObjectType.AgendaItem]: 'agenda-items.json',
  [OparlObjectType.Consultation]: 'consultations.json',
  [OparlObjectType.File]: 'files.json',
};

/** Every snapshot filename, in object-type order. */
export const OPARL_FILENAMES: readonly string[] = Object.values(OPARL_FILENAME_BY_TYPE);
