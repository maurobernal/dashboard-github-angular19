export type Owner = 'org' | 'user';

export type ReviewState = 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED' | 'NONE';

export type CheckState = 'SUCCESS' | 'FAILURE' | 'PENDING' | 'NONE';

export interface Label {
  name: string;
  /** Hex color without `#`, as returned by GitHub. */
  color: string;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  url: string;
  isDraft: boolean;
  createdAt: Date;
  author: { login: string; avatarUrl: string };
  /** `owner/name` */
  repository: string;
  owner: Owner;
  labels: Label[];
  comments: number;
  review: ReviewState;
  checks: CheckState;
}

export interface PullRequestSearchResult {
  pullRequests: PullRequest[];
  /** Total matches on GitHub; may be higher than `pullRequests.length` when results are truncated. */
  totalCount: number;
}
