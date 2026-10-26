import { convertToParamMap } from '@angular/router';
import { PullRequest } from './pull-request.model';
import {
  ageBucketOf,
  DEFAULT_FILTERS,
  filterOptions,
  filtersFromParams,
  filtersToParams,
  matchesFilters,
  PullRequestFilters,
} from './pull-request-filters';

function pullRequest(overrides: Partial<PullRequest> = {}): PullRequest {
  return {
    id: 'PR_1',
    number: 42,
    title: 'Fix login redirect',
    url: '',
    isDraft: false,
    createdAt: new Date(),
    author: { login: 'alice', avatarUrl: '', url: '' },
    repository: 'acme/web',
    repositoryUrl: '',
    owner: 'org',
    labels: [{ name: 'bug', color: 'ff0000' }],
    comments: 0,
    review: 'REVIEW_REQUIRED',
    checks: 'SUCCESS',
    ...overrides,
  };
}

const withFilters = (overrides: Partial<PullRequestFilters>) => ({
  ...DEFAULT_FILTERS,
  ...overrides,
});

describe('matchesFilters', () => {
  const pr = pullRequest();

  it('matches everything with the default filters', () => {
    expect(matchesFilters(pr, DEFAULT_FILTERS)).toBe(true);
  });

  it.each<[string, Partial<PullRequestFilters>, boolean]>([
    ['title (case-insensitive)', { search: 'LOGIN' }, true],
    ['#number', { search: '#42' }, true],
    ['unrelated text', { search: 'payments' }, false],
    ['owner', { owner: 'user' }, false],
    ['repository list', { repositories: ['acme/api', 'acme/web'] }, true],
    ['other repository', { repositories: ['acme/api'] }, false],
    ['author', { author: 'bob' }, false],
    ['draft', { draft: 'draft' }, false],
    ['ready', { draft: 'ready' }, true],
    ['label', { label: 'bug' }, true],
    ['missing label', { label: 'feature' }, false],
    ['review state', { review: 'APPROVED' }, false],
  ])('filters by %s', (_, filters, expected) => {
    expect(matchesFilters(pr, withFilters(filters))).toBe(expected);
  });
});

describe('age', () => {
  const now = new Date('2026-10-25T12:00:00Z').getTime();
  const daysAgo = (days: number) =>
    pullRequest({ createdAt: new Date(now - days * 24 * 60 * 60 * 1000) });

  it.each([
    [0.5, 'day'],
    [3, 'week'],
    [20, 'month'],
    [60, 'quarter'],
    [400, 'older'],
  ] as const)('puts a PR %s days old in the "%s" bucket', (days, bucket) => {
    expect(ageBucketOf(daysAgo(days), now)).toBe(bucket);
  });

  it('filters by age bucket', () => {
    expect(matchesFilters(daysAgo(3), withFilters({ age: 'week' }), now)).toBe(true);
    expect(matchesFilters(daysAgo(3), withFilters({ age: 'older' }), now)).toBe(false);
  });
});

describe('filterOptions', () => {
  it('returns distinct sorted values', () => {
    const options = filterOptions([
      pullRequest({ repository: 'acme/web', author: { login: 'bob', avatarUrl: '', url: '' } }),
      pullRequest({ repository: 'acme/api', labels: [{ name: 'ui', color: '' }] }),
    ]);

    expect(options).toEqual({
      repositories: ['acme/api', 'acme/web'],
      authors: ['alice', 'bob'],
      labels: ['bug', 'ui'],
    });
  });
});

describe('URL query params', () => {
  it('round-trips non-default filters', () => {
    const filters = withFilters({
      search: 'fix',
      repositories: ['acme/web'],
      draft: 'ready',
      age: 'week',
    });
    const params = filtersToParams(filters);

    expect(params).toEqual({ q: 'fix', repo: ['acme/web'], draft: 'ready', age: 'week' });
    expect(filtersFromParams(convertToParamMap(params))).toEqual(filters);
  });

  it('ignores invalid enum values', () => {
    const filters = filtersFromParams(convertToParamMap({ owner: 'hacker', review: 'nope' }));

    expect(filters).toEqual(DEFAULT_FILTERS);
  });
});
