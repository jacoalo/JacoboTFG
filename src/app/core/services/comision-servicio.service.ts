import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map, of, forkJoin } from 'rxjs';
import { ComisionServicio } from '../models';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class ComisionServicioService {
  private readonly API_URL = 'http://localhost:3000'; // URL del backend

  constructor(private http: HttpClient) {}

  getComisionesServicio(proyectoId: string): Observable<ComisionServicio[]> {
    return this.http.get<ComisionServicio[]>(`${this.API_URL}/ComisionServicio?proyecto=eq.${proyectoId}`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo comisiones de servicio', error);
          return throwError(() => new Error('Error al obtener comisiones de servicio'));
        })
      );
  }

  getComisionServicio(id: string): Observable<ComisionServicio> {
    return this.http.get<ComisionServicio[]>(`${this.API_URL}/ComisionServicio?id_comision=eq.${id}`)
      .pipe(
        map(response => {
          if (response && response.length > 0) {
            return response[0];
          } else {
            throw new Error('Comisión de servicio no encontrada');
          }
        }),
        catchError(error => {
          console.error('Error obteniendo comisión de servicio', error);
          return throwError(() => new Error('Error al obtener comisión de servicio'));
        })
      );
  }

  createComisionServicio(comisionServicio: ComisionServicio): Observable<ComisionServicio> {
    return this.http.post<ComisionServicio>(`${this.API_URL}/ComisionServicio`, comisionServicio)
      .pipe(
        catchError(error => {
          console.error('Error creando comisión de servicio', error);
          return throwError(() => new Error('Error al crear comisión de servicio'));
        })
      );
  }

  updateComisionServicio(id: string, comisionServicio: Partial<ComisionServicio>): Observable<ComisionServicio> {
    return this.http.patch<ComisionServicio>(`${this.API_URL}/ComisionServicio?id_comision=eq.${id}`, comisionServicio)
      .pipe(
        catchError(error => {
          console.error('Error actualizando comisión de servicio', error);
          return throwError(() => new Error('Error al actualizar comisión de servicio'));
        })
      );
  }

  // Métodos para subir documentos
  uploadDocumentoFirmado(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.API_URL}/upload/comision_servicio/documento_firmado/${id}`, formData)
      .pipe(
        catchError(error => {
          console.error('Error subiendo documento firmado', error);
          return throwError(() => new Error('Error al subir documento firmado'));
        })
      );
  }

  uploadDocumentacionGastos(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.API_URL}/upload/comision_servicio/documentacion_gastos/${id}`, formData)
      .pipe(
        catchError(error => {
          console.error('Error subiendo documentación de gastos', error);
          return throwError(() => new Error('Error al subir documentación de gastos'));
        })
      );
  }

  uploadJustificantePago(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.API_URL}/upload/comision_servicio/justificante_pago/${id}`, formData)
      .pipe(
        catchError(error => {
          console.error('Error subiendo justificante de pago', error);
          return throwError(() => new Error('Error al subir justificante de pago'));
        })
      );
  }

  // Método para generar el documento de la comisión de servicio
  generarDocumentoComisionServicio(id: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/generar/comision_servicio/documento/${id}`, { responseType: 'blob' })
      .pipe(
        catchError(error => {
          console.error('Error generando documento', error);
          return throwError(() => new Error('Error al generar documento'));
        })
      );
  }
  
  // Método para generar PDF de comisión de servicio
  generarPDFComisionServicio(id: string): Observable<Blob> {
    return new Observable<Blob>(observer => {
      // Obtenemos los datos completos de la comisión
      this.getComisionServicio(id)
        .subscribe({
          next: (comision) => {
            // Obtener información del proyecto
            this.http.get<any[]>(`${this.API_URL}/Proyecto?IDProyecto=eq.${comision.proyecto}`)
              .pipe(catchError(() => of([])))
              .subscribe({
                next: (proyectos) => {
                  const proyecto = proyectos && proyectos.length > 0 ? proyectos[0] : null;
                  
                  // Crear el PDF con la información
                  const pdf = new jsPDF();
                  
                  // Título y cabecera
                  pdf.setFontSize(22);
                  pdf.setTextColor(0, 51, 153); // Azul corporativo
                  pdf.text('Gestión CSIC', 105, 20, { align: 'center' });
                  
                  pdf.setFontSize(18);
                  pdf.setTextColor(0, 0, 0);
                  pdf.text(`Comisión de Servicio: ${comision.id_comision}`, 105, 35, { align: 'center' });
                  
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
                  pdf.text(`Proyecto: ${proyecto?.IDProyecto || comision.proyecto}`, 25, 70);
                  
                  // Datos del comisionado
                  pdf.setFontSize(14);
                  pdf.setTextColor(0, 102, 204);
                  pdf.text('Datos del Comisionado', 20, 85);
                  
                  pdf.setFontSize(11);
                  pdf.setTextColor(0, 0, 0);
                  
                  const nombreCompleto = `${comision.nombre} ${comision.apellido1} ${comision.apellido2 || ''}`.trim();
                  pdf.text(`Nombre: ${nombreCompleto}`, 25, 95);
                  pdf.text(`NIF: ${comision.nif_comisionado || 'No especificado'}`, 25, 102);
                  pdf.text(`Cargo: ${comision.cargo || 'No especificado'}`, 25, 109);
                  pdf.text(`Grupo: ${comision.grupo || 'No especificado'}`, 25, 116);
                  
                  // Datos del viaje
                  pdf.setFontSize(14);
                  pdf.setTextColor(0, 102, 204);
                  pdf.text('Datos del Viaje', 20, 130);
                  
                  pdf.setFontSize(11);
                  pdf.setTextColor(0, 0, 0);
                  
                  const fechaInicio = comision.fecha_inicio ? new Date(comision.fecha_inicio).toLocaleDateString() : 'No especificada';
                  const fechaFin = comision.fecha_fin ? new Date(comision.fecha_fin).toLocaleDateString() : 'No especificada';
                  const horaInicio = comision.hinicio ? new Date(comision.hinicio).toLocaleTimeString() : 'No especificada';
                  const horaFin = comision.hfin ? new Date(comision.hfin).toLocaleTimeString() : 'No especificada';
                  
                  pdf.text(`Motivo del viaje: ${comision.motivo_viaje || 'No especificado'}`, 25, 140);
                  pdf.text(`Origen: ${comision.origen || 'No especificado'}`, 25, 147);
                  pdf.text(`Destino: ${comision.destino || 'No especificado'}`, 25, 154);
                  pdf.text(`Fecha y hora de inicio: ${fechaInicio} ${horaInicio}`, 25, 161);
                  pdf.text(`Fecha y hora de fin: ${fechaFin} ${horaFin}`, 25, 168);
                  
                  // Derechos y gastos
                  pdf.setFontSize(14);
                  pdf.setTextColor(0, 102, 204);
                  pdf.text('Derechos y Gastos', 20, 182);
                  
                  pdf.setFontSize(11);
                  pdf.setTextColor(0, 0, 0);
                  pdf.text(`Derecho a dietas: ${comision.derecho_dietas ? 'Sí' : 'No'}`, 25, 192);
                  pdf.text(`Gastos de viajes: ${comision.gastos_viajes ? 'Sí' : 'No'}`, 25, 199);
                  pdf.text(`Residencia: ${comision.residencia ? 'Sí' : 'No'}`, 25, 206);
                  pdf.text(`Gastos realizados: ${comision.gastos_realizados ? 'Sí' : 'No'}`, 25, 213);
                  
                  // Añadir otra página para el resto de información
                  pdf.addPage();
                  
                  // Transporte
                  pdf.setFontSize(14);
                  pdf.setTextColor(0, 102, 204);
                  pdf.text('Transporte', 20, 20);
                  
                  pdf.setFontSize(11);
                  pdf.setTextColor(0, 0, 0);
                  pdf.text(`Transporte aéreo: ${comision.transporte_aereo ? 'Sí' : 'No'}`, 25, 30);
                  pdf.text(`Vehículo particular: ${comision.vehiculo_particular ? 'Sí' : 'No'}`, 25, 37);
                  pdf.text(`Vehículo oficial: ${comision.vehiculo_oficial ? 'Sí' : 'No'}`, 25, 44);
                  
                  if (comision.vehiculo_particular || comision.vehiculo_oficial) {
                    pdf.text(`Matrícula: ${comision.matricula || 'No especificada'}`, 25, 51);
                  }
                  
                  let yPos = 51;
                  
                  pdf.text(`Gastos de garaje: ${comision.gastos_garaje ? 'Sí' : 'No'}`, 25, yPos += 7);
                  pdf.text(`Gastos de peaje: ${comision.gastos_peaje ? 'Sí' : 'No'}`, 25, yPos += 7);
                  pdf.text(`Transporte vehículo/barco: ${comision.transporte_vehiculo_barco ? 'Sí' : 'No'}`, 25, yPos += 7);
                  pdf.text(`Consigna equipaje: ${comision.consigna_equipaje ? 'Sí' : 'No'}`, 25, yPos += 7);
                  pdf.text(`Tren alta velocidad: ${comision.tren_alta_velocidad ? 'Sí' : 'No'}`, 25, yPos += 7);
                  pdf.text(`Tren nocturno: ${comision.tren_nocturno ? 'Sí' : 'No'}`, 25, yPos += 7);
                  pdf.text(`Tren convencional: ${comision.tren_convencional ? 'Sí' : 'No'}`, 25, yPos += 7);
                  pdf.text(`Transporte marítimo: ${comision.transporte_maritimo ? 'Sí' : 'No'}`, 25, yPos += 7);
                  
                  // Otros gastos
                  yPos += 10;
                  pdf.setFontSize(14);
                  pdf.setTextColor(0, 102, 204);
                  pdf.text('Otros Gastos', 20, yPos);
                  
                  pdf.setFontSize(11);
                  pdf.setTextColor(0, 0, 0);
                  pdf.text(`Llamada teléfono oficial: ${comision.llamada_tfno_oficial ? 'Sí' : 'No'}`, 25, yPos += 10);
                  pdf.text(`Gastos lavandería: ${comision.gastos_lavanderia ? 'Sí' : 'No'}`, 25, yPos += 7);
                  pdf.text(`Taxi residencia: ${comision.gastos_taxi_residencia ? 'Sí' : 'No'}`, 25, yPos += 7);
                  pdf.text(`Taxi servicio: ${comision.gastos_taxi_servicio ? 'Sí' : 'No'}`, 25, yPos += 7);
                  pdf.text(`Gastos cena: ${comision.gastos_cena ? 'Sí' : 'No'}`, 25, yPos += 7);
                  pdf.text(`Gastos reembolsables UE: ${comision.gastos_reembolsables_ue ? 'Sí' : 'No'}`, 25, yPos += 7);
                  
                  // Autorización
                  yPos += 10;
                  pdf.setFontSize(14);
                  pdf.setTextColor(0, 102, 204);
                  pdf.text('Autorización', 20, yPos);
                  
                  pdf.setFontSize(11);
                  pdf.setTextColor(0, 0, 0);
                  pdf.text(`Autorizador: ${comision.autorizador || 'No especificado'}`, 25, yPos += 10);
                  pdf.text(`Cargo: ${comision.a_cargo || 'No especificado'}`, 25, yPos += 7);
                  pdf.text(`Localidad: ${comision.a_localidad || 'No especificada'}`, 25, yPos += 7);
                  
                  const fechaFirma = comision.a_fecha_firma ? new Date(comision.a_fecha_firma).toLocaleDateString() : 'No especificada';
                  pdf.text(`Fecha de firma: ${fechaFirma}`, 25, yPos += 7);
                  
                  // Información económica
                  yPos += 10;
                  pdf.setFontSize(14);
                  pdf.setTextColor(0, 102, 204);
                  pdf.text('Información Económica', 20, yPos);
                  
                  pdf.setFontSize(11);
                  pdf.setTextColor(0, 0, 0);
                  pdf.text(`Gastos generados: ${comision.gastos_generados || 0} €`, 25, yPos += 10);
                  
                  const fechaAbono = comision.fecha_abono ? new Date(comision.fecha_abono).toLocaleDateString() : 'No especificada';
                  pdf.text(`Fecha de abono: ${fechaAbono}`, 25, yPos += 7);
                  
                  // Documentación
                  yPos += 10;
                  pdf.setFontSize(14);
                  pdf.setTextColor(0, 102, 204);
                  pdf.text('Documentación', 20, yPos);
                  
                  pdf.setFontSize(11);
                  pdf.setTextColor(0, 0, 0);
                  pdf.text(`Documento generado: ${comision.d_generado ? 'Sí' : 'No'}`, 25, yPos += 10);
                  pdf.text(`Documento firmado: ${comision.documento_firmado ? 'Disponible' : 'No disponible'}`, 25, yPos += 7);
                  pdf.text(`Documentación gastos: ${comision.documentacion_gastos ? 'Disponible' : 'No disponible'}`, 25, yPos += 7);
                  pdf.text(`Documento JP: ${comision.documento_jp ? 'Disponible' : 'No disponible'}`, 25, yPos += 7);
                  
                  // Convertir el PDF a Blob y retornarlo
                  const pdfBlob = pdf.output('blob');
                  observer.next(pdfBlob);
                  observer.complete();
                },
                error: (error) => {
                  console.error('Error obteniendo información del proyecto', error);
                  observer.error(new Error('Error obteniendo información del proyecto'));
                }
              });
          },
          error: (error) => {
            console.error('Error obteniendo comisión', error);
            observer.error(new Error('Error obteniendo comisión'));
          }
        });
    });
  }
} 