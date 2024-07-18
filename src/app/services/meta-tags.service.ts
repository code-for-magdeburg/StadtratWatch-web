import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';


type MetaTags = {
  title: string;
  description: string;
  image?: string;
};


@Injectable({ providedIn: 'root' })
export class MetaTagsService {


  constructor(private readonly meta: Meta, private readonly titleService: Title) {
  }


  updateTags(tags: MetaTags) {

    this.titleService.setTitle(tags.title);
    this.meta.updateTag({ name: 'description', content: tags.description });
    this.meta.updateTag({ property: 'og:title', content: tags.title });
    this.meta.updateTag({ property: 'og:description', content: tags.description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:title', content: tags.title });
    this.meta.updateTag({ name: 'twitter:description', content: tags.description });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    if (tags.image) {
      this.meta.updateTag({ property: 'og:image', content: tags.image });
      this.meta.updateTag({ name: 'twitter:image', content: tags.image });
    }
    // TODO: Add property og:url
    // TODO: Add name twitter:domain
    // TODO: Add name twitter:url

  }


}
