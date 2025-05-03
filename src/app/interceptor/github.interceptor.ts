import { HttpInterceptorFn } from '@angular/common/http';

export const githubInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
