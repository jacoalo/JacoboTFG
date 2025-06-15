import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { BibliotecarioService } from '../../../core/services/bibliotecario.service';
import { ComisionServicioService } from '../../../core/services/comision-servicio.service';
import { NavigationService } from '../../../core/services/navigation.service';
import { ComisionServicio } from '../../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-crear-comision-servicio',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './crear-comision-servicio.component.html',
  styleUrls: ['./crear-comision-servicio.component.css']
})
export class CrearComisionServicioComponent implements OnInit, OnDestroy {
  proyectoId: string = '';
  comisionForm: FormGroup;
  loading: boolean = false;
  saving: boolean = false;
  error: string = '';
  successMessage: string = '';
  documentoFirmado: File | null = null;
  documentacionGastos: File | null = null;
  documentoJP: File | null = null;
  private routeSubscription: Subscription | null = null;
  
  private readonly API_URL = 'http://localhost:3000';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private bibliotecarioService: BibliotecarioService,
    private comisionServicioService: ComisionServicioService,
    private navigationService: NavigationService
  ) {
    // Inicializar formulario vacío
    this.comisionForm = this.fb.group({
      id_comision: ['', Validators.required],
      proyecto: ['', Validators.required],
      nif_comisionado: ['', Validators.required],
      nombre: ['', Validators.required],
      apellido1: ['', Validators.required],
      apellido2: [''],
      cargo: ['', Validators.required],
      grupo: [1, [Validators.required, Validators.min(1), Validators.max(3)]],
      motivo_viaje: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      hinicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      hfin: ['', Validators.required],
      origen: ['', Validators.required],
      destino: ['', Validators.required],
      
      // Derechos y gastos
      derecho_dietas: [false],
      gastos_viajes: [false],
      residencia: [false],
      gastos_realizados: [false],
      
      // Transporte
      transporte_aereo: [false],
      vehiculo_particular: [false],
      vehiculo_oficial: [false],
      matricula: [''],
      gastos_peaje: [false],
      gastos_garaje: [false],
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
      
      // Autorización
      autorizador: [''],
      a_cargo: [''],
      a_localidad: [''],
      a_fecha_firma: [''],
      
      // Datos económicos
      gastos_generados: [0],
      fecha_abono: [''],
      
      // Documentos
      documento_firmado: [''],
      documentacion_gastos: [''],
      documento_jp: [''],
      
      // Estado
      d_generado: [false]
    });
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.proyectoId = params['proyectoId'];
      if (!this.proyectoId) {
        this.router.navigate(['/dashboard']);
        return;
      }

      // Asignar el proyecto al formulario
      this.comisionForm.patchValue({
        proyecto: this.proyectoId
      });

      // Generar ID de comisión automáticamente
      this.generarIdComision();

      // Añadir el estado actual a la pila de navegación
      this.navigationService.pushState(
        `/comisiones-servicio/proyecto/${this.proyectoId}/nueva`,
        'Nueva Comisión de Servicio'
      );
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
  
  generarIdComision(): void {
    const fecha = new Date();
    const anio = fecha.getFullYear().toString();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const idComision = `C${anio}${mes}${random}`;
    this.comisionForm.patchValue({
      id_comision: idComision
    });
  }

  onFileSelected(event: Event, tipo: string): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      switch(tipo) {
        case 'documento_firmado':
          this.documentoFirmado = file;
          break;
        case 'documentacion_gastos':
          this.documentacionGastos = file;
          break;
        case 'documento_jp':
          this.documentoJP = file;
          break;
      }
    }
  }

  async subirDocumentoFirmado(): Promise<string | null> {
    if (!this.documentoFirmado) return null;
    
    try {
      const response = await this.bibliotecarioService.subirDocumento(
        this.documentoFirmado, 
        this.proyectoId
      ).toPromise() as any;
      
      console.log('Documento firmado subido:', response);
      return response?.id;
    } catch (error) {
      console.error('Error subiendo documento firmado:', error);
      throw error;
    }
  }

  async subirDocumentacionGastos(): Promise<string | null> {
    if (!this.documentacionGastos) return null;
    
    try {
      const response = await this.bibliotecarioService.subirDocumento(
        this.documentacionGastos, 
        this.proyectoId
      ).toPromise() as any;
      
      console.log('Documentación de gastos subida:', response);
      return response?.id;
    } catch (error) {
      console.error('Error subiendo documentación de gastos:', error);
      throw error;
    }
  }

  async subirDocumentoJP(): Promise<string | null> {
    if (!this.documentoJP) return null;
    
    try {
      const response = await this.bibliotecarioService.subirDocumento(
        this.documentoJP, 
        this.proyectoId
      ).toPromise() as any;
      
      console.log('Documento JP subido:', response);
      return response?.id;
    } catch (error) {
      console.error('Error subiendo documento JP:', error);
      throw error;
    }
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
        
        // Subir documentación gastos si se ha seleccionado
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
        
        // Preparar datos para guardar
        const comisionData: ComisionServicio = {
          ...this.comisionForm.value,
          fecha_inicio: new Date(this.comisionForm.value.fecha_inicio),
          fecha_fin: new Date(this.comisionForm.value.fecha_fin),
          hinicio: new Date(`${this.comisionForm.value.fecha_inicio}T${this.comisionForm.value.hinicio}`),
          hfin: new Date(`${this.comisionForm.value.fecha_fin}T${this.comisionForm.value.hfin}`),
          a_fecha_firma: this.comisionForm.value.a_fecha_firma ? new Date(this.comisionForm.value.a_fecha_firma) : undefined,
          fecha_abono: this.comisionForm.value.fecha_abono ? new Date(this.comisionForm.value.fecha_abono) : undefined,
          documento_firmado: idDocumentoFirmado || undefined,
          documentacion_gastos: idDocumentacionGastos || undefined,
          documento_jp: idDocumentoJP || undefined
        };
        
        console.log('Datos a guardar:', comisionData);
        
        // Crear la comisión usando el servicio
        this.comisionServicioService.createComisionServicio(comisionData)
          .subscribe({
            next: (response) => {
              console.log('Comisión creada correctamente:', response);
              this.successMessage = 'Comisión creada correctamente';
              this.saving = false;
              
              // Resetear el formulario y los archivos
              this.resetForm();
              
              // Añadir el nuevo estado a la pila de navegación
              this.navigationService.pushState(
                `/comisiones-servicio/proyecto/${this.proyectoId}`,
                'Comisiones de Servicio'
              );
              
              setTimeout(() => {
                this.router.navigate(['/comisiones-servicio/proyecto', this.proyectoId]);
              }, 1500);
            },
            error: (error) => {
              console.error('Error creando comisión:', error);
              
              // Mostrar detalles del error para diagnóstico
              if (error.error && error.error.message) {
                this.error = `Error al crear la comisión: ${error.error.message}`;
              } else if (error.error && error.error.detail) {
                this.error = `Error al crear la comisión: ${error.error.detail}`;
              } else {
                this.error = 'Error al crear la comisión. Por favor, inténtalo de nuevo.';
              }
              
              // Mostrar datos específicos para diagnóstico en la consola
              console.log('Datos enviados al servidor:', comisionData);
              console.log('Estado de la respuesta:', error.status);
              console.log('Texto del estado:', error.statusText);
              console.log('Mensaje de error completo:', error.error);
              
              this.saving = false;
            }
          });
        
      } catch (error) {
        console.error('Error en el proceso de guardado:', error);
        this.error = 'Error en el proceso de guardado. Por favor, inténtalo de nuevo.';
        this.saving = false;
      }
    } else {
      // Marcar campos como tocados para mostrar errores
      Object.keys(this.comisionForm.controls).forEach(key => {
        const control = this.comisionForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      
      // Mostrar qué campos son inválidos para depuración
      const invalidControls: string[] = [];
      Object.keys(this.comisionForm.controls).forEach(key => {
        const control = this.comisionForm.get(key);
        if (control && control.invalid) {
          invalidControls.push(key);
        }
      });
      console.log('Campos inválidos:', invalidControls);
      
      this.error = 'Por favor, completa correctamente todos los campos obligatorios.';
    }
  }
  
  resetForm(): void {
    // Resetear el formulario pero manteniendo el proyecto
    const proyecto = this.comisionForm.get('proyecto')?.value;
    
    this.comisionForm.reset({
      proyecto: proyecto
    });
    
    // Generar nuevo ID de comisión
    this.generarIdComision();
    
    // Resetear archivos
    this.documentoFirmado = null;
    this.documentacionGastos = null;
    this.documentoJP = null;
    
    // Resetear los inputs de archivos
    this.resetFileInputs();
  }
  
  resetFileInputs(): void {
    // Resetear los inputs de archivos
    const inputs = document.querySelectorAll('input[type="file"]');
    inputs.forEach((input) => {
      (input as HTMLInputElement).value = '';
    });
  }
  
  volverALista(): void {
    this.navigationService.volver();
  }
}
