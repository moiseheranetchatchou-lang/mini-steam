// src/app/pages/library/library.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { LibraryService } from '../../services/library.service';
import { LibraryEntry } from '../../models';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="container py-4">

      <!-- Header -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 class="fw-bold mb-1" style="color:#66c0f4;">My Library</h1>
          <p style="color:#8f98a0;">{{ entries.length }} game{{ entries.length !== 1 ? 's' : '' }} in your collection</p>
        </div>
        <a routerLink="/catalog" class="btn btn-sm" style="background:#66c0f4; color:#1a1a2e; font-weight:600;">
          + Browse Store
        </a>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border" style="color:#66c0f4; width:3rem; height:3rem;"></div>
        <p class="mt-3" style="color:#8f98a0;">Loading your library...</p>
      </div>

      <!-- Error -->
      <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <!-- Empty state -->
      <div *ngIf="!isLoading && entries.length === 0" class="text-center py-5">
        <div style="font-size:5rem;"></div>
        <h4 class="mt-3" style="color:#c6d4df;">Your library is empty</h4>
        <p style="color:#8f98a0;">Head to the store to add your first game!</p>
        <a routerLink="/catalog" class="btn mt-2" style="background:#66c0f4; color:#1a1a2e; font-weight:600;">
          Browse Store
        </a>
      </div>

      <!-- Library grid -->
      <div *ngIf="!isLoading && entries.length > 0" class="row g-4">
        <div class="col-sm-6 col-lg-4" *ngFor="let entry of entries">
          <div class="card border-0 h-100" style="background:#1e2a3a;">

            <!-- Cover -->
            <div style="height:140px; overflow:hidden; border-radius:8px 8px 0 0; background:#0f1923;"
                 class="d-flex align-items-center justify-content-center">
              <img *ngIf="entry.game_detail.cover_image"
                   [src]="entry.game_detail.cover_image"
                   class="w-100 h-100" style="object-fit:cover;" />
              <span *ngIf="!entry.game_detail.cover_image" style="font-size:3.5rem;">🎮</span>
            </div>

            <div class="card-body p-3 d-flex flex-column">
              <!-- Title -->
              <h6 class="fw-bold mb-1" style="color:#c6d4df;">
                <a [routerLink]="['/game', entry.game_detail.id]"
                   style="color:#c6d4df; text-decoration:none;">
                  {{ entry.game_detail.title }}
                </a>
              </h6>
              <p class="small mb-2" style="color:#8f98a0;">{{ entry.game_detail.developer }}</p>

              <!-- Playtime -->
              <div class="small mb-2" style="color:#66c0f4;">
                 {{ entry.playtime_hours }}h played
              </div>

              <!-- Added date -->
              <div class="small mb-3" style="color:#8f98a0;">
                Added {{ entry.added_at | date:'mediumDate' }}
              </div>

              <!-- Note editing -->
              <div *ngIf="editingId !== entry.id" class="mt-auto">
                <p *ngIf="entry.personal_note" class="small fst-italic mb-2"
                   style="color:#acb2b8; border-left:2px solid #2a475e; padding-left:8px;">
                  "{{ entry.personal_note }}"
                </p>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-secondary flex-grow-1"
                          (click)="startEdit(entry)">
                     Note
                  </button>
                  <button class="btn btn-sm btn-outline-danger"
                          (click)="removeFromLibrary(entry)"
                          [disabled]="removingId === entry.id">
                    <span *ngIf="removingId === entry.id" class="spinner-border spinner-border-sm"></span>
                    <span *ngIf="removingId !== entry.id">🗑️</span>
                  </button>
                </div>
              </div>

              <!-- Edit note form -->
              <div *ngIf="editingId === entry.id" class="mt-auto">
                <form [formGroup]="editForm" (ngSubmit)="saveNote(entry)">
                  <textarea class="form-control form-control-sm mb-2" formControlName="note"
                            rows="2" placeholder="Add a personal note..."
                            style="background:#16202d; border-color:#2a475e; color:#c6d4df;">
                  </textarea>
                  <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-sm flex-grow-1"
                            style="background:#66c0f4; color:#1a1a2e;" [disabled]="savingNote">
                      <span *ngIf="savingNote" class="spinner-border spinner-border-sm"></span>
                      <span *ngIf="!savingNote">Save</span>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary"
                            (click)="cancelEdit()">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LibraryComponent implements OnInit {
  entries: LibraryEntry[] = [];
  isLoading = true;
  errorMessage = '';
  editingId: number | null = null;
  savingNote = false;
  removingId: number | null = null;
  editForm: FormGroup;

  constructor(
    private libraryService: LibraryService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({ note: [''] });
  }

  ngOnInit(): void {
    this.loadLibrary();
  }

  loadLibrary(): void {
    this.isLoading = true;
    this.libraryService.getLibrary().subscribe({
      next: (res) => { this.entries = res.results; this.isLoading = false; },
      error: () => { this.errorMessage = 'Failed to load library.'; this.isLoading = false; }
    });
  }

  startEdit(entry: LibraryEntry): void {
    this.editingId = entry.id;
    this.editForm.setValue({ note: entry.personal_note });
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveNote(entry: LibraryEntry): void {
    this.savingNote = true;
    this.libraryService.updateEntry(entry.id, { personal_note: this.editForm.value.note }).subscribe({
      next: (updated) => {
        const i = this.entries.findIndex(e => e.id === entry.id);
        if (i !== -1) this.entries[i] = updated;
        this.editingId = null;
        this.savingNote = false;
      },
      error: () => this.savingNote = false
    });
  }

  removeFromLibrary(entry: LibraryEntry): void {
    if (!confirm(`Remove "${entry.game_detail.title}" from your library?`)) return;
    this.removingId = entry.id;
    this.libraryService.removeGame(entry.id).subscribe({
      next: () => {
        this.entries = this.entries.filter(e => e.id !== entry.id);
        this.removingId = null;
      },
      error: () => this.removingId = null
    });
  }
}
