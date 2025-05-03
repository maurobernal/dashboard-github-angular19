import { ApplicationConfig, provideExperimentalZonelessChangeDetection, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { githubInterceptor } from './interceptor/github.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [

    provideRouter(routes),
    provideHttpClient( withInterceptors([githubInterceptor]), withFetch()),
    provideCharts(withDefaultRegisterables()),
    provideExperimentalZonelessChangeDetection(),

  ]
};
