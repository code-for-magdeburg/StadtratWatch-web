import type { OparlPaper } from '@models/oparl.ts';
import type { RecentPaper } from './_models.ts';
import { formatDate } from '@utils/format-date.ts';

export function getRecentMainPapers(papers: OparlPaper[]): RecentPaper[] {
  const today = new Date();
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);

  return papers
    .filter((oparlPaper) => (oparlPaper.subordinatedPaper || []).length === 0)
    .filter((oparlPaper) => !!oparlPaper.date)
    .filter((oparlPaper) => new Date(oparlPaper.date!) >= threeMonthsAgo)
    .map<RecentPaper>((oparlPaper) => ({
      oparlId: oparlPaper.id,
      id: oparlPaper.id.split('/').pop()!,
      date: oparlPaper.date!,
      dateDisplay: formatDate(oparlPaper.date!),
      type: oparlPaper.paperType,
      reference: oparlPaper.reference,
      title: oparlPaper.name,
    }));
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
