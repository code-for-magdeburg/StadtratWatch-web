// @ts-check
import { defineConfig, envField, passthroughImageService } from 'astro/config';
import alpinejs from '@astrojs/alpinejs';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  env: {
    schema: {
      AWS_CLOUDFRONT_BASE_URL: envField.string({
        context: 'client',
        access: 'public',
        optional: false,
      }),
      TYPESENSE_HOST: envField.string({
        context: 'client',
        access: 'public',
        optional: false,
      }),
      TYPESENSE_PORT: envField.number({
        context: 'client',
        access: 'public',
        optional: false,
      }),
      TYPESENSE_PROTOCOL: envField.string({
        context: 'client',
        access: 'public',
        optional: false,
      }),
      TYPESENSE_SEARCH_ONLY_API_KEY: envField.string({
        context: 'client',
        access: 'public',
        optional: false,
      }),
    },
  },

  integrations: [alpinejs()],

  vite: {
    // TODO: The following @ts-expect-error directive should be safely removed after upgrading to Astro 7
    // See https://github.com/withastro/astro/issues/14030#issuecomment-3027129338
    // @ts-expect-error
    plugins: [tailwindcss()],
  },

  image: {
    service: passthroughImageService(),
  },
});
