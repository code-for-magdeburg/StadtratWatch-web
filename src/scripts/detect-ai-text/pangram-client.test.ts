import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';

import { countWords, PangramHttpClient } from './pangram-client.ts';

afterEach(() => mock.restore());

describe('countWords', () => {
  it('counts whitespace-separated words', () => {
    expect(countWords('Dies ist ein Test')).toEqual(4);
  });

  it('returns 0 for empty or blank text', () => {
    expect(countWords('')).toEqual(0);
    expect(countWords('   ')).toEqual(0);
  });

  it('collapses repeated whitespace', () => {
    expect(countWords('Ein  Wort\nmit   Umbruch')).toEqual(4);
  });
});

describe('PangramHttpClient.assessText', () => {
  it('skips text below the 50-word minimum without calling Pangram', async () => {
    const fetchSpy = spyOn(globalThis, 'fetch').mockRejectedValue(new Error('fetch must not be called for short text'));

    const client = new PangramHttpClient('test-api-key');
    const outcome = await client.assessText('Nur ein paar Worte.');

    expect(outcome).toEqual({ kind: 'skipped-too-short', wordCount: 4 });
    expect(fetchSpy).toHaveBeenCalledTimes(0);
  });
});
