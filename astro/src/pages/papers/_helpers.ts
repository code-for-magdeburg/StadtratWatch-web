import type { OparlPaper } from '@models/oparl.ts';

export function getRecentMainPapers(papers: OparlPaper[]): OparlPaper[] {
  const today = new Date();
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);

  return papers
    .filter((oparlPaper) => (oparlPaper.subordinatedPaper || []).length === 0)
    .filter((oparlPaper) => !!oparlPaper.date)
    .filter((oparlPaper) => new Date(oparlPaper.date!) >= threeMonthsAgo);
}

export function getRecentPapersPeriod() {
  const now = new Date();
  const currentMonth = now.toLocaleDateString('de-DE', { month: 'long' });
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const twoMonthsAgoName = twoMonthsAgo.toLocaleDateString('de-DE', {
    month: 'long',
  });

  return `${twoMonthsAgoName} - ${currentMonth}`;
}
