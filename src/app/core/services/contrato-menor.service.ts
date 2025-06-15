import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map, forkJoin, of } from 'rxjs';
import { CMenor, Articulo, Factura, Necesidad, Proyecto, Usuario } from '../models';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class ContratoMenorService {
  private readonly API_URL = 'http://localhost:3000'; // URL del backend

  constructor(private http: HttpClient) {}

  getContratosMenores(proyectoId: string): Observable<CMenor[]> {
    return this.http.get<CMenor[]>(`${this.API_URL}/CMenor?proyecto=eq.${proyectoId}`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo contratos menores', error);
          return throwError(() => new Error('Error al obtener contratos menores'));
        })
      );
  }

  getContratoMenor(id: string): Observable<CMenor> {
    return this.http.get<CMenor[]>(`${this.API_URL}/CMenor?id=eq.${id}`)
      .pipe(
        map(response => {
          if (response && response.length > 0) {
            return response[0];
          } else {
            throw new Error('Contrato menor no encontrado');
          }
        }),
        catchError(error => {
          console.error('Error obteniendo contrato menor', error);
          return throwError(() => new Error('Error al obtener contrato menor'));
        })
      );
  }

  createContratoMenor(contratoMenor: CMenor): Observable<CMenor> {
    return this.http.post<CMenor>(`${this.API_URL}/CMenor`, contratoMenor)
      .pipe(
        catchError(error => {
          console.error('Error creando contrato menor', error);
          return throwError(() => new Error('Error al crear contrato menor'));
        })
      );
  }

  updateContratoMenor(id: string, contratoMenor: Partial<CMenor>): Observable<CMenor> {
    return this.http.patch<CMenor>(`${this.API_URL}/CMenor?id=eq.${id}`, contratoMenor)
      .pipe(
        catchError(error => {
          console.error('Error actualizando contrato menor', error);
          return throwError(() => new Error('Error al actualizar contrato menor'));
        })
      );
  }

  // Métodos para gestionar artículos
  getArticulos(contratoMenorId: string): Observable<Articulo[]> {
    return this.http.get<Articulo[]>(`${this.API_URL}/Articulo?id_cm=eq.${contratoMenorId}`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo artículos', error);
          return throwError(() => new Error('Error al obtener artículos'));
        })
      );
  }

  createArticulo(articulo: Articulo): Observable<Articulo> {
    return this.http.post<Articulo>(`${this.API_URL}/Articulo`, articulo)
      .pipe(
        catchError(error => {
          console.error('Error creando artículo', error);
          return throwError(() => new Error('Error al crear artículo'));
        })
      );
  }

  updateArticulo(id: string, articulo: Partial<Articulo>): Observable<Articulo> {
    return this.http.patch<Articulo>(`${this.API_URL}/Articulo?id_art=eq.${id}`, articulo)
      .pipe(
        catchError(error => {
          console.error('Error actualizando artículo', error);
          return throwError(() => new Error('Error al actualizar artículo'));
        })
      );
  }

  // Métodos para gestionar facturas
  getFacturas(articuloIds: string[]): Observable<Factura[]> {
    // PostgREST no admite directamente búsquedas en arrays, podríamos usar la condición in
    // Pero para simplificar, podríamos usar las facturas por id_factura si lo tenemos
    return this.http.get<Factura[]>(`${this.API_URL}/Factura`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo facturas', error);
          return throwError(() => new Error('Error al obtener facturas'));
        })
      );
  }

  createFactura(factura: Factura, articuloIds: string[]): Observable<Factura> {
    // Primero creamos la factura
    return this.http.post<Factura>(`${this.API_URL}/Factura`, factura)
      .pipe(
        catchError(error => {
          console.error('Error creando factura', error);
          return throwError(() => new Error('Error al crear factura'));
        })
      );
    // Nota: En un entorno de producción, después tendríamos que actualizar los artículos asociados
  }

  updateFactura(id: string, factura: Partial<Factura>): Observable<Factura> {
    return this.http.patch<Factura>(`${this.API_URL}/Factura?IdFactura=eq.${id}`, factura)
      .pipe(
        catchError(error => {
          console.error('Error actualizando factura', error);
          return throwError(() => new Error('Error al actualizar factura'));
        })
      );
  }

  // Métodos para subir documentos
  // Nota: Estos métodos probablemente necesitarán una implementación personalizada
  uploadPresupuesto(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.API_URL}/upload/cmenor/presupuesto/${id}`, formData)
      .pipe(
        catchError(error => {
          console.error('Error subiendo presupuesto', error);
          return throwError(() => new Error('Error al subir presupuesto'));
        })
      );
  }

  uploadDocumentoFirmado(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.API_URL}/upload/cmenor/documento_firmado/${id}`, formData)
      .pipe(
        catchError(error => {
          console.error('Error subiendo documento firmado', error);
          return throwError(() => new Error('Error al subir documento firmado'));
        })
      );
  }

  uploadFactura(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.API_URL}/upload/factura/documento/${id}`, formData)
      .pipe(
        catchError(error => {
          console.error('Error subiendo factura', error);
          return throwError(() => new Error('Error al subir factura'));
        })
      );
  }

  uploadJustificantePago(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.API_URL}/upload/factura/justificante_pago/${id}`, formData)
      .pipe(
        catchError(error => {
          console.error('Error subiendo justificante de pago', error);
          return throwError(() => new Error('Error al subir justificante de pago'));
        })
      );
  }

  // Método para generar el documento del contrato menor utilizando jsPDF
  generarPDFContratoMenor(id: string): Observable<Blob> {
    return new Observable<Blob>(observer => {
      // Obtenemos los datos completos del contrato menor
      this.http.get<any[]>(`${this.API_URL}/CMenor?id=eq.${id}`)
        .subscribe({
          next: (contratos) => {
            if (contratos && contratos.length > 0) {
              const contrato = contratos[0];
              
              // Obtenemos información adicional: proyecto, necesidad, usuario/IP, artículos
              forkJoin({
                proyecto: this.http.get<Proyecto[]>(`${this.API_URL}/Proyecto?IDProyecto=eq.${contrato.proyecto}`),
                necesidad: this.http.get<Necesidad[]>(`${this.API_URL}/necesidad?id=eq.${contrato.necesidad}`),
                usuario: this.http.get<Usuario[]>(`${this.API_URL}/Usuario?dni=eq.${contrato.proyecto}`).pipe(
                  catchError(() => of([]))
                ),
                articulos: this.http.get<Articulo[]>(`${this.API_URL}/Articulo?id_cm=eq.${id}`)
              }).subscribe({
                next: (result) => {
                  const proyecto = result.proyecto && result.proyecto.length > 0 ? result.proyecto[0] : null;
                  const necesidad = result.necesidad && result.necesidad.length > 0 ? result.necesidad[0] : null;
                  const usuario = result.usuario && result.usuario.length > 0 ? result.usuario[0] : null;
                  const articulos = result.articulos || [];
                  
                  // Ahora obtenemos el usuario (investigador principal)
                  this.http.get<any[]>(`${this.API_URL}/Usuario?dni=eq.${proyecto?.ip || ''}`)
                    .subscribe({
                      next: (usuarios) => {
                        const investigador = usuarios && usuarios.length > 0 ? usuarios[0] : null;
                        
                        // Crear el PDF con toda la información
                        const pdf = new jsPDF();
                        
                        // Añadimos logo o título
                        pdf.setFontSize(22);
                        pdf.setTextColor(0, 51, 153); // Azul corporativo
                        pdf.text('Gestión Justificaciones', 105, 20, { align: 'center' });
                        
                        // Título del documento
                        pdf.setFontSize(18);
                        pdf.setTextColor(0, 0, 0);
                        pdf.text(`Contrato Menor: ${contrato.id}`, 105, 35, { align: 'center' });
                        
                        // Fecha de generación
                        pdf.setFontSize(10);
                        pdf.setTextColor(100, 100, 100);
                        pdf.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 105, 45, { align: 'center' });
                        
                        // Línea separadora
                        pdf.setDrawColor(200, 200, 200);
                        pdf.line(20, 50, 190, 50);
                        
                        // Datos del proyecto
                        pdf.setFontSize(14);
                        pdf.setTextColor(0, 102, 204);
                        pdf.text('Datos del Proyecto', 20, 60);
                        
                        pdf.setFontSize(11);
                        pdf.setTextColor(0, 0, 0);
                        pdf.text(`Proyecto: ${proyecto?.IDProyecto || contrato.proyecto}`, 25, 70);
                        pdf.text(`ICU: ${proyecto?.icu || 'No disponible'}`, 25, 77);
                        
                        // Investigador Principal
                        const nombreCompleto = investigador ? 
                          `${investigador.nombre || ''} ${investigador.apellido1 || ''} ${investigador.apellido2 || ''}`.trim() : 
                          'No disponible';
                        pdf.text(`Investigador Principal: ${nombreCompleto}`, 25, 84);
                        
                        // Datos del contrato
                        pdf.setFontSize(14);
                        pdf.setTextColor(0, 102, 204);
                        pdf.text('Datos del Contrato Menor', 20, 100);
                        
                        pdf.setFontSize(11);
                        pdf.setTextColor(0, 0, 0);
                        pdf.text(`Justificación: ${contrato.justificacion || 'No especificada'}`, 25, 110);
                        
                        // Texto de necesidad con saltos de línea si es muy largo
                        const necesidadTexto = necesidad?.texto || 'No especificada';
                        pdf.text('Necesidad:', 25, 120);
                        const necesidadLines = pdf.splitTextToSize(necesidadTexto, 150);
                        pdf.text(necesidadLines, 35, 127);
                        
                        // Más datos del contrato
                        let yPos = 127 + (necesidadLines.length * 7);
                        
                        pdf.text(`Proveedor: ${contrato.proveedor || 'No especificado'}`, 25, yPos += 10);
                        pdf.text(`CIF: ${contrato.cif || 'No especificado'}`, 25, yPos += 7);
                        pdf.text(`Importe: ${contrato.importe || 0} €`, 25, yPos += 7);
                        pdf.text(`Localidad: ${contrato.localidad || 'No especificada'}`, 25, yPos += 7);
                        pdf.text(`Fecha firma IP: ${contrato.fecha_firma_ip ? new Date(contrato.fecha_firma_ip).toLocaleDateString() : 'No firmado'}`, 25, yPos += 7);
                        pdf.text(`Aplicación presupuestaria: ${contrato.aplicacionp || 'No especificada'}`, 25, yPos += 7);
                        pdf.text(`Ejercicio: ${contrato.ejercicio || new Date().getFullYear()}`, 25, yPos += 7);
                        
                        // Criterios de adjudicación
                        yPos += 10;
                        pdf.setFontSize(14);
                        pdf.setTextColor(0, 102, 204);
                        pdf.text('Criterios de Adjudicación', 20, yPos);
                        
                        pdf.setFontSize(11);
                        pdf.setTextColor(0, 0, 0);
                        pdf.text(`Oferta económica: ${contrato.ofertaeconomica ? 'Sí' : 'No'}`, 25, yPos += 10);
                        pdf.text(`Calidad: ${contrato.calidad ? 'Sí' : 'No'}`, 25, yPos += 7);
                        
                        if (contrato.calidad && contrato.criterio_calidad) {
                          pdf.text('Criterio de calidad:', 25, yPos += 7);
                          const criterioLines = pdf.splitTextToSize(contrato.criterio_calidad, 150);
                          pdf.text(criterioLines, 35, yPos += 7);
                          yPos += (criterioLines.length * 7);
                        }
                        
                        // Datos de firma
                        yPos += 10;
                        pdf.setFontSize(14);
                        pdf.setTextColor(0, 102, 204);
                        pdf.text('Datos de Firma', 20, yPos);
                        
                        pdf.setFontSize(11);
                        pdf.setTextColor(0, 0, 0);
                        pdf.text(`Gerente: ${contrato.gerente || 'No especificado'}`, 25, yPos += 10);
                        pdf.text(`Fecha firma gerente: ${contrato.fecha_firma_gerente ? new Date(contrato.fecha_firma_gerente).toLocaleDateString() : 'No firmado'}`, 25, yPos += 7);
                        
                        // Si hay artículos, los agregamos en una nueva página
                        if (articulos.length > 0) {
                          pdf.addPage();
                          
                          pdf.setFontSize(14);
                          pdf.setTextColor(0, 102, 204);
                          pdf.text('Artículos', 20, 20);
                          
                          // Tabla de artículos con columnas redistribuidas
                          pdf.setFontSize(8);
                          pdf.setTextColor(0, 0, 0);
                          // Nuevas posiciones de columnas para dar más espacio al ID
                          pdf.text('ID', 20, 30);
                          pdf.text('Descripción', 55, 30);
                          pdf.text('Cantidad', 145, 30);
                          pdf.text('Precio', 170, 30);
                          
                          pdf.line(20, 32, 190, 32);
                          
                          let y = 40;
                          articulos.forEach((articulo, index) => {
                            if (y > 270) {
                              pdf.addPage();
                              
                              pdf.setFontSize(8);
                              pdf.setTextColor(0, 0, 0);
                              // Mantener consistencia con las mismas posiciones
                              pdf.text('ID', 20, 20);
                              pdf.text('Descripción', 55, 20);
                              pdf.text('Cantidad', 145, 20);
                              pdf.text('Precio', 170, 20);
                              
                              pdf.line(20, 22, 190, 22);
                              y = 30;
                            }
                            
                            pdf.setFontSize(8);
                            // Manejar IDs largos
                            const idLines = pdf.splitTextToSize(articulo.id_art || `art-${index+1}`, 30);
                            pdf.text(idLines, 20, y);
                            
                            // Reducido el ancho para la descripción para compensar
                            const descLines = pdf.splitTextToSize(articulo.descripcion || 'Sin descripción', 80);
                            pdf.text(descLines, 55, y);
                            
                            pdf.text(`${articulo.cantidad || 0}`, 145, y);
                            pdf.text(`${articulo.precio || 0} €`, 170, y);
                            
                            // Calcular altura máxima entre ID y descripción
                            const maxLines = Math.max(idLines.length, descLines.length);
                            y += Math.max(6, maxLines * 6 + 1);
                          });
                          
                          // Calcular y añadir el total
                          const total = articulos.reduce((sum, articulo) => {
                            // Usar la cantidad multiplicada por el precio, o 0 si no están definidos
                            const cantidad = articulo.cantidad || 0;
                            const precio = articulo.precio || 0;
                            return sum + (cantidad * precio);
                          }, 0);
                          
                          // Añadir una línea separadora antes del total
                          pdf.line(145, y + 2, 190, y + 2);
                          
                          // Mostrar el total con formato más destacado
                          y += 10;
                          pdf.setFontSize(9);
                          pdf.setTextColor(0, 0, 0);
                          pdf.text('TOTAL:', 125, y);
                          pdf.setFontSize(10);
                          // Establecer negrita para el texto del total
                          pdf.setFont('Helvetica', 'bold');
                          pdf.text(`${total.toFixed(2)} €`, 170, y);
                          // Volver a fuente normal
                          pdf.setFont('Helvetica', 'normal');
                        }
                        
                        // Pie de página en la última página
                        pdf.setFontSize(8);
                        pdf.setTextColor(150, 150, 150);
                        pdf.text('© CSIC - Gestión de Contratos Menores - Documento generado automáticamente', 105, 280, { align: 'center' });
                        
                        // Convertimos el PDF a blob y lo enviamos
                        const pdfBlob = pdf.output('blob');
                        observer.next(pdfBlob);
                        observer.complete();
                      },
                      error: (error) => {
                        console.error('Error obteniendo datos del investigador principal', error);
                        observer.error(new Error('Error al generar el documento del contrato menor'));
                      }
                    });
                },
                error: (error) => {
                  console.error('Error obteniendo datos adicionales', error);
                  observer.error(new Error('Error al generar el documento del contrato menor'));
                }
              });
            } else {
              observer.error(new Error('Contrato menor no encontrado'));
            }
          },
          error: (error) => {
            console.error('Error obteniendo contrato menor', error);
            observer.error(new Error('Error al generar el documento del contrato menor'));
          }
        });
    });
  }

  // Método para generar el documento del contrato menor (versión backend)
  generarDocumentoContratoMenor(id: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/generar/cmenor/documento/${id}`, { responseType: 'blob' })
      .pipe(
        catchError(error => {
          console.error('Error generando documento', error);
          return throwError(() => new Error('Error al generar documento'));
        })
      );
  }
} 