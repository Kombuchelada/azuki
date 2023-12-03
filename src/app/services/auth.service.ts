import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import {
  AuthError,
  AuthSession,
  AuthTokenResponse,
} from '@supabase/supabase-js';
import { BehaviorSubject, Observable, from, map, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private sessionSubject$ = new BehaviorSubject<AuthSession | null>(null);

  session$ = this.sessionSubject$.asObservable();

  constructor(private supabase: SupabaseService) {
    this.updateSession();
  }

  logIn(email: string, password: string): Observable<AuthTokenResponse> {
    return from(
      this.supabase.client.auth.signInWithPassword({ email, password })
    ).pipe(tap(() => this.updateSession()));
  }

  logOut(): Observable<{ error: AuthError | null }> {
    return from(this.supabase.client.auth.signOut()).pipe(
      tap(() => this.updateSession())
    );
  }

  private updateSession(): void {
    from(
      this.supabase.client.auth.getSession().then(({ data }) => {
        return data.session;
      })
    )
      .pipe(
        take(1),
        map((response) => this.sessionSubject$.next(response))
      )
      .subscribe();
  }
}
