// src/app/guards/guest.guard.ts
/**
 * GuestGuard
 *
 * Prevents authenticated users from accessing login/register pages.
 * If already logged in, redirect to the catalog.
 */

import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (!this.authService.isAuthenticated()) {
      return true;
    }
    return this.router.createUrlTree(['/catalog']);
  }
}
