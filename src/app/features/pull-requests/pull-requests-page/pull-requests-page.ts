import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GITHUB_CONFIG } from '../../../core/github/github.config';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { FiltersPanel } from '../filters-panel/filters-panel';
import { KpiSummary } from '../kpi-summary/kpi-summary';
import { openPullRequestsResource } from '../open-pull-requests.resource';
import { PullRequestCard } from '../pull-request-card/pull-request-card';
import {
  DEFAULT_FILTERS,
  filterOptions,
  filtersFromParams,
  filtersToParams,
  matchesFilters,
} from '../pull-request-filters';

const AUTO_REFRESH_MS = 5 * 60 * 1000;

@Component({
  selector: 'app-pull-requests-page',
  imports: [FiltersPanel, KpiSummary, PullRequestCard, RelativeTimePipe],
  templateUrl: './pull-requests-page.html',
})
export class PullRequestsPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly config = inject(GITHUB_CONFIG);
  protected readonly search = openPullRequestsResource();
  protected readonly lastUpdated = signal(new Date());

  protected readonly filters = signal(filtersFromParams(this.route.snapshot.queryParamMap));

  protected readonly allPullRequests = computed(() =>
    this.search.hasValue() ? this.search.value().pullRequests : [],
  );

  protected readonly visiblePullRequests = computed(() => {
    const filters = this.filters();
    return this.allPullRequests().filter((pr) => matchesFilters(pr, filters));
  });

  protected readonly options = computed(() => filterOptions(this.allPullRequests()));

  protected readonly totalCount = computed(() =>
    this.search.hasValue() ? this.search.value().totalCount : 0,
  );

  /** GitHub caps each search page; tell the user when not everything was loaded. */
  protected readonly isTruncated = computed(
    () => this.totalCount() > this.allPullRequests().length,
  );

  protected readonly errorMessage = computed(() => describeError(this.search.error()));

  constructor() {
    // Keep the URL in sync so a filtered view can be bookmarked or shared.
    effect(() => {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: filtersToParams(this.filters()),
        replaceUrl: true,
      });
    });

    effect(() => {
      if (this.search.status() === 'resolved') {
        this.lastUpdated.set(new Date());
      }
    });

    const timer = setInterval(() => this.search.reload(), AUTO_REFRESH_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected clearFilters(): void {
    this.filters.set(DEFAULT_FILTERS);
  }
}

function describeError(error: Error | undefined): string | null {
  if (!error) {
    return null;
  }
  if (error instanceof HttpErrorResponse) {
    switch (error.status) {
      case 401:
        return 'El token de GitHub es inválido o expiró. Revisá src/environments/github.secrets.ts.';
      case 403:
        return 'GitHub rechazó la consulta (permisos insuficientes o rate limit alcanzado).';
      case 0:
        return 'No se pudo conectar con GitHub. Revisá tu conexión.';
    }
    return `GitHub respondió ${error.status}: ${error.statusText}`;
  }
  return error.message;
}
