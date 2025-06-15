import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GastosPersonalService, NavigationService } from '../../../core/services';
import { GastosPersonal, Personal } from '../../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-editar-gasto-personal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './editar-gasto-personal.component.html',
  styleUrls: ['./editar-gasto-personal.component.css']
})
export class EditarGastoPersonalComponent implements OnInit, OnDestroy {
  gastoForm: FormGroup;
  gasto: GastosPersonal | null = null;
  personal: Personal | null = null;
  loading: boolean = true;
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
      const { dni, proyectoId, mes, anio } = params;
      
      // Añadir el estado actual a la pila de navegación
      this.navigationService.pushState(
        `/gastos-personal/${dni}/${proyectoId}/${mes}/${anio}/editar`,
        'Editar Gasto de Personal'
      );

      this.cargarGasto(dni, proyectoId, parseInt(mes), parseInt(anio));
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

  private cargarGasto(dni: string, proyecto: string, mes: number, anio: number): void {
    this.loading = true;
    this.error = '';

    this.gastosPersonalService.getGastoPersonal(dni, proyecto, mes, anio).subscribe({
      next: (gasto) => {
        this.gasto = gasto;
        this.gastoForm.patchValue(gasto);
        this.cargarPersonal(dni);
      },
      error: (error) => {
        console.error('Error cargando gasto:', error);
        this.error = 'Error al cargar el gasto. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }

  private cargarPersonal(dni: string): void {
    this.gastosPersonalService.getPersonalById(dni).subscribe({
      next: (personal) => {
        this.personal = personal;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando datos del personal:', error);
        this.error = 'Error al cargar los datos del personal. Por favor, inténtalo de nuevo.';
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
    if (this.gastoForm.valid && this.gasto) {
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

        // Actualizar el gasto
        this.gastosPersonalService.updateGastoPersonal(
          this.gasto.dni,
          this.gasto.proyecto,
          this.gasto.mes,
          this.gasto.anio,
          gastoData
        ).subscribe({
          next: () => {
            this.successMessage = 'Gasto de personal actualizado correctamente';
            this.saving = false;
            
            // Añadir el nuevo estado a la pila de navegación
            this.navigationService.pushState(
              `/gastos-personal/${this.gasto?.dni}/${this.gasto?.proyecto}/${this.gasto?.mes}/${this.gasto?.anio}`,
              'Detalle de Gasto de Personal'
            );
            
            setTimeout(() => {
              this.router.navigate(['/gastos-personal', this.gasto?.dni, this.gasto?.proyecto, this.gasto?.mes, this.gasto?.anio]);
            }, 1500);
          },
          error: (error) => {
            console.error('Error actualizando gasto:', error);
            this.error = 'Error al actualizar el gasto. Por favor, inténtalo de nuevo.';
            this.saving = false;
          }
        });
      } catch (error) {
        console.error('Error en el proceso de actualización:', error);
        this.error = 'Error en el proceso de actualización. Por favor, inténtalo de nuevo.';
        this.saving = false;
      }
    }
  }
}
