// src/app/services/reviews.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Review, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private readonly API = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getMyReviews(): Observable<PaginatedResponse<Review>> {
    return this.http.get<PaginatedResponse<Review>>(this.API + '/');
  }

  getGameReviews(gameId: number): Observable<PaginatedResponse<Review>> {
    const params = new HttpParams().set('game', gameId.toString());
    return this.http.get<PaginatedResponse<Review>>(this.API + '/', { params });
  }

  createReview(data: { game: number; rating: number; content: string }): Observable<Review> {
    return this.http.post<Review>(this.API + '/', data);
  }

  updateReview(id: number, data: Partial<Review>): Observable<Review> {
    return this.http.patch<Review>(`${this.API}/${id}/`, data);
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}/`);
  }
}
