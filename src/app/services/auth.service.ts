import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Persona } from '../clases/persona';
import { Colecciones, DatabaseService } from './database.service';
import { ErrorCodes, Exception } from '../clases/exception';
import { Cliente } from '../clases/cliente';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );
  private currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(private router: Router) {
    this.supabase.auth.onAuthStateChange(async (_, session) => {
      this.currentUser$.next(session?.user ?? null);
    });

    this.loadUser();
  }

  private async loadUser() {
    const { data, error } = await this.supabase.auth.getUser();
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

  async registrarUsuario(usuario: Persona, password: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signUp({
      email: usuario.correo,
      password: password,
    });

    if (error) {
      throw new Error('auth-error: ' + error.message);
    }

    const user = data.user;
    if (!user) {
      throw new Error('auth-null: No se pudo crear el usuario.');
    }

    const { error: insertError } = await this.supabase.from('usuarios').insert({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      dni: usuario.dni,
      email: usuario.correo,
      foto_url: usuario.fotoUrl,
      rol: usuario.perfil,
    });

    if (insertError) {
      throw new Error('auth-error: db-error' + insertError.message);
    }
  }
}
