// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: '/catalog', pathMatch: 'full' },

  // ── Public routes (guests only) ──────────────────────────────────────────
  {
    path: 'login',
    canActivate: [GuestGuard],
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [GuestGuard],
    loadComponent: () =>
      import('./pages/register/register.component').then(m => m.RegisterComponent)
  },

  // ── Public routes (authenticated users) ─────────────────────────────────
  {
    path: 'catalog',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/catalog/catalog.component').then(m => m.CatalogComponent)
  },
  {
    path: 'game/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/game-detail/game-detail.component').then(m => m.GameDetailComponent)
  },

  // ── Protected routes (authenticated users only) ──────────────────────────
  {
    path: 'library',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/library/library.component').then(m => m.LibraryComponent)
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },

  // Catch-all — redirect unknown routes to catalog
  { path: '**', redirectTo: '/catalog' }
];
