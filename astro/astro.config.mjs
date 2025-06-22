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
    plugins: [tailwindcss()],
  },

  image: {
    service: passthroughImageService(),
  },
});
