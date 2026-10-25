import { GithubConfig } from '../app/core/github/github.config';

/**
 * Copy this file to `github.secrets.ts` (git-ignored) and fill in your values.
 *
 * Token permissions (fine-grained PAT): Metadata, Pull requests, Commit statuses and Checks — all read-only.
 * Classic PAT: `repo` + `read:org`.
 */
export const configGitHub: GithubConfig = {
  token: 'paste token here',
  user: 'your-github-user',
  org: 'your-github-org',
};
