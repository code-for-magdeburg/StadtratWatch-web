// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import alpinejs from '@astrojs/alpinejs';


// https://astro.build/config
export default defineConfig({

  env: {
    schema: {
      AWS_CLOUDFRONT_BASE_URL: envField.string({
        context: 'server',
        access: 'public',
        optional: false
      })
    }
  },

  integrations: [
    tailwind({ applyBaseStyles: false }),
    alpinejs()
  ]

});
