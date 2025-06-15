import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, mergeMap } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Usuario } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000'; // URL de la API del backend
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  private tokenKey = 'gestionCSIC_auth_token';
  private userKey = 'gestionCSIC_user';

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem(this.userKey);
    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch (error) {
        // Limpiar datos corruptos del localStorage
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.tokenKey);
      }
    }
  }

  login(login: string, password: string): Observable<Usuario> {
    // Buscar usuario en la base de datos con las credenciales proporcionadas
    return this.http.get<Usuario[]>(`${this.API_URL}/Usuario?login=eq.${login}&password=eq.${password}`)
      .pipe(
        map(users => {
          if (users && users.length > 0) {
            const user = users[0];
            // Generar un token simple para la sesión del usuario
            const token = `token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
            
            localStorage.setItem(this.tokenKey, token);
            localStorage.setItem(this.userKey, JSON.stringify(user));
            this.currentUserSubject.next(user);
            
            return user;
          } else {
            throw new Error('Credenciales inválidas');
          }
        }),
        catchError(error => {
          console.error('Error durante el login', error);
          return throwError(() => new Error('Error de autenticación. Por favor, verifica tus credenciales.'));
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  isGestor(): boolean {
    const user = this.getCurrentUser();
    return !!user && !user.investigador;
  }

  isInvestigador(): boolean {
    const user = this.getCurrentUser();
    return !!user && user.investigador;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const user = this.getCurrentUser();
    if (!user) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    // Primero verificamos que la contraseña antigua sea correcta
    return this.http.get<Usuario[]>(`${this.API_URL}/Usuario?dni=eq.${user.dni}&password=eq.${oldPassword}`)
      .pipe(
        map(users => {
          if (users && users.length > 0) {
            // La contraseña antigua es correcta, procedemos a actualizarla
            return this.http.patch<Usuario>(`${this.API_URL}/Usuario?dni=eq.${user.dni}`, {
              password: newPassword
            }).pipe(
              tap(() => {
                // Actualizar el usuario almacenado en localStorage
                const updatedUser = {...user, password: newPassword};
                localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
                this.currentUserSubject.next(updatedUser);
              })
            );
          } else {
            throw new Error('La contraseña actual no es correcta');
          }
        }),
        catchError(error => {
          console.error('Error cambiando contraseña', error);
          return throwError(() => new Error('Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.'));
        })
      ).pipe(
        // Aplanar el observable-de-observable
        mergeMap(obs => obs)
      );
  }

  createInvestigador(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.API_URL}/users`, {
      ...usuario,
      investigador: true
    });
  }
} 