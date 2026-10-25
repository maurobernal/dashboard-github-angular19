import { Component, computed, input } from '@angular/core';
import {
  BarController,
  BarElement,
  CategoryScale,
  ChartConfiguration,
  ChartData,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { BaseChartDirective, provideCharts } from 'ng2-charts';
import { PullRequest } from '../pull-request.model';

const DAY_MS = 24 * 60 * 60 * 1000;
const TOP_REPOSITORIES = 10;

const AGE_BUCKETS: { label: string; maxDays: number }[] = [
  { label: '< 1 día', maxDays: 1 },
  { label: '1–7 días', maxDays: 7 },
  { label: '1–4 semanas', maxDays: 30 },
  { label: '1–3 meses', maxDays: 90 },
  { label: '> 3 meses', maxDays: Infinity },
];

const AXIS_STYLE = { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } };

@Component({
  selector: 'app-kpi-charts',
  imports: [BaseChartDirective],
  // Registered here (not in app.config) so chart.js is only downloaded with this deferred component.
  providers: [
    provideCharts({
      registerables: [BarController, BarElement, CategoryScale, LinearScale, Tooltip],
    }),
  ],
  templateUrl: './kpi-charts.html',
})
export class KpiCharts {
  readonly pullRequests = input.required<readonly PullRequest[]>();

  protected readonly byRepository = computed<ChartData<'bar'>>(() => {
    const counts = new Map<string, number>();
    for (const pr of this.pullRequests()) {
      counts.set(pr.repository, (counts.get(pr.repository) ?? 0) + 1);
    }
    const top = [...counts].sort(([, a], [, b]) => b - a).slice(0, TOP_REPOSITORIES);

    return {
      labels: top.map(([repository]) => repository.split('/')[1] ?? repository),
      datasets: [
        { data: top.map(([, count]) => count), label: 'PRs abiertos', backgroundColor: '#8b5cf6' },
      ],
    };
  });

  protected readonly byAge = computed<ChartData<'bar'>>(() => {
    const now = Date.now();
    const counts = AGE_BUCKETS.map(() => 0);
    for (const pr of this.pullRequests()) {
      const ageDays = (now - pr.createdAt.getTime()) / DAY_MS;
      counts[AGE_BUCKETS.findIndex((bucket) => ageDays < bucket.maxDays)]++;
    }

    return {
      labels: AGE_BUCKETS.map((bucket) => bucket.label),
      datasets: [{ data: counts, label: 'PRs abiertos', backgroundColor: '#38bdf8' }],
    };
  });

  protected readonly horizontalBarOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ...AXIS_STYLE, beginAtZero: true, ticks: { ...AXIS_STYLE.ticks, precision: 0 } },
      y: AXIS_STYLE,
    },
  };

  protected readonly verticalBarOptions: ChartConfiguration<'bar'>['options'] = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: AXIS_STYLE,
      y: { ...AXIS_STYLE, beginAtZero: true, ticks: { ...AXIS_STYLE.ticks, precision: 0 } },
    },
  };
}
