import { describe, expect, it } from 'bun:test';

import { ImagesGenerator } from './images-generator.ts';

function fontsWith(...installedFamilies: string[]) {
  return { has: (family: string) => installedFamilies.includes(family) };
}

describe('ImagesGenerator', () => {
  it('refuses to start when Verdana is not installed', () => {
    expect(() => new ImagesGenerator(fontsWith('Arial'))).toThrow('Font "Verdana" is not installed.');
  });

  it('starts when Verdana is installed', () => {
    expect(() => new ImagesGenerator(fontsWith('Arial', 'Verdana'))).not.toThrow();
  });
});
