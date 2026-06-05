// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginCredentials, AuthTokens, RegisterData, User } from '../models';

@Injectable({
  providedIn: 'root'   // Singleton — one instance for the whole app
})
export class AuthService {
  private readonly API = environment.apiUrl;

  // BehaviorSubject: holds and emits the current user.
  // null means not logged in.
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  // Public Observable that components subscribe to
  currentUser$ = this.currentUserSubject.asObservable();

  // Computed observable: true if a user is logged in
  isAuthenticated$ = this.currentUser$.pipe(map(user => user !== null));

  constructor(private http: HttpClient, private router: Router) {
    // On app startup, check if tokens exist and load the user
    if (this.getAccessToken()) {
      this.loadCurrentUser().subscribe({
        error: () => this.clearTokens()  // Token expired or invalid — clear it
      });
    }
  }

  // ─── Token Storage ────────────────────────────────────────────────────────
  // Using localStorage so tokens persist across browser refreshes.

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private saveTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
  }

  // ─── Auth Operations ──────────────────────────────────────────────────────

  login(credentials: LoginCredentials): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.API}/auth/login/`, credentials).pipe(
      tap(tokens => {
        this.saveTokens(tokens);
        // Load the user profile after successful login
        this.loadCurrentUser().subscribe();
      })
    );
  }

  register(data: RegisterData): Observable<User> {
    return this.http.post<User>(`${this.API}/auth/register/`, data);
  }

  logout(): void {
    this.clearTokens();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<AuthTokens> {
    const refresh = this.getRefreshToken();
    return this.http.post<AuthTokens>(`${this.API}/auth/refresh/`, { refresh }).pipe(
      tap(tokens => this.saveTokens(tokens))
    );
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API}/auth/me/`).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}
