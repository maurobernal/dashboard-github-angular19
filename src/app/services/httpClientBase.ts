import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { configGitHub } from 'enviroments.secrets';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import SweetAlertService from './sweetalert.service';

function handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = '';
  if (error.error instanceof ErrorEvent) {
    errorMessage = error.error.message;
  } else {
    errorMessage = `Error code: ${error.status}, message: ${error.message}`;
  }
  SweetAlertService.showErrorPopUpWithText( errorMessage, error?.url?? 'error',);
  return throwError(() => new Error(errorMessage));
}

export default class HttpClientBase {
  private readonly retry = 2;

  constructor(
    private readonly httpClient: HttpClient,
    public BaseAddress: string,
  ) {}

  get<T>(endpoint: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${configGitHub.token}`,
      }),
    };

    return this.httpClient
      .get<T>(`${this.BaseAddress}${endpoint}`, httpOptions)
      .pipe(retry(this.retry), catchError(handleError));
  }
}
