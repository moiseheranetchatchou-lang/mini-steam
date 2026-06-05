// src/app/services/library.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LibraryEntry, LibraryCheckResponse, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private readonly API = `${environment.apiUrl}/library`;

  constructor(private http: HttpClient) {}

  getLibrary(): Observable<PaginatedResponse<LibraryEntry>> {
    return this.http.get<PaginatedResponse<LibraryEntry>>(this.API + '/');
  }

  getEntry(id: number): Observable<LibraryEntry> {
    return this.http.get<LibraryEntry>(`${this.API}/${id}/`);
  }

  addGame(gameId: number): Observable<LibraryEntry> {
    return this.http.post<LibraryEntry>(this.API + '/', { game: gameId });
  }

  updateEntry(id: number, data: Partial<LibraryEntry>): Observable<LibraryEntry> {
    return this.http.patch<LibraryEntry>(`${this.API}/${id}/`, data);
  }

  removeGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}/`);
  }

  checkGame(gameId: number): Observable<LibraryCheckResponse> {
    return this.http.get<LibraryCheckResponse>(`${this.API}/game/${gameId}/`);
  }
}
