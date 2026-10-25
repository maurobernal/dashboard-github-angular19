import {
  OpenPullRequestsResponse,
  RawPullRequest,
} from '../../core/github/open-pull-requests.query';
import { CheckState, Owner, PullRequest, PullRequestSearchResult } from './pull-request.model';

const GHOST_AUTHOR = { login: 'ghost', avatarUrl: 'https://github.com/ghost.png' };

/** GraphQL reports query errors with HTTP 200, so they are turned into exceptions here. */
export function toPullRequestSearchResult(
  response: OpenPullRequestsResponse,
): PullRequestSearchResult {
  if (response.errors?.length || !response.data) {
    const message = response.errors?.map((e) => e.message).join('; ');
    throw new Error(message || 'GitHub returned an empty response');
  }

  const { org, user } = response.data;
  return {
    pullRequests: [
      ...org.nodes.map((pr) => toPullRequest(pr, 'org')),
      ...user.nodes.map((pr) => toPullRequest(pr, 'user')),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    totalCount: org.issueCount + user.issueCount,
  };
}

export function toPullRequest(raw: RawPullRequest, owner: Owner): PullRequest {
  return {
    id: raw.id,
    number: raw.number,
    title: raw.title,
    url: raw.url,
    isDraft: raw.isDraft,
    createdAt: new Date(raw.createdAt),
    author: raw.author ?? GHOST_AUTHOR,
    repository: raw.repository.nameWithOwner,
    owner,
    labels: raw.labels.nodes,
    comments: raw.comments.totalCount,
    review: raw.reviewDecision ?? 'NONE',
    checks: toCheckState(raw.commits.nodes[0]?.commit.statusCheckRollup?.state),
  };
}

function toCheckState(state: string | undefined): CheckState {
  switch (state) {
    case 'SUCCESS':
      return 'SUCCESS';
    case 'FAILURE':
    case 'ERROR':
      return 'FAILURE';
    case 'PENDING':
    case 'EXPECTED':
      return 'PENDING';
    default:
      return 'NONE';
  }
}
