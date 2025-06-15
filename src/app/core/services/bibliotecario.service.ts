import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DocumentoMetadata {
  id: string;
  nombreOriginal: string;
  fechaSubida: string;
  tamano: number;
  tipo: string;
  ruta: string;
  proyecto: string; // ID del proyecto asociado (siempre obligatorio)
}

export interface DocumentoResponse {
  mensaje: string;
  id: string;
  metadata: DocumentoMetadata;
}

@Injectable({
  providedIn: 'root'
})
export class BibliotecarioService {
  private readonly API_URL = 'http://localhost:3001/api/documentos';

  constructor(private http: HttpClient) { }

  /**
   * Sube un documento al servidor bibliotecario
   * @param file El archivo a subir
   * @param proyectoId ID del proyecto al que pertenece el documento
   * @returns Observable con la respuesta del servidor incluyendo el ID del documento
   */
  subirDocumento(file: File, proyectoId: string): Observable<DocumentoResponse> {
    const formData = new FormData();
    formData.append('documento', file);
    formData.append('proyecto', proyectoId);

    return this.http.post<DocumentoResponse>(`${this.API_URL}/subir`, formData);
  }

  /**
   * Obtiene la información de un documento
   * @param id ID del documento
   * @param proyectoId ID del proyecto al que pertenece el documento
   * @returns Observable con la metadata del documento
   */
  obtenerInfoDocumento(id: string, proyectoId: string): Observable<DocumentoMetadata> {
    return this.http.get<DocumentoMetadata>(`${this.API_URL}/info/${id}?proyecto=${proyectoId}`);
  }

  /**
   * Devuelve la URL para descargar un documento
   * @param id ID del documento
   * @param proyectoId ID del proyecto al que pertenece el documento
   * @returns URL completa para descargar el documento
   */
  getUrlDescarga(id: string, proyectoId: string): string {
    return `${this.API_URL}/descargar/${id}?proyecto=${proyectoId}`;
  }

  /**
   * Devuelve la URL para descargar todos los documentos de un proyecto en formato ZIP
   * @param proyectoId ID del proyecto del que se descargarán los documentos
   * @returns URL completa para descargar el archivo ZIP con todos los documentos
   */
  getUrlDescargaProyectoCompleto(proyectoId: string): string {
    return `${this.API_URL}/descargar-proyecto/${proyectoId}`;
  }
} 