import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService, BibliotecarioService } from '../../../core/services';
import { CMenor, Necesidad } from '../../../core/models';
import { DocumentoResponse } from '../../../core/services/bibliotecario.service';
import { Subscription } from 'rxjs';
import { NavigationService } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-editar-contrato-menor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './editar-contrato-menor.component.html',
  styleUrls: ['./editar-contrato-menor.component.css']
})
export class EditarContratoMenorComponent implements OnInit, OnDestroy {
  contratoForm: FormGroup;
  contratoId: string = '';
  proyecto: string = '';
  loading: boolean = true;
  submitting: boolean = false;
  error: string = '';
  successMessage: string = '';
  isGestor: boolean = false;
  necesidades: Necesidad[] = [];
  mostrarCampoCalidad: boolean = false;
  private readonly API_URL = 'http://localhost:3000';
  private routeSubscription: Subscription | null = null;
  
  // Variables para manejo de documentos
  documentoPresupuesto: File | null = null;
  documentoFirmado: File | null = null;
  cargandoDocumentoPresupuesto: boolean = false;
  cargandoDocumentoFirmado: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private bibliotecarioService: BibliotecarioService,
    private navigationService: NavigationService
  ) {
    this.isGestor = this.authService.isGestor();
    
    // Iniciar formulario con valores por defecto
    this.contratoForm = this.fb.group({
      id: ['', Validators.required],
      proyecto: ['', Validators.required],
      proveedor: ['', Validators.required],
      cif: ['', Validators.required],
      justificacion: ['', Validators.required],
      importe: [0, [Validators.required, Validators.min(0)]],
      localidad: ['', Validators.required],
      fecha_firma_ip: [''],
      necesidad: [1, Validators.required],
      aplicacionp: [''],
      ejercicio: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
      presupuesto: [''],
      ofertaeconomica: [true],
      calidad: [false],
      criterio_calidad: [''],
      gerente: [''],
      fecha_firma_gerente: [''],
      documento_firmado: [''],
      documento_generado: [false]
    });
  }

  ngOnInit(): void {
    if (!this.isGestor) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.routeSubscription = this.route.params.subscribe(params => {
      this.contratoId = params['id'];
      this.cargarNecesidades();
      this.cargarContrato();
      this.navigationService.pushState(
        `/contratos-menores/${this.contratoId}/editar`,
        'Editar Contrato Menor'
      );
    });

    // Suscripción para controlar la visibilidad del campo criterio_calidad
    this.contratoForm.get('calidad')?.valueChanges.subscribe(value => {
      this.mostrarCampoCalidad = value;
      
      const criterioField = this.contratoForm.get('criterio_calidad');
      if (value) {
        criterioField?.setValidators([Validators.required]);
      } else {
        criterioField?.clearValidators();
        criterioField?.setValue('');
      }
      criterioField?.updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  cargarContrato(): void {
    this.loading = true;
    this.error = '';

    this.http.get<CMenor[]>(`${this.API_URL}/CMenor?id=eq.${this.contratoId}`)
      .subscribe({
        next: (contratos) => {
          if (contratos && contratos.length > 0) {
            const contrato = contratos[0];
            this.proyecto = contrato.proyecto;
            
            // Formatear fechas para los inputs date
            const fechaFirmaIP = contrato.fecha_firma_ip ? new Date(contrato.fecha_firma_ip).toISOString().split('T')[0] : '';
            const fechaFirmaGerente = contrato.fecha_firma_gerente ? new Date(contrato.fecha_firma_gerente).toISOString().split('T')[0] : '';
            
            console.log('Contrato cargado:', contrato);
            console.log('Documento presupuesto:', contrato.presupuesto);
            console.log('Documento firmado:', contrato.documento_firmado);
            
            // Actualizar el formulario con los valores obtenidos
            this.contratoForm.patchValue({
              id: contrato.id,
              proyecto: contrato.proyecto,
              proveedor: contrato.proveedor,
              cif: contrato.cif,
              justificacion: contrato.justificacion,
              importe: contrato.importe,
              localidad: contrato.localidad,
              fecha_firma_ip: fechaFirmaIP,
              necesidad: Number(contrato.necesidad),
              aplicacionp: contrato.aplicacionp || '',
              ejercicio: contrato.ejercicio,
              presupuesto: contrato.presupuesto || '',
              ofertaeconomica: contrato.ofertaeconomica,
              calidad: contrato.calidad,
              criterio_calidad: contrato.criterio_calidad || '',
              gerente: contrato.gerente || '',
              fecha_firma_gerente: fechaFirmaGerente,
              documento_firmado: contrato.documento_firmado || '',
              documento_generado: contrato.documento_generado
            });
            
            this.mostrarCampoCalidad = contrato.calidad;
            this.loading = false;
            
            // Forzar detección de cambios
            setTimeout(() => {
              if (this.contratoForm.get('presupuesto')?.value) {
                console.log('Hay presupuesto disponible:', this.contratoForm.get('presupuesto')?.value);
              }
              if (this.contratoForm.get('documento_firmado')?.value) {
                console.log('Hay documento firmado disponible:', this.contratoForm.get('documento_firmado')?.value);
              }
            }, 0);
          } else {
            this.error = 'No se encontró el contrato solicitado';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error cargando el contrato', error);
          this.error = 'Error al cargar el contrato';
          this.loading = false;
        }
      });
  }

  cargarNecesidades(): void {
    this.http.get<Necesidad[]>(`${this.API_URL}/necesidad?order=id.asc`)
      .subscribe({
        next: (necesidades) => {
          this.necesidades = necesidades;
        },
        error: (error) => {
          console.error('Error cargando necesidades', error);
          this.error = 'Error al cargar las necesidades para el contrato';
        }
      });
  }

  // Métodos para manejo de documentos
  onDocumentoPresupuestoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.documentoPresupuesto = input.files[0];
    }
  }

  onDocumentoFirmadoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.documentoFirmado = input.files[0];
    }
  }

  subirDocumentoPresupuesto(): Promise<string | null> {
    if (!this.documentoPresupuesto || !this.proyecto) {
      return Promise.resolve(null);
    }

    this.cargandoDocumentoPresupuesto = true;
    
    // Guardamos una referencia al archivo para asegurarnos de que no es nulo
    const fileToUpload = this.documentoPresupuesto;
    const proyectoId = this.proyecto;
    
    return new Promise((resolve, reject) => {
      this.bibliotecarioService.subirDocumento(fileToUpload, proyectoId)
        .subscribe({
          next: (response: DocumentoResponse) => {
            this.contratoForm.patchValue({ presupuesto: response.id });
            this.cargandoDocumentoPresupuesto = false;
            resolve(response.id);
            // Resetear el input file
            const input = document.getElementById('presupuesto_file') as HTMLInputElement;
            if (input) {
              input.value = '';
              this.documentoPresupuesto = null;
            }
          },
          error: (error) => {
            console.error('Error subiendo documento de presupuesto', error);
            this.error = 'Error al subir el documento de presupuesto.';
            this.cargandoDocumentoPresupuesto = false;
            reject(error);
          }
        });
    });
  }

  subirDocumentoFirmado(): Promise<string | null> {
    if (!this.documentoFirmado || !this.proyecto) {
      return Promise.resolve(null);
    }

    this.cargandoDocumentoFirmado = true;
    
    // Guardamos una referencia al archivo para asegurarnos de que no es nulo
    const fileToUpload = this.documentoFirmado;
    const proyectoId = this.proyecto;
    
    return new Promise((resolve, reject) => {
      this.bibliotecarioService.subirDocumento(fileToUpload, proyectoId)
        .subscribe({
          next: (response: DocumentoResponse) => {
            this.contratoForm.patchValue({ 
              documento_firmado: response.id,
              documento_generado: true
            });
            this.cargandoDocumentoFirmado = false;
            resolve(response.id);
            // Resetear el input file
            const input = document.getElementById('documento_firmado_file') as HTMLInputElement;
            if (input) {
              input.value = '';
              this.documentoFirmado = null;
            }
          },
          error: (error) => {
            console.error('Error subiendo documento firmado', error);
            this.error = 'Error al subir el documento firmado.';
            this.cargandoDocumentoFirmado = false;
            reject(error);
          }
        });
    });
  }

  abrirDocumento(idDocumento: string): void {
    if (!idDocumento || !this.proyecto) {
      this.error = 'Error: No se puede abrir el documento porque no se encontró su identificador o no hay proyecto asociado.';
      return;
    }
    
    const url = this.bibliotecarioService.getUrlDescarga(idDocumento, this.proyecto);
    window.open(url, '_blank');
  }

  async onSubmit(): Promise<void> {
    if (!this.isGestor) {
      this.error = 'No tienes permisos para editar contratos';
      return;
    }

    if (this.contratoForm.invalid) {
      this.error = 'Por favor, complete todos los campos obligatorios correctamente';
      console.log('Formulario inválido:', this.contratoForm.errors);
      return;
    }

    this.submitting = true;
    this.error = '';
    this.successMessage = '';

    try {
      // Primero subimos los documentos si existen
      if (this.documentoPresupuesto) {
        await this.subirDocumentoPresupuesto();
      }
      
      if (this.documentoFirmado) {
        await this.subirDocumentoFirmado();
      }

      // Obtener todos los valores del formulario
      const formData = {...this.contratoForm.value};
      
      // Asegurarse de que el tipo de datos sea correcto
      formData.necesidad = Number(formData.necesidad);
      formData.ejercicio = Number(formData.ejercicio);
      formData.importe = Number(formData.importe);
      
      // Asegurarse de que las fechas están en formato ISO
      if (formData.fecha_firma_ip) {
        formData.fecha_firma_ip = new Date(formData.fecha_firma_ip).toISOString();
      } else {
        delete formData.fecha_firma_ip; // Eliminar si es vacío
      }
      
      if (formData.fecha_firma_gerente) {
        formData.fecha_firma_gerente = new Date(formData.fecha_firma_gerente).toISOString();
      } else {
        delete formData.fecha_firma_gerente; // Eliminar si es vacío
      }

      // Manejar campos opcionales vacíos
      if (!formData.criterio_calidad) {
        delete formData.criterio_calidad;
      }
      
      if (!formData.aplicacionp) {
        delete formData.aplicacionp;
      }
      
      if (!formData.presupuesto) {
        delete formData.presupuesto;
      }
      
      if (!formData.gerente) {
        delete formData.gerente;
      }
      
      if (!formData.documento_firmado) {
        delete formData.documento_firmado;
      }

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      });

      console.log('Datos a enviar:', formData);

      this.http.patch<CMenor>(
        `${this.API_URL}/CMenor?id=eq.${this.contratoId}`, 
        formData, 
        { headers }
      ).subscribe({
        next: () => {
          this.successMessage = 'Contrato menor actualizado correctamente';
          this.submitting = false;
          
          // Añadir el nuevo estado a la pila de navegación
          this.navigationService.pushState(
            `/contratos-menores/${this.contratoId}`,
            'Detalle de Contrato Menor'
          );
          
          setTimeout(() => {
            this.router.navigate(['/contratos-menores', this.contratoId]);
          }, 1500);
        },
        error: (error) => {
          console.error('Error actualizando contrato', error);
          this.error = 'Error al actualizar el contrato. Revise los datos introducidos.';
          this.submitting = false;
        }
      });
    } catch (error) {
      console.error('Error en el proceso de subida/actualización', error);
      this.error = 'Error en el proceso de actualización. Por favor, inténtelo de nuevo.';
      this.submitting = false;
    }
  }

  volverALista(): void {
    this.navigationService.volver();
  }
}
