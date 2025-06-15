import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { BibliotecarioService, DocumentoResponse } from '../../../core/services/bibliotecario.service';
import { NavigationService } from '../../../core/services/navigation.service';
import { Subscription } from 'rxjs';

// Interfaz para la comisión de servicio
interface ComisionServicio {
  id_comision: string;
  proyecto: string;
  nif_comisionado: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  cargo: string;
  grupo: number;
  motivo_viaje: string;
  fecha_inicio: Date;
  hinicio: Date;
  origen: string;
  fecha_fin: Date;
  hfin: Date;
  destino: string;
  derecho_dietas: boolean;
  gastos_viajes: boolean;
  residencia: boolean;
  gastos_realizados: boolean;
  transporte_aereo: boolean;
  vehiculo_particular: boolean;
  vehiculo_oficial: boolean;
  matricula?: string;
  gastos_garaje: boolean;
  gastos_peaje: boolean;
  transporte_vehiculo_barco: boolean;
  consigna_equipaje: boolean;
  llamada_tfno_oficial: boolean;
  gastos_lavanderia: boolean;
  tren_alta_velocidad: boolean;
  tren_nocturno: boolean;
  tren_convencional: boolean;
  transporte_maritimo: boolean;
  gastos_taxi_residencia: boolean;
  gastos_taxi_servicio: boolean;
  gastos_cena: boolean;
  gastos_reembolsables_ue: boolean;
  autorizador?: string;
  a_cargo?: string;
  a_localidad?: string;
  a_fecha_firma?: Date;
  d_generado: boolean;
  documento_firmado?: string;
  gastos_generados: number;
  documentacion_gastos?: string;
  fecha_abono?: Date;
  documento_jp?: string;
}

@Component({
  selector: 'app-editar-comision-servicio',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './editar-comision-servicio.component.html',
  styleUrl: './editar-comision-servicio.component.css'
})
export class EditarComisionServicioComponent implements OnInit, OnDestroy {
  comisionForm: FormGroup;
  comisionId: string = '';
  loading: boolean = true;
  saving: boolean = false;
  error: string = '';
  successMessage: string = '';
  private readonly API_URL = 'http://localhost:3000';
  private routeSubscription: Subscription | null = null;

  // Variables para el manejo de archivos
  documentoFirmado: File | null = null;
  documentacionGastos: File | null = null;
  documentoJP: File | null = null;
  cargandoDocumentoFirmado: boolean = false;
  cargandoDocumentacionGastos: boolean = false;
  cargandoDocumentoJP: boolean = false;
  uploadProgress: { [key: string]: number } = {};

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private bibliotecarioService: BibliotecarioService,
    private navigationService: NavigationService
  ) {
    this.comisionForm = this.fb.group({
      proyecto: ['', Validators.required],
      nif_comisionado: ['', Validators.required],
      nombre: ['', Validators.required],
      apellido1: ['', Validators.required],
      apellido2: [''],
      cargo: ['', Validators.required],
      grupo: [0],
      motivo_viaje: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      hinicio: ['', Validators.required],
      origen: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      hfin: ['', Validators.required],
      destino: ['', Validators.required],
      derecho_dietas: [false],
      gastos_viajes: [false],
      residencia: [false],
      gastos_realizados: [false],
      transporte_aereo: [false],
      vehiculo_particular: [false],
      vehiculo_oficial: [false],
      matricula: [''],
      gastos_garaje: [false],
      gastos_peaje: [false],
      transporte_vehiculo_barco: [false],
      consigna_equipaje: [false],
      llamada_tfno_oficial: [false],
      gastos_lavanderia: [false],
      tren_alta_velocidad: [false],
      tren_nocturno: [false],
      tren_convencional: [false],
      transporte_maritimo: [false],
      gastos_taxi_residencia: [false],
      gastos_taxi_servicio: [false],
      gastos_cena: [false],
      gastos_reembolsables_ue: [false],
      autorizador: [''],
      a_cargo: [''],
      a_localidad: [''],
      a_fecha_firma: [''],
      d_generado: [false],
      documento_firmado: [''],
      gastos_generados: [0],
      documentacion_gastos: [''],
      fecha_abono: [''],
      documento_jp: ['']
    });
  }

  ngOnInit(): void {
    // Suscribirse a los cambios en los parámetros de la ruta
    this.routeSubscription = this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (!id) {
        this.error = 'ID de comisión no válido';
        this.router.navigate(['/dashboard']);
        return;
      }

      console.log('ID de comisión para editar:', id);
      this.comisionId = id;
      this.resetForm();
      this.cargarComision();

      // Añadir el estado actual a la pila de navegación
      this.navigationService.pushState(`/comisiones-servicio/${id}`, 'Editar Comisión de Servicio');
    });
  }

  ngOnDestroy(): void {
    // Liberar recursos al destruir el componente
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  resetForm(): void {
    // Reiniciar los valores del formulario y variables relacionadas
    this.comisionForm.reset();
    this.documentoFirmado = null;
    this.documentacionGastos = null;
    this.documentoJP = null;
    this.error = '';
    this.successMessage = '';
    this.loading = true;
  }

  cargarComision(): void {
    this.loading = true;
    this.error = '';
    console.log('Cargando datos de comisión con ID:', this.comisionId);
    
    this.http.get<ComisionServicio[]>(`${this.API_URL}/ComisionServicio?id_comision=eq.${this.comisionId}`)
      .subscribe({
        next: (response) => {
          if (response && response.length > 0) {
            const comision = response[0];
            console.log('Datos de comisión cargados:', comision);
            
            // Formatear las fechas y horas para el formulario
            const fechaInicio = comision.fecha_inicio ? new Date(comision.fecha_inicio).toISOString().split('T')[0] : '';
            const fechaFin = comision.fecha_fin ? new Date(comision.fecha_fin).toISOString().split('T')[0] : '';
            const fechaFirma = comision.a_fecha_firma ? new Date(comision.a_fecha_firma).toISOString().split('T')[0] : '';
            const fechaAbono = comision.fecha_abono ? new Date(comision.fecha_abono).toISOString().split('T')[0] : '';
            
            // Formatear horas de hinicio y hfin en formato HH:MM para los inputs de tipo time
            let horaInicio = '';
            let horaFin = '';
            
            if (comision.hinicio) {
              const fecha = new Date(comision.hinicio);
              if (!isNaN(fecha.getTime())) {
                horaInicio = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
              }
            }
            
            if (comision.hfin) {
              const fecha = new Date(comision.hfin);
              if (!isNaN(fecha.getTime())) {
                horaFin = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
              }
            }
            
            this.comisionForm.patchValue({
              proyecto: comision.proyecto,
              nif_comisionado: comision.nif_comisionado,
              nombre: comision.nombre,
              apellido1: comision.apellido1,
              apellido2: comision.apellido2,
              cargo: comision.cargo,
              grupo: comision.grupo,
              motivo_viaje: comision.motivo_viaje,
              fecha_inicio: fechaInicio,
              hinicio: horaInicio,
              origen: comision.origen,
              fecha_fin: fechaFin,
              hfin: horaFin,
              destino: comision.destino,
              derecho_dietas: comision.derecho_dietas,
              gastos_viajes: comision.gastos_viajes,
              residencia: comision.residencia,
              gastos_realizados: comision.gastos_realizados,
              transporte_aereo: comision.transporte_aereo,
              vehiculo_particular: comision.vehiculo_particular,
              vehiculo_oficial: comision.vehiculo_oficial,
              matricula: comision.matricula,
              gastos_garaje: comision.gastos_garaje,
              gastos_peaje: comision.gastos_peaje,
              transporte_vehiculo_barco: comision.transporte_vehiculo_barco,
              consigna_equipaje: comision.consigna_equipaje,
              llamada_tfno_oficial: comision.llamada_tfno_oficial,
              gastos_lavanderia: comision.gastos_lavanderia,
              tren_alta_velocidad: comision.tren_alta_velocidad,
              tren_nocturno: comision.tren_nocturno,
              tren_convencional: comision.tren_convencional,
              transporte_maritimo: comision.transporte_maritimo,
              gastos_taxi_residencia: comision.gastos_taxi_residencia,
              gastos_taxi_servicio: comision.gastos_taxi_servicio,
              gastos_cena: comision.gastos_cena,
              gastos_reembolsables_ue: comision.gastos_reembolsables_ue,
              autorizador: comision.autorizador,
              a_cargo: comision.a_cargo,
              a_localidad: comision.a_localidad,
              a_fecha_firma: fechaFirma,
              d_generado: comision.d_generado,
              documento_firmado: comision.documento_firmado,
              gastos_generados: comision.gastos_generados,
              documentacion_gastos: comision.documentacion_gastos,
              fecha_abono: fechaAbono,
              documento_jp: comision.documento_jp
            });
            
            // Debug: Imprimir valores de documentos
            console.log('Documentos cargados: ', {
              documento_firmado: comision.documento_firmado,
              documentacion_gastos: comision.documentacion_gastos,
              documento_jp: comision.documento_jp
            });
            
            // Debug: Imprimir horas formateadas
            console.log('Horas formateadas:', {
              hinicio: horaInicio,
              hfin: horaFin
            });
            
            this.loading = false;
          } else {
            this.error = 'No se encontró la comisión de servicio';
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error al cargar la comisión:', err);
          this.error = 'Error al cargar los datos de la comisión';
          this.loading = false;
        }
      });
  }

  onFileSelected(event: Event, tipo: string): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      switch (tipo) {
        case 'documento_firmado':
          this.documentoFirmado = fileInput.files[0];
          break;
        case 'documentacion_gastos':
          this.documentacionGastos = fileInput.files[0];
          break;
        case 'documento_jp':
          this.documentoJP = fileInput.files[0];
          break;
      }
    }
  }

  subirDocumentoFirmado(): Promise<string | null> {
    if (!this.documentoFirmado) {
      return Promise.resolve(null);
    }
    
    const proyectoId = this.comisionForm.get('proyecto')?.value;
    if (!proyectoId) {
      this.error = 'Error: No hay un proyecto asociado a la comisión. No se puede subir el documento.';
      return Promise.reject('No hay proyecto asociado');
    }
    
    console.log('Subiendo documento firmado para el proyecto:', proyectoId);
    console.log('Documento:', this.documentoFirmado.name, 'Tamaño:', this.documentoFirmado.size);
    
    this.cargandoDocumentoFirmado = true;
    return new Promise((resolve, reject) => {
      this.bibliotecarioService.subirDocumento(this.documentoFirmado as File, proyectoId)
        .subscribe({
          next: (response: DocumentoResponse) => {
            console.log('Respuesta de subida:', response);
            this.cargandoDocumentoFirmado = false;
            resolve(response.id);
          },
          error: (error) => {
            console.error('Error subiendo documento firmado', error);
            this.cargandoDocumentoFirmado = false;
            this.error = 'Error al subir el documento firmado. ' + (error.error?.error || error.message || 'Inténtelo de nuevo.');
            reject(error);
          }
        });
    });
  }

  subirDocumentacionGastos(): Promise<string | null> {
    if (!this.documentacionGastos) {
      return Promise.resolve(null);
    }
    
    const proyectoId = this.comisionForm.get('proyecto')?.value;
    if (!proyectoId) {
      this.error = 'Error: No hay un proyecto asociado a la comisión. No se puede subir el documento.';
      return Promise.reject('No hay proyecto asociado');
    }
    
    console.log('Subiendo documentación de gastos para el proyecto:', proyectoId);
    console.log('Documento:', this.documentacionGastos.name, 'Tamaño:', this.documentacionGastos.size);
    
    this.cargandoDocumentacionGastos = true;
    return new Promise((resolve, reject) => {
      this.bibliotecarioService.subirDocumento(this.documentacionGastos as File, proyectoId)
        .subscribe({
          next: (response: DocumentoResponse) => {
            console.log('Respuesta de subida:', response);
            this.cargandoDocumentacionGastos = false;
            resolve(response.id);
          },
          error: (error) => {
            console.error('Error subiendo documentación de gastos', error);
            this.cargandoDocumentacionGastos = false;
            this.error = 'Error al subir la documentación de gastos. ' + (error.error?.error || error.message || 'Inténtelo de nuevo.');
            reject(error);
          }
        });
    });
  }

  subirDocumentoJP(): Promise<string | null> {
    if (!this.documentoJP) {
      return Promise.resolve(null);
    }
    
    const proyectoId = this.comisionForm.get('proyecto')?.value;
    if (!proyectoId) {
      this.error = 'Error: No hay un proyecto asociado a la comisión. No se puede subir el documento.';
      return Promise.reject('No hay proyecto asociado');
    }
    
    console.log('Subiendo documento JP para el proyecto:', proyectoId);
    console.log('Documento:', this.documentoJP.name, 'Tamaño:', this.documentoJP.size);
    
    this.cargandoDocumentoJP = true;
    return new Promise((resolve, reject) => {
      this.bibliotecarioService.subirDocumento(this.documentoJP as File, proyectoId)
        .subscribe({
          next: (response: DocumentoResponse) => {
            console.log('Respuesta de subida:', response);
            this.cargandoDocumentoJP = false;
            resolve(response.id);
          },
          error: (error) => {
            console.error('Error subiendo documento JP', error);
            this.cargandoDocumentoJP = false;
            this.error = 'Error al subir el documento JP. ' + (error.error?.error || error.message || 'Inténtelo de nuevo.');
            reject(error);
          }
        });
    });
  }

  async onSubmit(): Promise<void> {
    if (this.comisionForm.valid) {
      this.saving = true;
      this.error = '';
      this.successMessage = '';

      try {
        console.log('Iniciando proceso de guardado...');
        
        // Subir documentos si se han seleccionado
        let idDocumentoFirmado: string | null = null;
        let idDocumentacionGastos: string | null = null;
        let idDocumentoJP: string | null = null;
        
        // Subir documento firmado si se ha seleccionado
        if (this.documentoFirmado) {
          console.log('Subiendo documento firmado...');
          idDocumentoFirmado = await this.subirDocumentoFirmado();
          console.log('Documento firmado subido con ID:', idDocumentoFirmado);
        }
        
        // Subir documentación de gastos si se ha seleccionado
        if (this.documentacionGastos) {
          console.log('Subiendo documentación de gastos...');
          idDocumentacionGastos = await this.subirDocumentacionGastos();
          console.log('Documentación de gastos subida con ID:', idDocumentacionGastos);
        }
        
        // Subir documento JP si se ha seleccionado
        if (this.documentoJP) {
          console.log('Subiendo documento JP...');
          idDocumentoJP = await this.subirDocumentoJP();
          console.log('Documento JP subido con ID:', idDocumentoJP);
        }

        // Preparar los datos de la comisión para enviar
        const comisionData = { ...this.comisionForm.value };
        
        // Formatear fechas correctamente
        if (comisionData.fecha_inicio) {
          const fechaInicio = new Date(comisionData.fecha_inicio);
          if (isNaN(fechaInicio.getTime())) {
            this.error = 'Fecha de inicio inválida';
            this.saving = false;
            return;
          }
          comisionData.fecha_inicio = fechaInicio.toISOString().split('T')[0];
        }

        if (comisionData.fecha_fin) {
          const fechaFin = new Date(comisionData.fecha_fin);
          if (isNaN(fechaFin.getTime())) {
            this.error = 'Fecha de fin inválida';
            this.saving = false;
            return;
          }
          comisionData.fecha_fin = fechaFin.toISOString().split('T')[0];
        }

        if (comisionData.a_fecha_firma) {
          const fechaFirma = new Date(comisionData.a_fecha_firma);
          if (isNaN(fechaFirma.getTime())) {
            this.error = 'Fecha de firma inválida';
            this.saving = false;
            return;
          }
          comisionData.a_fecha_firma = fechaFirma.toISOString().split('T')[0];
        } else {
          // Eliminar el campo si está vacío
          delete comisionData.a_fecha_firma;
        }

        if (comisionData.fecha_abono) {
          const fechaAbono = new Date(comisionData.fecha_abono);
          if (isNaN(fechaAbono.getTime())) {
            this.error = 'Fecha de abono inválida';
            this.saving = false;
            return;
          }
          comisionData.fecha_abono = fechaAbono.toISOString().split('T')[0];
        } else {
          // Eliminar el campo si está vacío
          delete comisionData.fecha_abono;
        }

        // Convertir horas en formato 'HH:MM' a ISO datetime con fecha actual
        if (comisionData.hinicio && comisionData.hinicio.trim() !== '') {
          // Usar la fecha de inicio para la hora de inicio
          const fechaInicio = new Date(comisionData.fecha_inicio);
          const [horasInicio, minutosInicio] = comisionData.hinicio.split(':');
          
          // Crear una fecha ISO con la zona horaria correcta
          // Primero, ajustamos la fecha con la hora local
          fechaInicio.setHours(parseInt(horasInicio), parseInt(minutosInicio), 0, 0);
          
          // Luego obtenemos los componentes de la fecha ajustada
          const year = fechaInicio.getFullYear();
          const month = fechaInicio.getMonth() + 1;
          const day = fechaInicio.getDate();
          const hours = fechaInicio.getHours();
          const minutes = fechaInicio.getMinutes();
          
          // Formato ISO-8601 con zona horaria local
          comisionData.hinicio = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000`;
        } else {
          // Eliminar el campo si está vacío
          delete comisionData.hinicio;
        }

        if (comisionData.hfin && comisionData.hfin.trim() !== '') {
          // Usar la fecha de fin para la hora de fin
          const fechaFin = new Date(comisionData.fecha_fin);
          const [horasFin, minutosFin] = comisionData.hfin.split(':');
          
          // Crear una fecha ISO con la zona horaria correcta
          // Primero, ajustamos la fecha con la hora local
          fechaFin.setHours(parseInt(horasFin), parseInt(minutosFin), 0, 0);
          
          // Luego obtenemos los componentes de la fecha ajustada
          const year = fechaFin.getFullYear();
          const month = fechaFin.getMonth() + 1;
          const day = fechaFin.getDate();
          const hours = fechaFin.getHours();
          const minutes = fechaFin.getMinutes();
          
          // Formato ISO-8601 con zona horaria local
          comisionData.hfin = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000`;
        } else {
          // Eliminar el campo si está vacío
          delete comisionData.hfin;
        }
        
        // Actualizar los IDs de documentos solo si se subieron nuevos
        if (idDocumentoFirmado) {
          comisionData.documento_firmado = idDocumentoFirmado;
          console.log('Actualizado ID de documento firmado:', idDocumentoFirmado);
        }
        
        if (idDocumentacionGastos) {
          comisionData.documentacion_gastos = idDocumentacionGastos;
          console.log('Actualizado ID de documentación de gastos:', idDocumentacionGastos);
        }
        
        if (idDocumentoJP) {
          comisionData.documento_jp = idDocumentoJP;
          console.log('Actualizado ID de documento JP:', idDocumentoJP);
        }
        
        console.log('Datos de comisión a actualizar:', comisionData);
        
        // Actualizar datos de la comisión
        console.log('Enviando actualización a la API...');
        const url = `${this.API_URL}/ComisionServicio?id_comision=eq.${this.comisionId}`;
        console.log('URL de actualización:', url);
        
        const response = await this.http.patch(url, comisionData).toPromise();
        console.log('Respuesta de actualización:', response);

        this.successMessage = 'Comisión actualizada correctamente';
        console.log('Comisión actualizada con éxito');
        
        // Resetear los archivos cargados para evitar subirlos de nuevo
        this.documentoFirmado = null;
        this.documentacionGastos = null;
        this.documentoJP = null;
        
        // Resetear los inputs de archivos
        this.resetFileInputs();
        
        // Añadir el nuevo estado a la pila de navegación
        this.navigationService.pushState(
          `/comisiones-servicio/${this.comisionId}`,
          'Detalle Comisión de Servicio'
        );
        
        // Navegar al detalle de la comisión
        setTimeout(() => {
          this.router.navigate(['/comisiones-servicio', this.comisionId]);
        }, 1500);
        
        this.saving = false;
      } catch (error) {
        console.error('Error al actualizar la comisión:', error);
        this.error = 'Error al actualizar la comisión. Por favor, inténtalo de nuevo.';
        this.saving = false;
      }
    } else {
      // Marcar todos los campos como tocados para mostrar los errores
      Object.keys(this.comisionForm.controls).forEach(key => {
        const control = this.comisionForm.get(key);
        control?.markAsTouched();
      });
      
      this.error = 'Por favor, complete todos los campos obligatorios.';
    }
  }
  
  resetFileInputs(): void {
    // Resetear los inputs de archivos
    const inputs = document.querySelectorAll('input[type="file"]');
    inputs.forEach((input) => {
      (input as HTMLInputElement).value = '';
    });
  }

  cancelar(): void {
    this.router.navigate(['/comisiones-servicio', this.comisionId]);
  }

  volverALista(): void {
    this.navigationService.volver();
  }

  abrirDocumento(idDocumento: string): void {
    console.log('Intentando abrir documento con ID:', idDocumento);
    
    if (!idDocumento) {
      console.error('Error: No se proporcionó un ID de documento válido');
      this.error = 'Error: No se pudo abrir el documento. ID de documento no válido.';
      return;
    }
    
    // Verificar si es una URL absoluta (comienza con http o https)
    if (idDocumento.startsWith('http://') || idDocumento.startsWith('https://')) {
      console.log('Es una URL completa, abriendo directamente:', idDocumento);
      window.open(idDocumento, '_blank');
      return;
    }
    
    // Verificar si es una ruta relativa que apunta a archivos locales del servidor
    if (idDocumento.includes('/proyectos/')) {
      console.log('Es una ruta relativa a un archivo local:', idDocumento);
      // Si es una ruta relativa sin el http, añadimos la base
      const urlCompleta = idDocumento.startsWith('/') 
        ? `http://localhost:4200${idDocumento}` 
        : `http://localhost:4200/${idDocumento}`;
      console.log('URL completa generada:', urlCompleta);
      window.open(urlCompleta, '_blank');
      return;
    }
    
    // Si llegamos aquí, asumimos que es un ID para el bibliotecario
    const proyectoId = this.comisionForm.get('proyecto')?.value;
    console.log('Proyecto ID:', proyectoId);
    
    if (!proyectoId) {
      console.error('Error: No hay proyecto asociado a la comisión');
      this.error = 'Error: No se pudo abrir el documento. No hay proyecto asociado.';
      return;
    }
    
    const url = this.bibliotecarioService.getUrlDescarga(idDocumento, proyectoId);
    console.log('URL de bibliotecario generada:', url);
    
    window.open(url, '_blank');
  }

  mostrarBotonDocumento(tipo: string): boolean {
    switch (tipo) {
      case 'documento_firmado':
        return !!this.comisionForm.get('documento_firmado')?.value || !!this.documentoFirmado;
      case 'documentacion_gastos':
        return !!this.comisionForm.get('documentacion_gastos')?.value || !!this.documentacionGastos;
      case 'documento_jp':
        return !!this.comisionForm.get('documento_jp')?.value || !!this.documentoJP;
      default:
        return false;
    }
  }
}
