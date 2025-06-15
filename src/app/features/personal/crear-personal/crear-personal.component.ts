import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GastosPersonalService, NavigationService } from '../../../core/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-crear-personal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-personal.component.html',
  styleUrls: ['./crear-personal.component.css']
})
export class CrearPersonalComponent implements OnInit, OnDestroy {
  personalForm: FormGroup;
  loading = false;
  error: string | null = null;
  isEditing = false;
  dni: string | null = null;
  private routeSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private gastosPersonalService: GastosPersonalService,
    private router: Router,
    private route: ActivatedRoute,
    private navigationService: NavigationService
  ) {
    this.personalForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}[A-Z]$')]],
      nombre: ['', Validators.required],
      apellido1: ['', Validators.required],
      apellido2: [''],
      nss: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      fecha_nac: ['', Validators.required]
    });

    // Marcar campos como touched cuando el usuario interactúa con ellos
    Object.keys(this.personalForm.controls).forEach(key => {
      const control = this.personalForm.get(key);
      if (control) {
        control.valueChanges.subscribe(() => {
          control.markAsTouched();
        });
      }
    });
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.dni = params['dni'];
      if (this.dni) {
        this.isEditing = true;
        this.cargarPersonal(this.dni);
      }

      // Añadir el estado actual a la pila de navegación
      this.navigationService.pushState(
        this.dni ? `/personal/${this.dni}/editar` : '/personal/nuevo',
        this.dni ? 'Editar Personal' : 'Nuevo Personal'
      );
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  volverALista(): void {
    this.navigationService.volver();
  }

  cargarPersonal(dni: string): void {
    this.loading = true;
    this.error = null;

    this.gastosPersonalService.getPersonalById(dni).subscribe({
      next: (personal) => {
        // Formatear la fecha para el input de tipo date
        const fechaNac = personal.fecha_nac ? new Date(personal.fecha_nac).toISOString().split('T')[0] : '';
        
        this.personalForm.patchValue({
          dni: personal.dni,
          nombre: personal.nombre,
          apellido1: personal.apellido1,
          apellido2: personal.apellido2 || '',
          nss: personal.nss,
          fecha_nac: fechaNac
        });

        // Deshabilitar el campo DNI en modo edición
        this.personalForm.get('dni')?.disable();
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando personal:', error);
        this.error = 'Error al cargar los datos del personal. Por favor, inténtelo de nuevo.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.personalForm.valid) {
      this.loading = true;
      this.error = null;

      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.personalForm.controls).forEach(key => {
        const control = this.personalForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });

      const formData = this.personalForm.getRawValue(); // Usar getRawValue para incluir campos deshabilitados

      if (this.isEditing && this.dni) {
        this.gastosPersonalService.updatePersonal(this.dni, formData).subscribe({
          next: () => {
            this.router.navigate(['/personal']);
          },
          error: (error) => {
            this.loading = false;
            this.error = 'Error al actualizar el personal. Por favor, inténtelo de nuevo.';
            console.error('Error al actualizar personal:', error);
          }
        });
      } else {
        this.gastosPersonalService.createPersonal(formData).subscribe({
          next: () => {
            this.router.navigate(['/personal']);
          },
          error: (error) => {
            this.loading = false;
            this.error = 'Error al crear el personal. Por favor, inténtelo de nuevo.';
            console.error('Error al crear personal:', error);
          }
        });
      }
    }
  }

  cancelar(): void {
    this.router.navigate(['/personal']);
  }
} 