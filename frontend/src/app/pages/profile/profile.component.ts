// src/app/pages/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { LibraryService } from '../../services/library.service';
import { ReviewsService } from '../../services/reviews.service';
import { User } from '../../models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container py-4" style="max-width:700px;">
      <h1 class="fw-bold mb-4" style="color:#66c0f4;">👤 My Profile</h1>

      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border" style="color:#66c0f4;"></div>
      </div>

      <div *ngIf="user && !isLoading">
        <div class="row g-3 mb-4">
          <div class="col-4">
            <div class="card border-0 text-center p-3" style="background:#1e2a3a;">
              <div class="fw-bold" style="font-size:1.8rem; color:#66c0f4;">{{ libraryCount }}</div>
              <div class="small" style="color:#8f98a0;">Games Owned</div>
            </div>
          </div>
          <div class="col-4">
            <div class="card border-0 text-center p-3" style="background:#1e2a3a;">
              <div class="fw-bold" style="font-size:1.8rem; color:#66c0f4;">{{ reviewCount }}</div>
              <div class="small" style="color:#8f98a0;">Reviews Written</div>
            </div>
          </div>
          <div class="col-4">
            <div class="card border-0 text-center p-3" style="background:#1e2a3a;">
              <div class="fw-bold" style="font-size:1.8rem; color:#66c0f4;">{{ totalPlaytime }}h</div>
              <div class="small" style="color:#8f98a0;">Total Playtime</div>
            </div>
          </div>
        </div>

        <div class="card border-0 p-4" style="background:#1e2a3a;">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="fw-bold mb-0" style="color:#c6d4df;">Account Details</h5>
            <button *ngIf="!isEditing" class="btn btn-sm btn-outline-secondary" (click)="startEdit()">Edit Profile</button>
          </div>

          <div *ngIf="!isEditing">
            <div class="row mb-3">
              <div class="col-4 small fw-semibold" style="color:#8f98a0;">Username</div>
              <div class="col-8" style="color:#c6d4df;">{{ user.username }}</div>
            </div>
            <div class="row mb-3">
              <div class="col-4 small fw-semibold" style="color:#8f98a0;">Email</div>
              <div class="col-8" style="color:#c6d4df;">{{ user.email }}</div>
            </div>
            <div class="row mb-3">
              <div class="col-4 small fw-semibold" style="color:#8f98a0;">First Name</div>
              <div class="col-8" style="color:#c6d4df;">{{ user.first_name || '—' }}</div>
            </div>
            <div class="row mb-3">
              <div class="col-4 small fw-semibold" style="color:#8f98a0;">Last Name</div>
              <div class="col-8" style="color:#c6d4df;">{{ user.last_name || '—' }}</div>
            </div>
            <div class="row">
              <div class="col-4 small fw-semibold" style="color:#8f98a0;">Member Since</div>
              <div class="col-8" style="color:#c6d4df;">{{ user.date_joined | date:'longDate' }}</div>
            </div>
          </div>

          <div *ngIf="isEditing">
            <div *ngIf="updateSuccess" class="alert alert-success py-2 small mb-3">✅ Profile updated successfully!</div>
            <div *ngIf="updateError" class="alert alert-danger py-2 small mb-3">{{ updateError }}</div>
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
              <div class="row g-3 mb-3">
                <div class="col">
                  <label class="form-label small" style="color:#8f98a0;">First Name</label>
                  <input type="text" class="form-control" formControlName="first_name"
                         style="background:#16202d; border-color:#2a475e; color:#c6d4df;" />
                </div>
                <div class="col">
                  <label class="form-label small" style="color:#8f98a0;">Last Name</label>
                  <input type="text" class="form-control" formControlName="last_name"
                         style="background:#16202d; border-color:#2a475e; color:#c6d4df;" />
                </div>
              </div>
              <div class="mb-4">
                <label class="form-label small" style="color:#8f98a0;">Email</label>
                <input type="email" class="form-control" formControlName="email"
                       [class.is-invalid]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
                       style="background:#16202d; border-color:#2a475e; color:#c6d4df;" />
                <div class="invalid-feedback">Enter a valid email address.</div>
              </div>
              <div class="d-flex gap-2">
                <button type="submit" class="btn fw-bold" style="background:#66c0f4; color:#1a1a2e;"
                        [disabled]="profileForm.invalid || isSaving">
                  <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                  Save Changes
                </button>
                <button type="button" class="btn btn-outline-secondary" (click)="cancelEdit()">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isLoading = true;
  isEditing = false;
  isSaving = false;
  updateSuccess = false;
  updateError = '';
  libraryCount = 0;
  reviewCount = 0;
  totalPlaytime = 0;
  profileForm: FormGroup;
  private readonly API = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private libraryService: LibraryService,
    private reviewsService: ReviewsService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.authService.loadCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
        this.profileForm.patchValue({ first_name: user.first_name, last_name: user.last_name, email: user.email });
      },
      error: () => { this.isLoading = false; }
    });
    this.libraryService.getLibrary().subscribe(res => {
      this.libraryCount = res.count;
      this.totalPlaytime = Math.round(res.results.reduce((sum, e) => sum + e.playtime_hours, 0));
    });
    this.reviewsService.getMyReviews().subscribe(res => { this.reviewCount = res.count; });
  }

  startEdit(): void { this.isEditing = true; this.updateSuccess = false; this.updateError = ''; }

  cancelEdit(): void {
    this.isEditing = false;
    if (this.user) {
      this.profileForm.patchValue({ first_name: this.user.first_name, last_name: this.user.last_name, email: this.user.email });
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.isSaving = true;
    this.updateSuccess = false;
    this.updateError = '';
    this.http.put<User>(`${this.API}/auth/me/`, this.profileForm.value).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.isSaving = false;
        this.isEditing = false;
        this.updateSuccess = true;
        setTimeout(() => this.updateSuccess = false, 3000);
      },
      error: (err) => {
        this.isSaving = false;
        const errors = err.error;
        if (errors && typeof errors === 'object') {
          this.updateError = Object.values(errors).flat().join(' ');
        } else {
          this.updateError = 'Failed to update profile. Please try again.';
        }
      }
    });
  }
}
