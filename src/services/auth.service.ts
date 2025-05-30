import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);
  private currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(private router: Router) {
    this.supabase.auth.onAuthStateChange(async (_, session) => {
      this.currentUser$.next(session?.user ?? null);
    });

    this.loadUser();
  }

  private async loadUser() {
    const { data, error} = await this.supabase.auth.getUser();
    this.currentUser$.next(data.user ?? null);
  }

  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  signInWithOtp(email: string) {
    return this.supabase.auth.signInWithOtp({ email });
  }

  resetPassword(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email);
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.currentUser$.next(null);
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  getCurrentUserId(): string | null {
    return this.currentUser$.value?.id ?? null;
  }
}
