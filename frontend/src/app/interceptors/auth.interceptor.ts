// src/app/interceptors/auth.interceptor.ts
/**
 * JWT Auth Interceptor
 *
 * This runs on EVERY outgoing HTTP request.
 * It automatically attaches the JWT access token as a Bearer header.
 * If a request returns 401, it tries to refresh the token once,
 * then retries the original request.
 */

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Flag to prevent multiple simultaneous refresh attempts
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip adding token to public endpoints (login, register)
    const isAuthEndpoint = request.url.includes('/auth/login/') ||
                           request.url.includes('/auth/register/');

    const token = this.authService.getAccessToken();

    // Add the token to the request if we have one and it's not a public endpoint
    if (token && !isAuthEndpoint) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthEndpoint) {
          // Token expired — try to refresh
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap(tokens => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(tokens.access);
          // Retry original request with new token
          return next.handle(this.addToken(request, tokens.access));
        }),
        catchError(err => {
          // Refresh failed — session is truly expired, logout
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      // Another request is already refreshing — wait for it to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addToken(request, token!)))
      );
    }
  }
}
