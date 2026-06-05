// src/app/pages/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Custom validator: checks that password and password2 match
function passwordMatchValidator(control: AbstractControl) {
  const password = control.get('password');
  const password2 = control.get('password2');
  if (password && password2 && password.value !== password2.value) {
    password2.setErrors({ passwordMismatch: true });
  } else {
    if (password2?.hasError('passwordMismatch')) {
      password2.setErrors(null);
    }
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center py-5"
         style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);">
      <div class="card shadow-lg border-0" style="width:100%; max-width:480px; background:#1e2a3a; color:#c6d4df;">
        <div class="card-body p-5">

          <!-- Header -->
          <div class="text-center mb-4">
            <div style="font-size:2.5rem;">🎮</div>
            <h2 class="fw-bold mt-2" style="color:#66c0f4;">Create Account</h2>
            <p class="text-muted small">Join Mini Steam for free</p>
          </div>

          <!-- Server errors -->
          <div *ngIf="serverErrors.length" class="alert alert-danger py-2 small">
            <div *ngFor="let err of serverErrors">• {{ err }}</div>
          </div>

          <!-- Success message -->
          <div *ngIf="successMessage" class="alert alert-success py-2 small">
            {{ successMessage }}
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">

            <!-- First + Last Name in a row -->
            <div class="row g-3 mb-3">
              <div class="col">
                <label class="form-label small fw-semibold" style="color:#8f98a0;">First Name</label>
                <input type="text" class="form-control" formControlName="first_name"
                       placeholder="Optional"
                       style="background:#16202d; border-color:#2a475e; color:#c6d4df;" />
              </div>
              <div class="col">
                <label class="form-label small fw-semibold" style="color:#8f98a0;">Last Name</label>
                <input type="text" class="form-control" formControlName="last_name"
                       placeholder="Optional"
                       style="background:#16202d; border-color:#2a475e; color:#c6d4df;" />
              </div>
            </div>

            <!-- Username -->
            <div class="mb-3">
              <label class="form-label small fw-semibold" style="color:#8f98a0;">Username *</label>
              <input type="text" class="form-control" formControlName="username"
                     [class.is-invalid]="isInvalid('username')"
                     placeholder="Choose a username"
                     style="background:#16202d; border-color:#2a475e; color:#c6d4df;" />
              <div class="invalid-feedback">
                <span *ngIf="f['username'].errors?.['required']">Username is required.</span>
                <span *ngIf="f['username'].errors?.['minlength']">At least 3 characters.</span>
              </div>
            </div>

            <!-- Email -->
            <div class="mb-3">
              <label class="form-label small fw-semibold" style="color:#8f98a0;">Email *</label>
              <input type="email" class="form-control" formControlName="email"
                     [class.is-invalid]="isInvalid('email')"
                     placeholder="your@email.com"
                     style="background:#16202d; border-color:#2a475e; color:#c6d4df;" />
              <div class="invalid-feedback">
                <span *ngIf="f['email'].errors?.['required']">Email is required.</span>
                <span *ngIf="f['email'].errors?.['email']">Enter a valid email address.</span>
              </div>
            </div>

            <!-- Password -->
            <div class="mb-3">
              <label class="form-label small fw-semibold" style="color:#8f98a0;">Password *</label>
              <input type="password" class="form-control" formControlName="password"
                     [class.is-invalid]="isInvalid('password')"
                     placeholder="Min. 8 characters"
                     style="background:#16202d; border-color:#2a475e; color:#c6d4df;" />
              <div class="invalid-feedback">
                <span *ngIf="f['password'].errors?.['required']">Password is required.</span>
                <span *ngIf="f['password'].errors?.['minlength']">At least 8 characters.</span>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="mb-4">
              <label class="form-label small fw-semibold" style="color:#8f98a0;">Confirm Password *</label>
              <input type="password" class="form-control" formControlName="password2"
                     [class.is-invalid]="isInvalid('password2')"
                     placeholder="Repeat your password"
                     style="background:#16202d; border-color:#2a475e; color:#c6d4df;" />
              <div class="invalid-feedback">
                <span *ngIf="f['password2'].errors?.['required']">Please confirm your password.</span>
                <span *ngIf="f['password2'].errors?.['passwordMismatch']">Passwords do not match.</span>
              </div>
            </div>

            <!-- Submit -->
            <button type="submit" class="btn w-100 fw-bold py-2"
                    style="background:#66c0f4; color:#1a1a2e;"
                    [disabled]="registerForm.invalid || isLoading">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isLoading ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>

          <p class="text-center mt-4 mb-0 small" style="color:#8f98a0;">
            Already have an account?
            <a routerLink="/login" style="color:#66c0f4;">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  serverErrors: string[] = [];
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  // Shortcut to access form controls in the template
  get f() { return this.registerForm.controls; }

  isInvalid(field: string): boolean {
    const c = this.registerForm.get(field);
    return !!(c?.invalid && c?.touched);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.serverErrors = [];

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.successMessage = '✅ Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        // Parse DRF field-level errors into a flat list
        const errors = err.error;
        if (errors && typeof errors === 'object') {
          this.serverErrors = Object.entries(errors).flatMap(([field, msgs]) =>
            (msgs as string[]).map(msg => `${field}: ${msg}`)
          );
        } else {
          this.serverErrors = ['Registration failed. Please try again.'];
        }
      }
    });
  }
}
