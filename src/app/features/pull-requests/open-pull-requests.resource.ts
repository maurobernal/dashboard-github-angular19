import { httpResource } from '@angular/common/http';
import { inject } from '@angular/core';
import { toPullRequestSearchResult } from './pull-request.mapper';
import { GITHUB_API_URL, GITHUB_CONFIG } from '../../core/github/github.config';
import {
  OPEN_PULL_REQUESTS_QUERY,
  OpenPullRequestsResponse,
  SEARCH_PAGE_SIZE,
  openPullRequestsSearch,
} from '../../core/github/open-pull-requests.query';

/**
 * Open pull requests of the configured organization and user, fetched with a single GraphQL call.
 * Must be called in an injection context.
 */
export function openPullRequestsResource() {
  const { org, user } = inject(GITHUB_CONFIG);

  return httpResource(
    () => ({
      url: `${GITHUB_API_URL}/graphql`,
      method: 'POST',
      body: {
        query: OPEN_PULL_REQUESTS_QUERY,
        variables: {
          orgQuery: openPullRequestsSearch('org', org),
          userQuery: openPullRequestsSearch('user', user),
          pageSize: SEARCH_PAGE_SIZE,
        },
      },
    }),
    {
      parse: (raw) => toPullRequestSearchResult(raw as OpenPullRequestsResponse),
      debugName: 'openPullRequests',
    },
  );
}
