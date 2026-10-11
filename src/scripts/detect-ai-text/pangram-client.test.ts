import { assertEquals } from '@std/assert';
import { describe, it } from '@std/testing/bdd';
import { countWords, PangramHttpClient } from './pangram-client.ts';

describe('countWords', () => {
  it('counts whitespace-separated words', () => {
    assertEquals(countWords('Dies ist ein Test'), 4);
  });

  it('returns 0 for empty or blank text', () => {
    assertEquals(countWords(''), 0);
    assertEquals(countWords('   '), 0);
  });

  it('collapses repeated whitespace', () => {
    assertEquals(countWords('Ein  Wort\nmit   Umbruch'), 4);
  });
});

describe('PangramHttpClient.assessText', () => {
  it('skips text below the 50-word minimum without calling Pangram', async () => {
    const originalFetch = globalThis.fetch;
    let fetchCalled = false;
    globalThis.fetch = () => {
      fetchCalled = true;
      throw new Error('fetch must not be called for short text');
    };

    try {
      const client = new PangramHttpClient('test-api-key');
      const outcome = await client.assessText('Nur ein paar Worte.');

      assertEquals(outcome, { kind: 'skipped-too-short', wordCount: 4 });
      assertEquals(fetchCalled, false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
