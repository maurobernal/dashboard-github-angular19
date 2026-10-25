import { Component, computed, inject } from '@angular/core';
import {
  ActiveElement,
  BarController,
  BarElement,
  CategoryScale,
  ChartConfiguration,
  ChartData,
  ChartEvent,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { BaseChartDirective, provideCharts } from 'ng2-charts';
import { AGE_BUCKETS, ageBucketOf } from '../pull-request-filters';
import { PullRequestsStore } from '../pull-requests.store';

const TOP_REPOSITORIES = 10;

const AXIS_STYLE = { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } };

interface ChartClick {
  event?: ChartEvent;
  active?: object[];
}

/** Bars are bright when selected (or when nothing is selected) and dimmed otherwise. */
function barColors(selected: boolean[], color: string): string[] {
  const anySelected = selected.includes(true);
  return selected.map((isSelected) => (isSelected || !anySelected ? color : `${color}55`));
}

/** Shows a pointer over clickable bars. */
function pointerOnBars(event: ChartEvent, elements: ActiveElement[]): void {
  const canvas = event.native?.target as HTMLElement | undefined;
  if (canvas) {
    canvas.style.cursor = elements.length ? 'pointer' : 'default';
  }
}

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
  private readonly store = inject(PullRequestsStore);

  /** Top repositories by open PRs, as full `owner/name` (the chart shows the short name). */
  private readonly topRepositories = computed(() => {
    const counts = new Map<string, number>();
    for (const pr of this.store.pullRequestsForRepositoryChart()) {
      counts.set(pr.repository, (counts.get(pr.repository) ?? 0) + 1);
    }
    return [...counts].sort(([, a], [, b]) => b - a).slice(0, TOP_REPOSITORIES);
  });

  protected readonly byRepository = computed<ChartData<'bar'>>(() => {
    const top = this.topRepositories();
    const selected = this.store.filters().repositories;

    return {
      labels: top.map(([repository]) => repository.split('/')[1] ?? repository),
      datasets: [
        {
          data: top.map(([, count]) => count),
          label: 'PRs abiertos',
          backgroundColor: barColors(
            top.map(([repository]) => selected.includes(repository)),
            '#8b5cf6',
          ),
        },
      ],
    };
  });

  protected readonly byAge = computed<ChartData<'bar'>>(() => {
    const now = Date.now();
    const counts = new Map(AGE_BUCKETS.map((bucket) => [bucket.id, 0]));
    for (const pr of this.store.pullRequestsForAgeChart()) {
      const bucket = ageBucketOf(pr, now);
      counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
    }
    const selected = this.store.filters().age;

    return {
      labels: AGE_BUCKETS.map((bucket) => bucket.label),
      datasets: [
        {
          data: AGE_BUCKETS.map((bucket) => counts.get(bucket.id) ?? 0),
          label: 'PRs abiertos',
          backgroundColor: barColors(
            AGE_BUCKETS.map((bucket) => bucket.id === selected),
            '#38bdf8',
          ),
        },
      ],
    };
  });

  protected readonly horizontalBarOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    onHover: pointerOnBars,
    plugins: { legend: { display: false } },
    scales: {
      x: { ...AXIS_STYLE, beginAtZero: true, ticks: { ...AXIS_STYLE.ticks, precision: 0 } },
      y: AXIS_STYLE,
    },
  };

  protected readonly verticalBarOptions: ChartConfiguration<'bar'>['options'] = {
    maintainAspectRatio: false,
    onHover: pointerOnBars,
    plugins: { legend: { display: false } },
    scales: {
      x: AXIS_STYLE,
      y: { ...AXIS_STYLE, beginAtZero: true, ticks: { ...AXIS_STYLE.ticks, precision: 0 } },
    },
  };

  protected onRepositoryClick({ active }: ChartClick): void {
    const index = clickedIndex(active);
    const repository = index === undefined ? undefined : this.topRepositories()[index]?.[0];
    if (repository) {
      this.store.toggleRepository(repository);
    }
  }

  protected onAgeClick({ active }: ChartClick): void {
    const index = clickedIndex(active);
    const bucket = index === undefined ? undefined : AGE_BUCKETS[index];
    if (bucket) {
      this.store.toggleAge(bucket.id);
    }
  }
}

function clickedIndex(active: object[] | undefined): number | undefined {
  return (active?.[0] as ActiveElement | undefined)?.index;
}
