// src/app/models/index.ts
// TypeScript interfaces that mirror our Django models.
// These provide type safety throughout the Angular app.

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Game {
  id: number;
  title: string;
  description: string;
  developer: string;
  publisher: string;
  genre: number | null;
  genre_name: string | null;
  price: string;           // Django DecimalField comes as string
  is_free: boolean;
  release_date: string;
  cover_image: string | null;
  is_active: boolean;
  created_at: string;
  average_rating: number | null;
}

export interface LibraryEntry {
  id: number;
  game: number;            // Game ID (write)
  game_detail: Game;       // Full game data (read)
  added_at: string;
  playtime_minutes: number;
  playtime_hours: number;
  personal_note: string;
}

export interface Review {
  id: number;
  game: number;
  game_title: string;
  username: string;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
}

// Auth-related interfaces
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

// API pagination response wrapper
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// For library check endpoint
export interface LibraryCheckResponse {
  in_library: boolean;
  entry_id: number | null;
}
