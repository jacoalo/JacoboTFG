import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, forkJoin, map } from 'rxjs';
import { Proyecto } from '../models';
import { AuthService } from './auth.service';
import { GastosPersonal, Personal } from '../models';

export interface DocumentoProyecto {
  id: string;
  tipo: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {
  private readonly API_URL = 'http://localhost:3000'; // URL del backend

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getProyectos(): Observable<Proyecto[]> {
    // Si es gestor, obtenemos todos los proyectos
    // Si es investigador, solo los asignados a él
    const user = this.authService.getCurrentUser();
    if (!user) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    let url = `${this.API_URL}/Proyecto`;
    if (user.investigador) {
      // Para investigadores, filtramos los proyectos donde su DNI coincide con el campo IP
      url = `${this.API_URL}/Proyecto?ip=eq.${user.dni}`;
    }

    return this.http.get<Proyecto[]>(url)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo proyectos', error);
          return throwError(() => new Error('Error al obtener proyectos'));
        })
      );
  }

  getProyecto(id: string): Observable<Proyecto> {
    return this.http.get<Proyecto>(`${this.API_URL}/Proyecto?IDProyecto=eq.${id}`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo proyecto', error);
          return throwError(() => new Error('Error al obtener proyecto'));
        })
      );
  }

  createProyecto(proyecto: Proyecto): Observable<Proyecto> {
    return this.http.post<Proyecto>(`${this.API_URL}/Proyecto`, proyecto)
      .pipe(
        catchError(error => {
          console.error('Error creando proyecto', error);
          return throwError(() => new Error('Error al crear proyecto'));
        })
      );
  }

  updateProyecto(id: string, proyecto: Partial<Proyecto>): Observable<Proyecto> {
    return this.http.patch<Proyecto>(`${this.API_URL}/Proyecto?IDProyecto=eq.${id}`, proyecto)
      .pipe(
        catchError(error => {
          console.error('Error actualizando proyecto', error);
          return throwError(() => new Error('Error al actualizar proyecto'));
        })
      );
  }

  deleteProyecto(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/Proyecto?IDProyecto=eq.${id}`)
      .pipe(
        catchError(error => {
          console.error('Error eliminando proyecto', error);
          return throwError(() => new Error('Error al eliminar proyecto'));
        })
      );
  }

  // Método para obtener todos los documentos del proyecto
  getDocumentosProyecto(id: string): Observable<DocumentoProyecto[]> {
    return forkJoin({
      contratos: this.http.get<any[]>(`${this.API_URL}/CMenor?proyecto=eq.${id}`),
      comisiones: this.http.get<any[]>(`${this.API_URL}/ComisionServicio?proyecto=eq.${id}`),
      gastos: this.http.get<any[]>(`${this.API_URL}/GastosPersonal?proyecto=eq.${id}`)
    }).pipe(
      map(({contratos, comisiones, gastos}) => {
        const documentos: DocumentoProyecto[] = [];

        // Añadir documentos de contratos menores
        if (contratos) {
          contratos.forEach(contrato => {
            if (contrato.documento_firmado) documentos.push({id: contrato.documento_firmado, tipo: 'Contrato Menor'});
            if (contrato.presupuesto) documentos.push({id: contrato.presupuesto, tipo: 'Presupuesto'});
          });
        }

        // Añadir documentos de comisiones
        if (comisiones) {
          comisiones.forEach(comision => {
            if (comision.documento_firmado) documentos.push({id: comision.documento_firmado, tipo: 'Comisión de Servicio'});
            if (comision.documentacion_gastos) documentos.push({id: comision.documentacion_gastos, tipo: 'Documentación Gastos'});
            if (comision.documento_jp) documentos.push({id: comision.documento_jp, tipo: 'Documento JP'});
          });
        }

        // Añadir documentos de gastos de personal
        if (gastos) {
          gastos.forEach(gasto => {
            if (gasto.documento) documentos.push({id: gasto.documento, tipo: 'Gasto Personal'});
          });
        }

        return documentos;
      })
    );
  }
  
  // Método auxiliar para formatear cantidades monetarias
  private formatMoney(amount: number | undefined): string {
    if (amount === undefined || amount === null) {
      return '0,00';
    }
    return amount.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
} 