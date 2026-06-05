// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center"
         style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);">
      <div class="card shadow-lg border-0" style="width:100%; max-width:420px; background:#1e2a3a; color:#c6d4df;">

        <!-- Header -->
        <div class="card-body p-5">
          <div class="text-center mb-4">
            <div style="font-size:3rem;"></div>
            <h2 class="fw-bold mt-2" style="color:#66c0f4;">Mini Steam</h2>
            <p class="text-muted small">Sign in to your account</p>
          </div>

          <!-- Global error message -->
          <div *ngIf="errorMessage" class="alert alert-danger py-2 small">
            {{ errorMessage }}
          </div>

          <!-- Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">

            <!-- Username -->
            <div class="mb-3">
              <label class="form-label small fw-semibold" style="color:#8f98a0;">Username</label>
              <input
                type="text"
                class="form-control"
                formControlName="username"
                [class.is-invalid]="isInvalid('username')"
                placeholder="Enter your username"
                style="background:#16202d; border-color:#2a475e; color:#c6d4df;"
              />
              <div class="invalid-feedback" *ngIf="isInvalid('username')">
                Username is required.
              </div>
            </div>

            <!-- Password -->
            <div class="mb-4">
              <label class="form-label small fw-semibold" style="color:#8f98a0;">Password</label>
              <input
                type="password"
                class="form-control"
                formControlName="password"
                [class.is-invalid]="isInvalid('password')"
                placeholder="Enter your password"
                style="background:#16202d; border-color:#2a475e; color:#c6d4df;"
              />
              <div class="invalid-feedback" *ngIf="isInvalid('password')">
                Password is required.
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn w-100 fw-bold py-2"
              style="background:#66c0f4; color:#1a1a2e;"
              [disabled]="loginForm.invalid || isLoading"
            >
              <!-- Spinner shown during API call -->
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isLoading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <!-- Register link -->
          <p class="text-center mt-4 mb-0 small" style="color:#8f98a0;">
            No account?
            <a routerLink="/register" style="color:#66c0f4;">Create one for free</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Build the reactive form with validators
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  // Helper: returns true if a field is invalid AND has been touched
  isInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  onSubmit(): void {
    // Mark all fields as touched to trigger validation display
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/catalog']);
      },
      error: (err) => {
        this.isLoading = false;
        // Django returns { detail: "No active account found with the given credentials" }
        this.errorMessage = err.error?.detail || 'Login failed. Please check your credentials.';
      }
    });
  }
}
