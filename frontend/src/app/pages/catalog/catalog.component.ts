// src/app/pages/catalog/catalog.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { GamesService } from '../../services/games.service';
import { LibraryService } from '../../services/library.service';
import { Game, Genre } from '../../models';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="catalog-wrapper">

      <!-- ── Hero Header ── -->
      <div class="catalog-header">
        <div class="container">
          <h1 class="catalog-title">Game Store</h1>
          <p class="catalog-subtitle">
            <span class="count-badge">{{ totalCount }}</span>
            games available
          </p>
        </div>
      </div>

      <div class="container py-4">

        <!-- ── Filters ── -->
        <form [formGroup]="filterForm" class="filters-card mb-5">
          <div class="row g-3 align-items-end">

            <!-- Search -->
            <div class="col-md-4">
              <label class="filter-label">Search</label>
              <div class="search-wrapper">
                <span class="search-icon">🔍</span>
                <input type="text" class="filter-input ps-5"
                       formControlName="search"
                       placeholder="Title, developer..." />
              </div>
            </div>

            <!-- Genre -->
            <div class="col-md-3">
              <label class="filter-label">Genre</label>
              <select class="filter-input" formControlName="genre">
                <option value="">All Genres</option>
                <option *ngFor="let g of genres" [value]="g.id">{{ g.name }}</option>
              </select>
            </div>

            <!-- Price -->
            <div class="col-md-2">
              <label class="filter-label">Max Price</label>
              <select class="filter-input" formControlName="max_price">
                <option value="">Any Price</option>
                <option value="0">Free Only</option>
                <option value="10">Under $10</option>
                <option value="30">Under $30</option>
                <option value="60">Under $60</option>
              </select>
            </div>

            <!-- Sort -->
            <div class="col-md-2">
              <label class="filter-label">Sort By</label>
              <select class="filter-input" formControlName="ordering">
                <option value="title">Title A-Z</option>
                <option value="-title">Title Z-A</option>
                <option value="price">Price ↑</option>
                <option value="-price">Price ↓</option>
                <option value="-release_date">Newest</option>
              </select>
            </div>

            <!-- Reset -->
            <div class="col-md-1">
              <button type="button" class="btn-reset w-100" (click)="resetFilters()">
                ✕
              </button>
            </div>
          </div>
        </form>

        <!-- ── Loading ── -->
        <div *ngIf="isLoading" class="text-center py-5">
          <div class="custom-spinner"></div>
          <p class="mt-3 text-muted">Loading games...</p>
        </div>

        <!-- ── Error ── -->
        <div *ngIf="errorMessage && !isLoading" class="alert-error">
          ⚠️ {{ errorMessage }}
        </div>

        <!-- ── Games Grid ── -->
        <div *ngIf="!isLoading && !errorMessage" class="games-grid">
          <div class="game-card" *ngFor="let game of games"
               [routerLink]="['/game', game.id]">

            <!-- Cover -->
            <div class="game-cover">
              <img *ngIf="game.cover_image"
                   [src]="getImageUrl(game.cover_image)"
                   [alt]="game.title" />
              <div *ngIf="!game.cover_image" class="no-cover">
                <span>No Image</span>
              </div>

              <!-- Hover overlay -->
              <div class="cover-overlay">
                <span class="view-btn">View Details →</span>
              </div>

              <!-- Free badge -->
              <div *ngIf="game.is_free" class="free-badge">FREE</div>
            </div>

            <!-- Info -->
            <div class="game-info">
              <div class="game-genre" *ngIf="game.genre_name">
                {{ game.genre_name }}
              </div>
              <h3 class="game-title">{{ game.title }}</h3>
              <p class="game-dev">{{ game.developer }}</p>

              <!-- Rating -->
              <div *ngIf="game.average_rating" class="game-rating">
                <span class="stars">★</span>
                {{ game.average_rating }}/10
              </div>

              <!-- Footer -->
              <div class="game-footer">
                <span class="game-price">
                  <ng-container *ngIf="game.is_free">
                    <span class="price-free">FREE</span>
                  </ng-container>
                  <ng-container *ngIf="!game.is_free">
                    <span class="price-amount">\${{ game.price }}</span>
                  </ng-container>
                </span>

                <button class="add-btn"
                        [class.in-library]="libraryMap[game.id]"
                        (click)="toggleLibrary($event, game)"
                        [disabled]="loadingLibrary[game.id]">
                  <span *ngIf="loadingLibrary[game.id]"
                        class="spinner-border spinner-border-sm"></span>
                  <span *ngIf="!loadingLibrary[game.id]">
                    {{ libraryMap[game.id] ? '✓ Owned' : '+ Add' }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div *ngIf="games.length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h4>No games found</h4>
            <p>Try adjusting your filters</p>
            <button class="btn-reset-large" (click)="resetFilters()">
              Clear Filters
            </button>
          </div>
        </div>

        <!-- ── Pagination ── -->
        <div *ngIf="totalCount > 20" class="pagination-wrapper">
          <button class="page-btn" [disabled]="currentPage === 1"
                  (click)="goToPage(currentPage - 1)">← Prev</button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button class="page-btn" [disabled]="currentPage === totalPages"
                  (click)="goToPage(currentPage + 1)">Next →</button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* ── Wrapper ── */
    .catalog-wrapper {
      min-height: 100vh;
      background: #0e1821;
    }

    /* ── Header ── */
    .catalog-header {
      background: linear-gradient(180deg, #1a3a5c 0%, #0e1821 100%);
      padding: 3rem 0 2rem;
      border-bottom: 1px solid #1e3a5a;
    }
    .catalog-title {
      font-size: 2.8rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -1px;
      margin: 0;
    }
    .catalog-subtitle {
      color: #7a9bb5;
      margin: 0.5rem 0 0;
      font-size: 1rem;
    }
    .count-badge {
      background: #1e90ff;
      color: white;
      padding: 2px 10px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.85rem;
      margin-right: 4px;
    }

    /* ── Filters ── */
    .filters-card {
      background: #162330;
      border: 1px solid #1e3a5a;
      border-radius: 12px;
      padding: 1.5rem;
    }
    .filter-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: #7a9bb5;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .filter-input {
      width: 100%;
      background: #0e1821;
      border: 1px solid #1e3a5a;
      border-radius: 8px;
      color: #c6d4df;
      padding: 10px 14px;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .filter-input:focus {
      border-color: #1e90ff;
    }
    .search-wrapper {
      position: relative;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.9rem;
    }
    .btn-reset {
      background: transparent;
      border: 1px solid #1e3a5a;
      color: #7a9bb5;
      border-radius: 8px;
      padding: 10px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-reset:hover {
      border-color: #e74c3c;
      color: #e74c3c;
    }

    /* ── Games Grid ── */
    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.5rem;
    }

    /* ── Game Card ── */
    .game-card {
      background: #162330;
      border: 1px solid #1e3a5a;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }
    .game-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 40px rgba(30, 144, 255, 0.15);
      border-color: #1e90ff;
    }

    /* ── Cover ── */
    .game-cover {
      position: relative;
      height: 180px;
      overflow: hidden;
      background: #0a1520;
    }
    .game-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .game-card:hover .game-cover img {
      transform: scale(1.05);
    }
    .no-cover {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #2a475e;
      font-size: 0.85rem;
      background: #0a1520;
    }
    .cover-overlay {
      position: absolute;
      inset: 0;
      background: rgba(14, 24, 33, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .game-card:hover .cover-overlay {
      opacity: 1;
    }
    .view-btn {
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      border: 2px solid white;
      padding: 8px 16px;
      border-radius: 6px;
    }
    .free-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #27ae60;
      color: white;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }

    /* ── Game Info ── */
    .game-info {
      padding: 1rem;
    }
    .game-genre {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1e90ff;
      margin-bottom: 4px;
    }
    .game-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .game-dev {
      font-size: 0.8rem;
      color: #7a9bb5;
      margin: 0 0 8px;
    }
    .game-rating {
      font-size: 0.8rem;
      color: #f39c12;
      margin-bottom: 10px;
    }
    .stars { font-size: 0.9rem; }

    /* ── Footer ── */
    .game-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
    }
    .price-free {
      color: #27ae60;
      font-weight: 800;
      font-size: 0.95rem;
    }
    .price-amount {
      color: #1e90ff;
      font-weight: 800;
      font-size: 0.95rem;
    }

    /* ── Add Button ── */
    .add-btn {
      background: #1e3a5a;
      border: 1px solid #2a5580;
      color: #66c0f4;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .add-btn:hover:not(:disabled) {
      background: #1e90ff;
      border-color: #1e90ff;
      color: white;
    }
    .add-btn.in-library {
      background: #1a3a2a;
      border-color: #27ae60;
      color: #27ae60;
    }
    .add-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* ── Empty State ── */
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 0;
      color: #7a9bb5;
    }
    .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
    .empty-state h4 { color: #c6d4df; }
    .btn-reset-large {
      margin-top: 1rem;
      background: transparent;
      border: 1px solid #1e3a5a;
      color: #7a9bb5;
      padding: 8px 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-reset-large:hover {
      border-color: #1e90ff;
      color: #1e90ff;
    }

    /* ── Spinner ── */
    .custom-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #1e3a5a;
      border-top-color: #1e90ff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ── Error ── */
    .alert-error {
      background: rgba(231, 76, 60, 0.1);
      border: 1px solid #e74c3c;
      color: #e74c3c;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    /* ── Pagination ── */
    .pagination-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 3rem;
    }
    .page-btn {
      background: #162330;
      border: 1px solid #1e3a5a;
      color: #66c0f4;
      padding: 8px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }
    .page-btn:hover:not(:disabled) {
      background: #1e90ff;
      border-color: #1e90ff;
      color: white;
    }
    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .page-info {
      color: #7a9bb5;
      font-size: 0.9rem;
    }
  `]
})
export class CatalogComponent implements OnInit, OnDestroy {
  games: Game[] = [];
  genres: Genre[] = [];
  isLoading = false;
  errorMessage = '';
  totalCount = 0;
  currentPage = 1;
  totalPages = 1;
  libraryMap: Record<number, number> = {};
  loadingLibrary: Record<number, boolean> = {};
  filterForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private gamesService: GamesService,
    private libraryService: LibraryService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      genre: [''],
      max_price: [''],
      ordering: ['title']
    });
  }

  ngOnInit(): void {
    this.loadGenres();
    this.loadLibraryMap();
    this.loadGames();

    this.filterForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadGames();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGames(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const { search, genre, max_price, ordering } = this.filterForm.value;

    this.gamesService.getGames({
      search: search || undefined,
      genre: genre || undefined,
      max_price: max_price || undefined,
      free: max_price === '0' ? true : undefined,
      ordering,
      page: this.currentPage
    }).subscribe({
      next: (res) => {
        this.games = res.results;
        this.totalCount = res.count;
        this.totalPages = Math.ceil(res.count / 20);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load games. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadGenres(): void {
    this.gamesService.getGenres().subscribe({
      next: (res) => this.genres = res.results
    });
  }

  loadLibraryMap(): void {
    this.libraryService.getLibrary().subscribe({
      next: (res) => {
        res.results.forEach(entry => {
          this.libraryMap[entry.game] = entry.id;
        });
      }
    });
  }

  toggleLibrary(event: Event, game: Game): void {
    event.stopPropagation();
    this.loadingLibrary[game.id] = true;

    if (this.libraryMap[game.id]) {
      this.libraryService.removeGame(this.libraryMap[game.id]).subscribe({
        next: () => {
          delete this.libraryMap[game.id];
          this.loadingLibrary[game.id] = false;
        },
        error: () => this.loadingLibrary[game.id] = false
      });
    } else {
      this.libraryService.addGame(game.id).subscribe({
        next: (entry) => {
          this.libraryMap[game.id] = entry.id;
          this.loadingLibrary[game.id] = false;
        },
        error: () => this.loadingLibrary[game.id] = false
      });
    }
  }

  resetFilters(): void {
    this.filterForm.reset({
      search: '', genre: '', max_price: '', ordering: 'title'
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadGames();
    window.scrollTo(0, 0);
  }

  getImageUrl(path: string): string {
    if (path.startsWith('http')) return path;
    return 'http://localhost:8000' + path;
  }
}