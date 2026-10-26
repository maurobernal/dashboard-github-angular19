/** Max page size allowed by the GitHub GraphQL search API. */
export const SEARCH_PAGE_SIZE = 100;

export const OPEN_PULL_REQUESTS_QUERY = `
  query OpenPullRequests($orgQuery: String!, $userQuery: String!, $pageSize: Int!) {
    org: search(type: ISSUE, query: $orgQuery, first: $pageSize) { ...PullRequestSearch }
    user: search(type: ISSUE, query: $userQuery, first: $pageSize) { ...PullRequestSearch }
  }

  fragment PullRequestSearch on SearchResultItemConnection {
    issueCount
    nodes {
      ... on PullRequest {
        id
        number
        title
        url
        isDraft
        createdAt
        reviewDecision
        author { login avatarUrl url }
        repository { nameWithOwner url }
        labels(first: 10) { nodes { name color } }
        comments { totalCount }
        commits(last: 1) { nodes { commit { statusCheckRollup { state } } } }
      }
    }
  }
`;

export function openPullRequestsSearch(owner: 'org' | 'user', login: string): string {
  return `is:pr is:open archived:false ${owner}:${login}`;
}

export interface RawPullRequest {
  id: string;
  number: number;
  title: string;
  url: string;
  isDraft: boolean;
  createdAt: string;
  reviewDecision: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | null;
  /** `null` when the author account was deleted. */
  author: { login: string; avatarUrl: string; url: string } | null;
  repository: { nameWithOwner: string; url: string };
  labels: { nodes: { name: string; color: string }[] };
  comments: { totalCount: number };
  commits: {
    nodes: {
      commit: {
        statusCheckRollup: {
          state: 'SUCCESS' | 'FAILURE' | 'ERROR' | 'PENDING' | 'EXPECTED';
        } | null;
      };
    }[];
  };
}

interface RawSearchConnection {
  issueCount: number;
  nodes: RawPullRequest[];
}

export interface OpenPullRequestsResponse {
  data?: { org: RawSearchConnection; user: RawSearchConnection };
  errors?: { message: string }[];
}
