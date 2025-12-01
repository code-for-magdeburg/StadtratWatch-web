import { type OparlObject } from '../shared/model/oparl.ts';

export class OparlClient {
  constructor(private readonly fetchDelayMs: number) {}

  public async fetchObjects(objectsUrl: string, createdSince: string | null): Promise<OparlObject[]> {
    console.log('Fetching objects from', objectsUrl);

    let pageIndex = 1;
    const objects = [];

    let url = OparlClient.buildUrlWithParams(objectsUrl, createdSince);
    while (url) {
      const response = await fetch(url);
      if (response.ok) {
        const page = await response.json();
        objects.push(...page.data);

        pageIndex++;
        url = OparlClient.buildUrlWithParams(page.links.next, createdSince);

        await new Promise((resolve) => setTimeout(resolve, this.fetchDelayMs));
      } else {
        console.error('Failed to fetch objects:', response.status, response.statusText);
        url = null;
      }
    }

    console.log('Fetched', objects.length, 'objects.');

    return objects;
  }

  public async fetchModifiedObjects(objectsUrl: string, modifiedSince: string): Promise<OparlObject[]> {
    console.log('Fetching objects from', objectsUrl);

    let pageIndex = 1;
    const objects = [];

    let url = OparlClient.buildUrlWithModifiedSinceParams(objectsUrl, modifiedSince);
    while (url) {
      console.log('Fetching page: ', pageIndex);

      const response = await fetch(url);
      if (response.ok) {
        const page = await response.json();
        objects.push(...page.data);

        pageIndex++;
        url = OparlClient.buildUrlWithModifiedSinceParams(page.links.next, modifiedSince);

        await new Promise((resolve) => setTimeout(resolve, this.fetchDelayMs));
      } else {
        console.error('Failed to fetch objects:', response.status, response.statusText);
        url = null;
      }
    }

    console.log('Fetched', objects.length, 'objects.');

    return objects;
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
