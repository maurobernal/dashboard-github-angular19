import { ParamMap, Params } from '@angular/router';
import { Owner, PullRequest, ReviewState } from './pull-request.model';

export type OwnerFilter = 'all' | Owner;
export type DraftFilter = 'all' | 'draft' | 'ready';
export type ReviewFilter = 'all' | ReviewState;

export interface PullRequestFilters {
  search: string;
  owner: OwnerFilter;
  repositories: string[];
  /** Author login; empty string means any author. */
  author: string;
  draft: DraftFilter;
  /** Label name; empty string means any label. */
  label: string;
  review: ReviewFilter;
}

export const DEFAULT_FILTERS: PullRequestFilters = {
  search: '',
  owner: 'all',
  repositories: [],
  author: '',
  draft: 'all',
  label: '',
  review: 'all',
};

const OWNER_FILTERS: readonly OwnerFilter[] = ['all', 'org', 'user'];
const DRAFT_FILTERS: readonly DraftFilter[] = ['all', 'draft', 'ready'];
const REVIEW_FILTERS: readonly ReviewFilter[] = [
  'all',
  'APPROVED',
  'CHANGES_REQUESTED',
  'REVIEW_REQUIRED',
  'NONE',
];

export function matchesFilters(pr: PullRequest, filters: PullRequestFilters): boolean {
  const search = filters.search.trim().toLowerCase();

  return (
    (!search || pr.title.toLowerCase().includes(search) || `#${pr.number}` === search) &&
    (filters.owner === 'all' || pr.owner === filters.owner) &&
    (!filters.repositories.length || filters.repositories.includes(pr.repository)) &&
    (!filters.author || pr.author.login === filters.author) &&
    (filters.draft === 'all' || pr.isDraft === (filters.draft === 'draft')) &&
    (!filters.label || pr.labels.some((label) => label.name === filters.label)) &&
    (filters.review === 'all' || pr.review === filters.review)
  );
}

export interface FilterOptions {
  repositories: string[];
  authors: string[];
  labels: string[];
}

/** Distinct, sorted values present in the data, used to populate the filter controls. */
export function filterOptions(pullRequests: readonly PullRequest[]): FilterOptions {
  const sortedUnique = (values: string[]) =>
    [...new Set(values)].sort((a, b) => a.localeCompare(b));

  return {
    repositories: sortedUnique(pullRequests.map((pr) => pr.repository)),
    authors: sortedUnique(pullRequests.map((pr) => pr.author.login)),
    labels: sortedUnique(pullRequests.flatMap((pr) => pr.labels.map((label) => label.name))),
  };
}

export function filtersFromParams(params: ParamMap): PullRequestFilters {
  return {
    search: params.get('q') ?? DEFAULT_FILTERS.search,
    owner: oneOf(params.get('owner'), OWNER_FILTERS, DEFAULT_FILTERS.owner),
    repositories: params.getAll('repo'),
    author: params.get('author') ?? DEFAULT_FILTERS.author,
    draft: oneOf(params.get('draft'), DRAFT_FILTERS, DEFAULT_FILTERS.draft),
    label: params.get('label') ?? DEFAULT_FILTERS.label,
    review: oneOf(params.get('review'), REVIEW_FILTERS, DEFAULT_FILTERS.review),
  };
}

/** Only non-default values are written, so a clean dashboard has a clean URL. */
export function filtersToParams(filters: PullRequestFilters): Params {
  const params: Params = {
    q: filters.search.trim(),
    owner: filters.owner,
    repo: filters.repositories,
    author: filters.author,
    draft: filters.draft,
    label: filters.label,
    review: filters.review,
  };

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) =>
      Array.isArray(value) ? value.length > 0 : value !== '' && value !== 'all',
    ),
  );
}

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}
