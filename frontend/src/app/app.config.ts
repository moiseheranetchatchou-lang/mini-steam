// src/app/app.config.ts
/**
 * Application configuration.
 * This is where we register global providers:
 * - HTTP client
 * - Router
 * - JWT Interceptor
 */

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Configure the Angular Router with our routes
    provideRouter(routes),

    // Enable HttpClient with support for class-based interceptors
    provideHttpClient(withInterceptorsFromDi()),

    // Register the JWT interceptor globally
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true   // Allow multiple interceptors to coexist
    }
  ]
};
