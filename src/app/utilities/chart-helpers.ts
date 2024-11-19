import { ChartConfiguration } from 'chart.js';
import { HistoryValue } from "../../interfaces/Faction";


export function initialHistoryChartOptions(ticksCallback: (val: string | number) => number | string): ChartConfiguration['options'] {
  return {
    elements: { line: { tension: 0.5 } },
    scales: {
      x: { type: 'time' },
      y: { ticks: { callback: ticksCallback } }
    },
    plugins: { legend: { display: false } },
  };
}


export function initialHistoryChartData(): ChartConfiguration['data'] {
  return { datasets: [], labels: [] };
}


export function mapHistoryDataToChartDataAndLabels(chartData: ChartConfiguration['data'], historyData: HistoryValue[]) {
  chartData.datasets = [
    {
      data: historyData.map(value => value.value),
      fill: 'origin',
    }
  ];
  chartData.labels = historyData.map(value => value.date);
}
