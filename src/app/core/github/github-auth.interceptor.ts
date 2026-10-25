import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { GITHUB_API_URL, GITHUB_CONFIG } from './github.config';

/** Adds the GitHub token only to requests that target the GitHub API. */
export const githubAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(GITHUB_API_URL)) {
    return next(req);
  }

  const { token } = inject(GITHUB_CONFIG);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
