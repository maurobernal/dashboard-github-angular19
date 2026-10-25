import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { configGitHub } from '../environments/github.secrets';
import { routes } from './app.routes';
import { githubAuthInterceptor } from './core/github/github-auth.interceptor';
import { provideGithubConfig } from './core/github/github.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([githubAuthInterceptor])),
    provideGithubConfig(configGitHub),
  ],
};
