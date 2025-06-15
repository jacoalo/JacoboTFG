import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GastosPersonalService, NavigationService, BibliotecarioService } from '../../../core/services';
import { GastosPersonal, Personal } from '../../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detalle-gasto-personal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-gasto-personal.component.html',
  styleUrls: ['./detalle-gasto-personal.component.css']
})
export class DetalleGastoPersonalComponent implements OnInit, OnDestroy {
  gasto: GastosPersonal | null = null;
  personal: Personal | null = null;
  loading: boolean = true;
  error: string = '';
  private routeSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gastosPersonalService: GastosPersonalService,
    private navigationService: NavigationService,
    private bibliotecarioService: BibliotecarioService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      const { dni, proyectoId, mes, anio } = params;
      
      // Añadir el estado actual a la pila de navegación
      this.navigationService.pushState(
        `/gastos-personal/${dni}/${proyectoId}/${mes}/${anio}`,
        'Detalle de Gasto de Personal'
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

  getMesNombre(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1];
  }

  getDocumentoUrl(documentoId: string): string {
    return this.bibliotecarioService.getUrlDescarga(documentoId, this.gasto?.proyecto || '');
  }
}
