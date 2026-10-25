import { Component, computed, input } from '@angular/core';
import { KpiCharts } from '../kpi-charts/kpi-charts';
import { PullRequest } from '../pull-request.model';

@Component({
  selector: 'app-kpi-summary',
  imports: [KpiCharts],
  templateUrl: './kpi-summary.html',
})
export class KpiSummary {
  readonly pullRequests = input.required<readonly PullRequest[]>();

  protected readonly tiles = computed(() => {
    const prs = this.pullRequests();
    const count = (predicate: (pr: PullRequest) => boolean) => prs.filter(predicate).length;

    return [
      { label: 'Abiertos', value: prs.length, classes: 'text-slate-100' },
      { label: 'Draft', value: count((pr) => pr.isDraft), classes: 'text-slate-300' },
      {
        label: 'Esperando review',
        value: count((pr) => !pr.isDraft && pr.review === 'REVIEW_REQUIRED'),
        classes: 'text-amber-300',
      },
      {
        label: 'Aprobados',
        value: count((pr) => pr.review === 'APPROVED'),
        classes: 'text-emerald-300',
      },
      {
        label: 'Checks fallando',
        value: count((pr) => pr.checks === 'FAILURE'),
        classes: 'text-rose-300',
      },
    ];
  });
}
