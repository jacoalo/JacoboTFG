import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services';
import { CMenor, Necesidad } from '../../../core/models';
import { Subscription } from 'rxjs';
import { NavigationService } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-crear-contrato-menor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './crear-contrato-menor.component.html',
  styleUrls: ['./crear-contrato-menor.component.css']
})
export class CrearContratoMenorComponent implements OnInit, OnDestroy {
  contratoForm: FormGroup;
  proyectoId: string = '';
  loading: boolean = false;
  submitting: boolean = false;
  error: string = '';
  successMessage: string = '';
  isGestor: boolean = false;
  necesidades: Necesidad[] = [];
  mostrarCampoCalidad: boolean = false;
  private readonly API_URL = 'http://localhost:3000';
  private routeSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private navigationService: NavigationService
  ) {
    this.isGestor = this.authService.isGestor();
    
    // Iniciar formulario con valores por defecto
    this.contratoForm = this.fb.group({
      id: ['', Validators.required], // Será generado automáticamente
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
      this.proyectoId = params['proyectoId'];
      this.contratoForm.patchValue({ proyecto: this.proyectoId });
      this.cargarNecesidades();
      this.generarIdContrato();
      this.navigationService.pushState(
        `/contratos-menores/proyecto/${this.proyectoId}/nuevo`,
        'Crear Contrato Menor'
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

  generarIdContrato(): void {
    // Generar un ID único para el contrato menor
    // Con formato que respete la restricción de 10 caracteres
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const year = new Date().getFullYear().toString().substring(2); // Solo los 2 últimos dígitos del año
    const id = `CM${randomNum}${year}`;
    
    // Asignar el ID pero permitir al usuario cambiarlo completamente
    this.contratoForm.patchValue({ id: id });
  }

  cargarNecesidades(): void {
    this.loading = true;
    this.http.get<Necesidad[]>(`${this.API_URL}/necesidad?order=id.asc`)
      .subscribe({
        next: (necesidades) => {
          this.necesidades = necesidades;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando necesidades', error);
          this.error = 'Error al cargar las necesidades para el contrato';
          this.loading = false;
        }
      });
  }

  onSubmit(): void {
    if (!this.isGestor) {
      this.error = 'No tienes permisos para crear contratos';
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

    this.http.post<CMenor>(`${this.API_URL}/CMenor`, formData, { headers })
      .subscribe({
        next: (response) => {
          this.successMessage = 'Contrato menor creado correctamente';
          this.submitting = false;
          
          // Añadir el nuevo estado a la pila de navegación
          this.navigationService.pushState(
            `/contratos-menores/${response.id}`,
            'Detalle de Contrato Menor'
          );
          
          setTimeout(() => {
            this.router.navigate(['/contratos-menores', response.id]);
          }, 1500);
        },
        error: (error) => {
          console.error('Error creando contrato', error);
          if (error.status === 409 && error.error && error.error.message && error.error.message.includes('duplicate key')) {
            this.error = `El ID de contrato ${formData.id} ya existe. Por favor, modifique el ID e inténtelo de nuevo.`;
          } else {
            this.error = `Error al crear el contrato: ${error.status} ${error.statusText}`;
            if (error.error && error.error.message) {
              this.error += ` - ${error.error.message}`;
            }
          }
          this.submitting = false;
        }
      });
  }

  volverALista(): void {
    this.navigationService.volver();
  }
}
