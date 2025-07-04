/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['src/tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
