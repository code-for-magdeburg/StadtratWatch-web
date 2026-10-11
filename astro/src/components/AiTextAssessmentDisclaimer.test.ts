import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { isFeatureEnabled } from '@utils/feature-flags';
import AiTextAssessmentDisclaimer from './AiTextAssessmentDisclaimer.astro';

vi.mock('@utils/feature-flags', () => ({
  isFeatureEnabled: vi.fn(() => false),
}));

async function renderDisclaimer(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(AiTextAssessmentDisclaimer);
}

describe('AI text assessment disclaimer', () => {
  afterEach(() => {
    vi.mocked(isFeatureEnabled).mockReturnValue(false);
  });

  test('renders sentence linking to methodology when flag is on', async () => {
    vi.mocked(isFeatureEnabled).mockReturnValue(true);

    const html = await renderDisclaimer();

    expect(html).toContain('KI-Textdetektors');
    expect(html).toContain('href="/transparency/ai-assessment/"');
  });

  test('renders nothing when flag is off', async () => {
    const html = await renderDisclaimer();

    expect(html.trim()).toBe('');
  });
});
