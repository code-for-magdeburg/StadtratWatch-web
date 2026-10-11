import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { isFeatureEnabled } from '@utils/feature-flags';
import Methodology from './_methodology.astro';

vi.mock('@utils/feature-flags', () => ({
  isFeatureEnabled: vi.fn(() => false),
}));

async function renderPage(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(Methodology);
}

describe('AI assessment methodology page', () => {
  afterEach(() => {
    vi.mocked(isFeatureEnabled).mockReturnValue(false);
  });

  test('renders placeholder without methodology content when flag is off', async () => {
    const html = await renderPage();

    expect(html).toContain('Diese Seite ist derzeit nicht verfügbar.');
    expect(html).not.toContain('Pangram');
  });

  test('renders full methodology content when flag is on', async () => {
    vi.mocked(isFeatureEnabled).mockReturnValue(true);

    const html = await renderPage();

    expect(html).toContain('Pangram');
    expect(html).toContain('Wofür der Detektor nicht gebaut ist');
    expect(html).toContain('<strong>0 % dieser Beiträge</strong>');
    expect(html).toContain('Was das Symbol bedeutet');
    expect(html).toContain('Beitrag melden');
    expect(html).not.toContain('Diese Seite ist derzeit nicht verfügbar.');
  });
});
