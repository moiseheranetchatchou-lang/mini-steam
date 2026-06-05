// src/app/services/games.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Game, Genre, PaginatedResponse } from '../models';

export interface GameFilters {
  search?: string;
  genre?: number;
  max_price?: number;
  free?: boolean;
  ordering?: string;
  page?: number;
}

@Injectable({ providedIn: 'root' })
export class GamesService {
  private readonly API = `${environment.apiUrl}/games`;
  private readonly GENRE_API = `${environment.apiUrl}/genres`;

  constructor(private http: HttpClient) {}

  // ─── Games ────────────────────────────────────────────────────────────────

  getGames(filters: GameFilters = {}): Observable<PaginatedResponse<Game>> {
    // Build query params dynamically from filters object
    let params = new HttpParams();
    if (filters.search)    params = params.set('search', filters.search);
    if (filters.genre)     params = params.set('genre', filters.genre.toString());
    if (filters.max_price) params = params.set('max_price', filters.max_price.toString());
    if (filters.free)      params = params.set('free', 'true');
    if (filters.ordering)  params = params.set('ordering', filters.ordering);
    if (filters.page)      params = params.set('page', filters.page.toString());

    return this.http.get<PaginatedResponse<Game>>(this.API + '/', { params });
  }

  getGame(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.API}/${id}/`);
  }

  createGame(game: Partial<Game>): Observable<Game> {
    return this.http.post<Game>(this.API + '/', game);
  }

  updateGame(id: number, game: Partial<Game>): Observable<Game> {
    return this.http.patch<Game>(`${this.API}/${id}/`, game);
  }

  deleteGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}/`);
  }

  // ─── Genres ───────────────────────────────────────────────────────────────

  getGenres(): Observable<PaginatedResponse<Genre>> {
    return this.http.get<PaginatedResponse<Genre>>(this.GENRE_API + '/');
  }
}
