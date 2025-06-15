import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { GastosPersonal, Personal } from '../models';
import { BibliotecarioService } from './bibliotecario.service';

@Injectable({
  providedIn: 'root'
})
export class GastosPersonalService {
  private readonly API_URL = 'http://localhost:3000'; // URL del backend

  constructor(
    private http: HttpClient,
    private bibliotecarioService: BibliotecarioService
  ) {}

  getGastosPersonal(proyectoId: string): Observable<GastosPersonal[]> {
    return this.http.get<GastosPersonal[]>(`${this.API_URL}/GastosPersonal?proyecto=eq.${proyectoId}`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo gastos de personal', error);
          return throwError(() => new Error('Error al obtener gastos de personal'));
        })
      );
  }

  getGastoPersonal(dni: string, proyecto: string, mes: number, anio: number): Observable<GastosPersonal> {
    return this.http.get<GastosPersonal[]>(`${this.API_URL}/GastosPersonal?dni=eq.${dni}&proyecto=eq.${proyecto}&mes=eq.${mes}&anio=eq.${anio}`)
      .pipe(
        map(response => {
          if (response && response.length > 0) {
            return response[0];
          } else {
            throw new Error('Gasto de personal no encontrado');
          }
        }),
        catchError(error => {
          console.error('Error obteniendo gasto de personal', error);
          return throwError(() => new Error('Error al obtener gasto de personal'));
        })
      );
  }

  createGastoPersonal(gastoPersonal: GastosPersonal): Observable<GastosPersonal> {
    return this.http.post<GastosPersonal>(`${this.API_URL}/GastosPersonal`, gastoPersonal)
      .pipe(
        catchError(error => {
          console.error('Error creando gasto de personal', error);
          return throwError(() => new Error('Error al crear gasto de personal'));
        })
      );
  }

  updateGastoPersonal(dni: string, proyecto: string, mes: number, anio: number, gastoPersonal: Partial<GastosPersonal>): Observable<GastosPersonal> {
    return this.http.patch<GastosPersonal>(`${this.API_URL}/GastosPersonal?dni=eq.${dni}&proyecto=eq.${proyecto}&mes=eq.${mes}&anio=eq.${anio}`, gastoPersonal)
      .pipe(
        catchError(error => {
          console.error('Error actualizando gasto de personal', error);
          return throwError(() => new Error('Error al actualizar gasto de personal'));
        })
      );
  }

  // Métodos para gestionar personal
  getPersonal(): Observable<Personal[]> {
    return this.http.get<Personal[]>(`${this.API_URL}/Personal`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo personal', error);
          return throwError(() => new Error('Error al obtener personal'));
        })
      );
  }

  getPersonalById(dni: string): Observable<Personal> {
    return this.http.get<Personal[]>(`${this.API_URL}/Personal?dni=eq.${dni}`)
      .pipe(
        map(response => {
          if (response && response.length > 0) {
            return response[0];
          } else {
            throw new Error('Personal no encontrado');
          }
        }),
        catchError(error => {
          console.error('Error obteniendo personal', error);
          return throwError(() => new Error('Error al obtener personal'));
        })
      );
  }

  createPersonal(personal: Personal): Observable<Personal> {
    return this.http.post<Personal>(`${this.API_URL}/Personal`, personal)
      .pipe(
        catchError(error => {
          console.error('Error creando personal', error);
          return throwError(() => new Error('Error al crear personal'));
        })
      );
  }

  updatePersonal(dni: string, personal: Partial<Personal>): Observable<Personal> {
    return this.http.patch<Personal>(`${this.API_URL}/Personal?dni=eq.${dni}`, personal)
      .pipe(
        catchError(error => {
          console.error('Error actualizando personal', error);
          return throwError(() => new Error('Error al actualizar personal'));
        })
      );
  }

  deletePersonal(dni: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/Personal?dni=eq.${dni}`)
      .pipe(
        catchError(error => {
          console.error('Error eliminando personal', error);
          return throwError(() => new Error('Error al eliminar personal'));
        })
      );
  }

  // Método para subir documento de nómina
  uploadDocumentoNomina(dni: string, proyecto: string, mes: number, anio: number, file: File): Observable<any> {
    return this.bibliotecarioService.subirDocumento(file, proyecto).pipe(
      catchError(error => {
        console.error('Error subiendo documento', error);
        return throwError(() => new Error('Error al subir documento'));
      })
    );
  }
} 