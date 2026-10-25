import { HttpErrorResponse } from '@angular/common/http';
import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { openPullRequestsResource } from './open-pull-requests.resource';
import {
  AgeBucket,
  DEFAULT_FILTERS,
  filterOptions,
  filtersFromParams,
  filtersToParams,
  matchesFilters,
  PullRequestFilters,
} from './pull-request-filters';

const AUTO_REFRESH_MS = 5 * 60 * 1000;

/**
 * Single source of truth for the pull requests dashboard: remote data, filters and derived views.
 * Provided by `PullRequestsPage`, so its lifetime (and the URL sync) is bound to that route.
 */
@Injectable()
export class PullRequestsStore {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly search = openPullRequestsResource();

  readonly filters = signal<PullRequestFilters>(
    filtersFromParams(this.route.snapshot.queryParamMap),
  );
  readonly lastUpdated = signal(new Date());

  readonly isLoading = this.search.isLoading;
  readonly hasValue = computed(() => this.search.hasValue());

  readonly allPullRequests = computed(() =>
    this.search.hasValue() ? this.search.value().pullRequests : [],
  );

  readonly visiblePullRequests = computed(() => this.pullRequestsMatching(this.filters()));

  /**
   * Charts ignore their own dimension (cross-filtering): selecting a bar highlights it
   * instead of making the other bars disappear.
   */
  readonly pullRequestsForRepositoryChart = computed(() =>
    this.pullRequestsMatching({ ...this.filters(), repositories: [] }),
  );
  readonly pullRequestsForAgeChart = computed(() =>
    this.pullRequestsMatching({ ...this.filters(), age: 'all' }),
  );

  readonly options = computed(() => filterOptions(this.allPullRequests()));

  readonly totalCount = computed(() =>
    this.search.hasValue() ? this.search.value().totalCount : 0,
  );

  /** GitHub caps each search page; tell the user when not everything was loaded. */
  readonly isTruncated = computed(() => this.totalCount() > this.allPullRequests().length);

  readonly errorMessage = computed(() => describeError(this.search.error()));

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

    const timer = setInterval(() => this.reload(), AUTO_REFRESH_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  reload(): void {
    this.search.reload();
  }

  clearFilters(): void {
    this.filters.set(DEFAULT_FILTERS);
  }

  toggleRepository(repository: string): void {
    this.filters.update((filters) => ({
      ...filters,
      repositories: filters.repositories.includes(repository)
        ? filters.repositories.filter((item) => item !== repository)
        : [...filters.repositories, repository],
    }));
  }

  toggleAge(age: AgeBucket): void {
    this.filters.update((filters) => ({ ...filters, age: filters.age === age ? 'all' : age }));
  }

  private pullRequestsMatching(filters: PullRequestFilters) {
    const now = Date.now();
    return this.allPullRequests().filter((pr) => matchesFilters(pr, filters, now));
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
