import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';


@Injectable({ providedIn: 'root' })
export class MetaTagsService {


  constructor(private readonly meta: Meta, private readonly titleService: Title) {
  }


  updateTags({ title, description }: { title: string, description: string }) {

    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    // TODO: Add property og:url
    // TODO: Add property og:image
    // TODO: Add name twitter:image
    // TODO: Add name twitter:card
    // TODO: Add name twitter:domain
    // TODO: Add name twitter:url

  }


}
