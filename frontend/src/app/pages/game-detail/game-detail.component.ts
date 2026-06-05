// src/app/pages/game-detail/game-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GamesService } from '../../services/games.service';
import { LibraryService } from '../../services/library.service';
import { ReviewsService } from '../../services/reviews.service';
import { Game, Review, LibraryCheckResponse } from '../../models';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="container py-4">

      <!-- Back button -->
      <a routerLink="/catalog" class="btn btn-sm btn-outline-secondary mb-4">
        ← Back to Store
      </a>

      <!-- Loading -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border" style="color:#66c0f4; width:3rem; height:3rem;"></div>
      </div>

      <!-- Game not found -->
      <div *ngIf="!isLoading && !game" class="text-center py-5">
        <p style="color:#8f98a0;">Game not found.</p>
      </div>

      <!-- Game Details -->
      <div *ngIf="game && !isLoading">
        <div class="row g-4">

          <!-- Left: Cover + Actions -->
          <div class="col-md-3">
            <div class="card border-0" style="background:#1e2a3a;">
              <!-- Cover image -->
              <div style="height:220px; overflow:hidden; border-radius:8px; background:#0f1923;"
                   class="d-flex align-items-center justify-content-center">
                <img *ngIf="game.cover_image" [src]="game.cover_image"
                     class="w-100 h-100" style="object-fit:cover;" [alt]="game.title" />
                <span *ngIf="!game.cover_image" style="font-size:5rem;">🎮</span>
              </div>

              <!-- Price & CTA -->
              <div class="p-3 text-center">
                <div class="fw-bold mb-3" style="font-size:1.5rem;">
                  <span *ngIf="game.is_free" style="color:#4caf50;">FREE</span>
                  <span *ngIf="!game.is_free" style="color:#66c0f4;">\${{ game.price }}</span>
                </div>

                <!-- Library action button -->
                <button class="btn w-100 fw-bold"
                        [style]="inLibrary ? 'background:#4caf50; color:white;' : 'background:#66c0f4; color:#1a1a2e;'"
                        (click)="toggleLibrary()"
                        [disabled]="libraryLoading">
                  <span *ngIf="libraryLoading" class="spinner-border spinner-border-sm me-1"></span>
                  <ng-container *ngIf="!libraryLoading">
                    {{ inLibrary ? '✓ In Your Library' : '+ Add to Library' }}
                  </ng-container>
                </button>

                <!-- Library success/error -->
                <div *ngIf="libraryMessage" class="alert mt-2 py-1 small"
                     [class.alert-success]="!libraryError"
                     [class.alert-danger]="libraryError">
                  {{ libraryMessage }}
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Details -->
          <div class="col-md-9">
            <div class="card border-0 p-4" style="background:#1e2a3a;">

              <!-- Title + genre -->
              <div class="d-flex align-items-start justify-content-between mb-3">
                <div>
                  <h1 class="fw-bold mb-1" style="color:#c6d4df;">{{ game.title }}</h1>
                  <span *ngIf="game.genre_name" class="badge"
                        style="background:#2a475e; color:#66c0f4;">
                    {{ game.genre_name }}
                  </span>
                </div>
                <div *ngIf="game.average_rating" class="text-end">
                  <div style="font-size:1.5rem; color:#f6c90e;"></div>
                  <div class="fw-bold" style="color:#f6c90e;">{{ game.average_rating }}/10</div>
                  <div class="small" style="color:#8f98a0;">{{ reviews.length }} reviews</div>
                </div>
              </div>

              <!-- Meta info -->
              <div class="row mb-3" style="color:#8f98a0; font-size:0.9rem;">
                <div class="col-sm-4">
                  <span class="fw-semibold" style="color:#c6d4df;">Developer:</span>
                  {{ game.developer }}
                </div>
                <div class="col-sm-4">
                  <span class="fw-semibold" style="color:#c6d4df;">Publisher:</span>
                  {{ game.publisher }}
                </div>
                <div class="col-sm-4">
                  <span class="fw-semibold" style="color:#c6d4df;">Release:</span>
                  {{ game.release_date | date:'mediumDate' }}
                </div>
              </div>

              <!-- Description -->
              <hr style="border-color:#2a475e;" />
              <p style="color:#acb2b8; line-height:1.7;">{{ game.description }}</p>
            </div>

            <!-- ── Reviews Section ── -->
            <div class="card border-0 p-4 mt-4" style="background:#1e2a3a;">
              <h4 class="fw-bold mb-3" style="color:#c6d4df;">
                Reviews
                <span class="badge ms-2" style="background:#2a475e; color:#8f98a0; font-size:0.8rem;">
                  {{ reviews.length }}
                </span>
              </h4>

              <!-- Write a review (only if game is in library and no existing review) -->
              <div *ngIf="inLibrary && !userReview" class="mb-4">
                <h6 style="color:#66c0f4;">Write a Review</h6>

                <div *ngIf="reviewError" class="alert alert-danger py-2 small">{{ reviewError }}</div>

                <form [formGroup]="reviewForm" (ngSubmit)="submitReview()">
                  <div class="mb-2">
                    <label class="form-label small" style="color:#8f98a0;">
                      Rating: {{ reviewForm.get('rating')?.value }}/10
                    </label>
                    <input type="range" class="form-range" formControlName="rating"
                           min="1" max="10" step="1" />
                  </div>
                  <div class="mb-2">
                    <textarea class="form-control" formControlName="content" rows="3"
                              placeholder="Share your thoughts about this game..."
                              style="background:#16202d; border-color:#2a475e; color:#c6d4df;">
                    </textarea>
                  </div>
                  <button type="submit" class="btn btn-sm fw-bold"
                          style="background:#66c0f4; color:#1a1a2e;"
                          [disabled]="reviewForm.invalid || reviewLoading">
                    <span *ngIf="reviewLoading" class="spinner-border spinner-border-sm me-1"></span>
                    Submit Review
                  </button>
                </form>
              </div>

              <!-- User's existing review -->
              <div *ngIf="userReview" class="alert mb-3"
                   style="background:#1e3a1e; border-color:#4caf50; color:#c6d4df;">
                <div class="d-flex justify-content-between">
                  <strong style="color:#4caf50;">Your Review — {{ userReview.rating }}/10</strong>
                  <button class="btn btn-sm btn-outline-danger"
                          (click)="deleteReview()" [disabled]="reviewLoading">Delete</button>
                </div>
                <p class="mb-0 mt-1 small">{{ userReview.content }}</p>
              </div>

              <!-- Reviews loading -->
              <div *ngIf="reviewsLoading" class="text-center py-3">
                <div class="spinner-border spinner-border-sm" style="color:#66c0f4;"></div>
              </div>

              <!-- Reviews list -->
              <div *ngFor="let review of reviews">
                <div *ngIf="review.username !== currentUsername"
                     class="border-bottom py-3" style="border-color:#2a475e !important;">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-semibold small" style="color:#c6d4df;">{{ review.username }}</span>
                    <div>
                      <span class="badge me-2" style="background:#2a475e; color:#f6c90e;">
                         {{ review.rating }}/10
                      </span>
                      <span class="small" style="color:#8f98a0;">
                        {{ review.created_at | date:'mediumDate' }}
                      </span>
                    </div>
                  </div>
                  <p class="mb-0 small" style="color:#acb2b8;">{{ review.content }}</p>
                </div>
              </div>

              <!-- No reviews yet -->
              <p *ngIf="!reviewsLoading && reviews.length === 0" style="color:#8f98a0;" class="mb-0">
                No reviews yet. Add this game to your library to leave the first review!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GameDetailComponent implements OnInit {
  game: Game | null = null;
  reviews: Review[] = [];
  isLoading = true;
  reviewsLoading = false;
  libraryLoading = false;
  reviewLoading = false;
  inLibrary = false;
  libraryEntryId: number | null = null;
  userReview: Review | null = null;
  libraryMessage = '';
  libraryError = false;
  reviewError = '';
  currentUsername = '';
  reviewForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private gamesService: GamesService,
    private libraryService: LibraryService,
    private reviewsService: ReviewsService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      rating: [7, [Validators.required, Validators.min(1), Validators.max(10)]],
      content: ['']
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadGame(id);
    this.loadLibraryStatus(id);
    this.loadReviews(id);
  }

  loadGame(id: number): void {
    this.gamesService.getGame(id).subscribe({
      next: (game) => { this.game = game; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  loadLibraryStatus(id: number): void {
    this.libraryService.checkGame(id).subscribe({
      next: (res: LibraryCheckResponse) => {
        this.inLibrary = res.in_library;
        this.libraryEntryId = res.entry_id;
      }
    });
  }

  loadReviews(id: number): void {
    this.reviewsLoading = true;
    this.reviewsService.getGameReviews(id).subscribe({
      next: (res) => {
        this.reviews = res.results;
        // Find the current user's review if it exists
        this.reviewsService.getMyReviews().subscribe(myRes => {
          this.userReview = myRes.results.find(r => r.game === id) || null;
        });
        this.reviewsLoading = false;
      },
      error: () => this.reviewsLoading = false
    });
  }

  toggleLibrary(): void {
    if (!this.game) return;
    this.libraryLoading = true;
    this.libraryMessage = '';

    if (this.inLibrary && this.libraryEntryId) {
      this.libraryService.removeGame(this.libraryEntryId).subscribe({
        next: () => {
          this.inLibrary = false;
          this.libraryEntryId = null;
          this.libraryLoading = false;
          this.libraryMessage = 'Removed from your library.';
          this.libraryError = false;
        },
        error: () => this.libraryLoading = false
      });
    } else {
      this.libraryService.addGame(this.game.id).subscribe({
        next: (entry) => {
          this.inLibrary = true;
          this.libraryEntryId = entry.id;
          this.libraryLoading = false;
          this.libraryMessage = '✓ Added to your library!';
          this.libraryError = false;
        },
        error: (err) => {
          this.libraryLoading = false;
          this.libraryMessage = err.error?.game?.[0] || 'Could not add game.';
          this.libraryError = true;
        }
      });
    }
  }

  submitReview(): void {
    if (!this.game || this.reviewForm.invalid) return;
    this.reviewLoading = true;
    this.reviewError = '';

    this.reviewsService.createReview({
      game: this.game.id,
      rating: this.reviewForm.value.rating,
      content: this.reviewForm.value.content
    }).subscribe({
      next: (review) => {
        this.userReview = review;
        this.reviews.unshift(review);
        this.reviewLoading = false;
      },
      error: (err) => {
        this.reviewLoading = false;
        const errors = err.error;
        if (errors && typeof errors === 'object') {
          this.reviewError = Object.values(errors).flat().join(' ');
        } else {
          this.reviewError = 'Failed to submit review.';
        }
      }
    });
  }

  deleteReview(): void {
    if (!this.userReview) return;
    this.reviewLoading = true;
    this.reviewsService.deleteReview(this.userReview.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== this.userReview!.id);
        this.userReview = null;
        this.reviewLoading = false;
      },
      error: () => this.reviewLoading = false
    });
  }
}
