import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GastosPersonalService, NavigationService } from '../../../core/services';
import { Personal } from '../../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-crear-gasto-personal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './crear-gasto-personal.component.html',
  styleUrls: ['./crear-gasto-personal.component.css']
})
export class CrearGastoPersonalComponent implements OnInit, OnDestroy {
  proyectoId: string = '';
  gastoForm: FormGroup;
  personal: Personal[] = [];
  loading: boolean = false;
  saving: boolean = false;
  error: string = '';
  successMessage: string = '';
  documentoGasto: File | null = null;
  private routeSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private gastosPersonalService: GastosPersonalService,
    private navigationService: NavigationService
  ) {
    this.gastoForm = this.fb.group({
      dni: ['', Validators.required],
      proyecto: ['', Validators.required],
      tipo_gasto: ['', Validators.required],
      importe: [0, [Validators.required, Validators.min(0)]],
      mes: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
      anio: [new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
      documento: ['']
    });
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.proyectoId = params['proyectoId'];
      if (!this.proyectoId) {
        this.router.navigate(['/dashboard']);
        return;
      }

      this.gastoForm.patchValue({
        proyecto: this.proyectoId
      });

      this.cargarPersonal();

      // Añadir el estado actual a la pila de navegación
      this.navigationService.pushState(
        `/gastos-personal/proyecto/${this.proyectoId}/nuevo`,
        'Nuevo Gasto de Personal'
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

  cargarPersonal(): void {
    this.loading = true;
    this.gastosPersonalService.getPersonal().subscribe({
      next: (personal) => {
        this.personal = personal;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando personal:', error);
        this.error = 'Error al cargar el personal. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.documentoGasto = input.files[0];
    }
  }

  async onSubmit(): Promise<void> {
    if (this.gastoForm.valid) {
      this.saving = true;
      this.error = '';
      this.successMessage = '';

      try {
        const gastoData = { ...this.gastoForm.value };

        // Subir documento si existe
        if (this.documentoGasto) {
          const response = await this.gastosPersonalService.uploadDocumentoNomina(
            gastoData.dni,
            gastoData.proyecto,
            gastoData.mes,
            gastoData.anio,
            this.documentoGasto
          ).toPromise();
          
          if (response && response.id) {
            gastoData.documento = response.id;
          } else {
            throw new Error('No se recibió un ID válido del documento');
          }
        }

        // Crear el gasto
        this.gastosPersonalService.createGastoPersonal(gastoData).subscribe({
          next: () => {
            this.successMessage = 'Gasto de personal creado correctamente';
            this.saving = false;
            
            // Añadir el nuevo estado a la pila de navegación
            this.navigationService.pushState(
              `/gastos-personal/proyecto/${this.proyectoId}`,
              'Lista de Gastos de Personal'
            );
            
            setTimeout(() => {
              this.router.navigate(['/gastos-personal/proyecto', this.proyectoId]);
            }, 1500);
          },
          error: (error) => {
            console.error('Error creando gasto:', error);
            this.error = 'Error al crear el gasto. Por favor, inténtalo de nuevo.';
            this.saving = false;
          }
        });
      } catch (error) {
        console.error('Error en el proceso:', error);
        this.error = 'Error en el proceso. Por favor, inténtalo de nuevo.';
        this.saving = false;
      }
    } else {
      Object.keys(this.gastoForm.controls).forEach(key => {
        const control = this.gastoForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      this.error = 'Por favor, completa correctamente todos los campos obligatorios.';
    }
  }
}
