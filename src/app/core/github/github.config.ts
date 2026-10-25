import { InjectionToken, Provider } from '@angular/core';

export interface GithubConfig {
  token: string;
  user: string;
  org: string;
}

export const GITHUB_API_URL = 'https://api.github.com';

export const GITHUB_CONFIG = new InjectionToken<GithubConfig>('GITHUB_CONFIG');

export function provideGithubConfig(config: GithubConfig): Provider {
  return { provide: GITHUB_CONFIG, useValue: config };
}
