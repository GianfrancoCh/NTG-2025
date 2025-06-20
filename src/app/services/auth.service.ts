import { EventEmitter, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Persona } from '../clases/persona';
import { Jefe } from '../clases/jefe';
import { Colecciones, DatabaseService } from './database.service';
import { ErrorCodes, Exception } from '../clases/exception';
import { Cliente } from '../clases/cliente';
import { Empleado } from '../clases/empleado';
import OneSignal from 'onesignal-cordova-plugin';
import { PushNotificationService } from './push-notification.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  private currentUser$ = new BehaviorSubject<User | null>(null);
  databaseService: DatabaseService = inject(DatabaseService);
  pushService: PushNotificationService = inject(PushNotificationService);

  private usuarioEnSesion: Persona | null = null;

  get UsuarioEnSesion(): Persona | null {
    return this.usuarioEnSesion;
  }

  constructor(private router: Router) {
    this.supabase.auth.onAuthStateChange(async (_, session) => {
      this.currentUser$.next(session?.user ?? null);
    });

    this.loadUser();
  }

  private async loadUser() {
    const { data } = await this.supabase.auth.getUser();
    this.currentUser$.next(data.user ?? null);
  }

  async cargarDatosUsuario(email: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (data && !error) {
      this.usuarioEnSesion = data as Persona;
      console.log(
        'Usuario en sesión cargado desde login:',
        this.usuarioEnSesion
      );
    } else {
      console.warn('No se encontró el usuario en la base de datos.');
    }
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
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  getCurrentUserId(): string | null {
    return this.currentUser$.value?.id ?? null;
  }

  async registrarUsuario(usuario: Persona, password: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signUp({
      email: usuario.email,
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
      email: usuario.email,
      foto_url: usuario.foto_url,
      rol: usuario.rol,
    });

    if (insertError) {
      throw new Error('auth-error: db-error' + insertError.message);
    }
  }

  async obtenerUsuarioCliente(): Promise<Cliente | null> {
    const email = this.currentUser$.value?.email;
    if (!email) return null;

    const { data, error } = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data || data.rol !== 'cliente') return null;

    // Mapeamos manualmente a la clase Cliente si hace falta
    const cliente: Cliente = {
      ...data,
      estado: data.estado as
        | 'aceptado'
        | 'pendiente'
        | 'rechazado'
        | 'no necesita',
      tipo: data.tipo ?? 'registrado',
      idMesa: null, // si tenés este campo en otro lado, podés traerlo también
    };

    return cliente;
  }

  async registrarSupervisor(usuario: Jefe, password: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signUp({
      email: usuario.email,
      password: password,
    });

    if (error) {
      throw new Error('auth-error: ' + error.message);
    }

    const user = data.user;
    if (!user) {
      throw new Error('auth-null: No se pudo crear el usuario.');
    }

    // Obtenemos el playerId del dispositivo
    const playerId = await this.pushService.loadPlayerId();
    console.log('Player ID obtenido:', playerId);

    const { error: insertError } = await this.supabase.from('usuarios').insert({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      dni: usuario.dni,
      cuil: usuario.cuil,
      email: usuario.email,
      foto_url: usuario.foto_url,
      rol: usuario.rol,
      player_id: playerId, // agregamos el player_id
    });

    if (insertError) {
      throw new Error('auth-error: db-error' + insertError.message);
    }
  }

  // Registro de empleado
  async registrarEmpleado(usuario: Empleado, password: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signUp({
      email: usuario.email,
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
      cuil: usuario.cuil,
      email: usuario.email,
      foto_url: usuario.foto_url,
      rol: usuario.tipo,
    });

    if (insertError) {
      throw new Error('auth-error: db-error' + insertError.message);
    }
  }

  async registrarCliente(usuario: Cliente, password: string): Promise<void> {
    await OneSignal.logout();

    const { data, error } = await this.supabase.auth.signUp({
      email: usuario.email,
      password: password,
    });

    if (error) {
      throw new Error('auth-error: ' + error.message);
    }

    const user = data.user;
    if (!user) {
      throw new Error('auth-null: No se pudo crear el usuario.');
    }

    await OneSignal.login(user.id);

    const playerId = await this.pushService.loadPlayerId();
    console.log('Player ID obtenido:', playerId);

    const { error: insertError } = await this.supabase.from('usuarios').insert({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      dni: usuario.dni,
      email: usuario.email,
      foto_url: usuario.foto_url,
      rol: usuario.rol,
      estado: 'pendiente',
      player_id: playerId,
    });

    if (insertError) {
      throw new Error('auth-error: db-error' + insertError.message);
    }

    // Notificar a los jefes
    await this.pushService.notificarJefesNuevoUsuario(
      usuario.nombre,
      usuario.apellido
    );
  }

  async registrarUsuarioAnonimo(usuarioAnonimo: Persona): Promise<void> {
    try {
      // Generamos email y contraseña aleatoria
      const randomId = Math.floor(Math.random() * 1000000);
      const email = `anon${randomId}@anon.com`;
      const password = `anon${randomId}`;

      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (error || !data.user) {
        throw new Error(
          'auth-error: ' +
            (error?.message || 'No se pudo crear el usuario anónimo.')
        );
      }

      // Insertamos en la tabla 'usuarios'
      const { error: insertError } = await this.supabase
        .from('usuarios')
        .insert({
          nombre: usuarioAnonimo.nombre,
          apellido: usuarioAnonimo.apellido,
          dni: usuarioAnonimo.dni,
          email,
          foto_url: usuarioAnonimo.foto_url,
          rol: usuarioAnonimo.rol || 'anonimo',
          // estado: 'no necesita', // si es necesario
        });

      if (insertError) {
        throw new Error('auth-error: db-error ' + insertError.message);
      }

      // this.sesionEventEmitter.emit({ sesionAbierta: true });
      console.log(usuarioAnonimo);
    } catch (error: any) {
      throw new Error('auth-error: ' + error.message);
    }
  }
}
