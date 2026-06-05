// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { User } from './models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <!-- ── Navigation Bar ── -->
    <nav class="navbar navbar-expand-lg navbar-dark" style="background: #1a1a2e;">
      <div class="container">
        <!-- Brand / Logo -->
        <a class="navbar-brand d-flex align-items-center gap-2" routerLink="/catalog">
          <span style="font-size:1.4rem;">🎮</span>
          <span class="fw-bold" style="color:#66c0f4; letter-spacing:1px;">Mini Steam</span>
        </a>

        <!-- Mobile toggle -->
        <button class="navbar-toggler" type="button"
                data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="mainNav">
          <!-- Left side links -->
          <ul class="navbar-nav me-auto">
            <li class="nav-item" *ngIf="currentUser">
              <a class="nav-link" routerLink="/catalog" routerLinkActive="active">
                🏪 Store
              </a>
            </li>
            <li class="nav-item" *ngIf="currentUser">
              <a class="nav-link" routerLink="/library" routerLinkActive="active">
                📚 Library
              </a>
            </li>
          </ul>

          <!-- Right side: auth links -->
          <ul class="navbar-nav ms-auto align-items-center">
            <!-- Not logged in -->
            <ng-container *ngIf="!currentUser">
              <li class="nav-item">
                <a class="nav-link" routerLink="/login">Login</a>
              </li>
              <li class="nav-item">
                <a class="btn btn-sm ms-2"
                   style="background:#66c0f4; color:#1a1a2e; font-weight:600;"
                   routerLink="/register">
                  Create Account
                </a>
              </li>
            </ng-container>

            <!-- Logged in -->
            <ng-container *ngIf="currentUser">
              <li class="nav-item">
                <a class="nav-link" routerLink="/profile" routerLinkActive="active">
                  👤 {{ currentUser.username }}
                </a>
              </li>
              <li class="nav-item">
                <button class="btn btn-sm btn-outline-danger ms-2"
                        (click)="logout()">
                  Logout
                </button>
              </li>
            </ng-container>
          </ul>
        </div>
      </div>
    </nav>

    <!-- ── Page Content ── -->
    <main class="min-vh-100" style="background:#16202d; color:#c6d4df;">
      <router-outlet></router-outlet>
    </main>

    <!-- ── Footer ── -->
    <footer class="text-center py-3" style="background:#1a1a2e; color:#8f98a0; font-size:0.85rem;">
      Mini Steam © 2026 — University Project · Django REST + Angular
    </footer>
  `
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to user changes so navbar updates on login/logout
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
