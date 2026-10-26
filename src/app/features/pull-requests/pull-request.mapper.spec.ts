import { RawPullRequest } from '../../core/github/open-pull-requests.query';
import { toPullRequest, toPullRequestSearchResult } from './pull-request.mapper';

function rawPullRequest(overrides: Partial<RawPullRequest> = {}): RawPullRequest {
  return {
    id: 'PR_1',
    number: 1,
    title: 'Add feature',
    url: 'https://github.com/acme/api/pull/1',
    isDraft: false,
    createdAt: '2026-10-01T10:00:00Z',
    reviewDecision: null,
    author: { login: 'alice', avatarUrl: 'https://avatars/alice', url: 'https://github.com/alice' },
    repository: { nameWithOwner: 'acme/api', url: 'https://github.com/acme/api' },
    labels: { nodes: [{ name: 'bug', color: 'd73a4a' }] },
    comments: { totalCount: 3 },
    commits: { nodes: [{ commit: { statusCheckRollup: { state: 'SUCCESS' } } }] },
    ...overrides,
  };
}

describe('toPullRequest', () => {
  it('maps the GraphQL node to the domain model', () => {
    const pr = toPullRequest(rawPullRequest(), 'org');

    expect(pr).toMatchObject({
      id: 'PR_1',
      repository: 'acme/api',
      repositoryUrl: 'https://github.com/acme/api',
      owner: 'org',
      comments: 3,
      review: 'NONE',
      checks: 'SUCCESS',
      labels: [{ name: 'bug', color: 'd73a4a' }],
    });
    expect(pr.createdAt).toEqual(new Date('2026-10-01T10:00:00Z'));
  });

  it.each([
    ['ERROR', 'FAILURE'],
    ['FAILURE', 'FAILURE'],
    ['EXPECTED', 'PENDING'],
    ['PENDING', 'PENDING'],
  ] as const)('maps check state %s to %s', (state, expected) => {
    const raw = rawPullRequest({
      commits: { nodes: [{ commit: { statusCheckRollup: { state } } }] },
    });
    expect(toPullRequest(raw, 'org').checks).toBe(expected);
  });

  it('handles PRs without checks or author', () => {
    const pr = toPullRequest(rawPullRequest({ commits: { nodes: [] }, author: null }), 'user');

    expect(pr.checks).toBe('NONE');
    expect(pr.author.login).toBe('ghost');
  });
});

describe('toPullRequestSearchResult', () => {
  it('merges org and user results, newest first', () => {
    const older = rawPullRequest({ id: 'old', createdAt: '2026-01-01T00:00:00Z' });
    const newer = rawPullRequest({ id: 'new', createdAt: '2026-06-01T00:00:00Z' });

    const result = toPullRequestSearchResult({
      data: { org: { issueCount: 5, nodes: [older] }, user: { issueCount: 1, nodes: [newer] } },
    });

    expect(result.pullRequests.map((pr) => [pr.id, pr.owner])).toEqual([
      ['new', 'user'],
      ['old', 'org'],
    ]);
    expect(result.totalCount).toBe(6);
  });

  it('throws on GraphQL errors so the resource enters the error state', () => {
    expect(() => toPullRequestSearchResult({ errors: [{ message: 'Bad credentials' }] })).toThrow(
      'Bad credentials',
    );
  });
});
