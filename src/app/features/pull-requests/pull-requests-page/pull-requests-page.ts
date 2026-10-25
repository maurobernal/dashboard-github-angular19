import { Component, inject } from '@angular/core';
import { GITHUB_CONFIG } from '../../../core/github/github.config';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { FiltersPanel } from '../filters-panel/filters-panel';
import { KpiSummary } from '../kpi-summary/kpi-summary';
import { PullRequestCard } from '../pull-request-card/pull-request-card';
import { PullRequestsStore } from '../pull-requests.store';

@Component({
  selector: 'app-pull-requests-page',
  imports: [FiltersPanel, KpiSummary, PullRequestCard, RelativeTimePipe],
  providers: [PullRequestsStore],
  templateUrl: './pull-requests-page.html',
})
export class PullRequestsPage {
  protected readonly config = inject(GITHUB_CONFIG);
  protected readonly store = inject(PullRequestsStore);
}
