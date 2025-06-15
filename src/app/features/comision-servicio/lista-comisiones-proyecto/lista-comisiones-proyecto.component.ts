import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services';
import { Subscription } from 'rxjs';
import { ComisionServicioService } from '../../../core/services/comision-servicio.service';
import { NavigationService } from '../../../core/services/navigation.service';

// Interfaz simplificada para la vista de lista
interface ComisionServicioLista {
  id_comision: string;
  proyecto: string;
  nif_comisionado: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  destino: string;
  motivo_viaje: string;
  fecha_inicio: string;
  fecha_fin: string;
  gastos_generados: number;
  documento_firmado?: string;
  d_generado: boolean;
}

@Component({
  selector: 'app-lista-comisiones-proyecto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-comisiones-proyecto.component.html',
  styleUrls: ['./lista-comisiones-proyecto.component.css']
})
export class ListaComisionesProyectoComponent implements OnInit, OnDestroy {
  proyectoId: string = '';
  comisiones: ComisionServicioLista[] = [];
  loading: boolean = true;
  error: string = '';
  isGestor: boolean = false;
  private readonly API_URL = 'http://localhost:3000';
  private routeSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private comisionService: ComisionServicioService,
    private navigationService: NavigationService
  ) {
    this.isGestor = this.authService.isGestor();
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.proyectoId = params['proyectoId'];
      if (!this.proyectoId) {
        this.router.navigate(['/dashboard']);
        return;
      }
      this.cargarComisiones();
      this.navigationService.pushState(
        `/comisiones-servicio/proyecto/${this.proyectoId}`,
        'Comisiones de Servicio'
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

  cargarComisiones(): void {
    this.loading = true;
    this.error = '';

    // Cargar comisiones de servicio asociadas al proyecto
    this.http.get<any[]>(`${this.API_URL}/ComisionServicio?proyecto=eq.${this.proyectoId}`)
      .subscribe({
        next: (comisiones) => {
          console.log('Comisiones obtenidas de la API:', comisiones);
          // Transformar los datos para la vista
          this.comisiones = comisiones.map(c => ({
            id_comision: c.id_comision,
            proyecto: c.proyecto,
            nif_comisionado: c.nif_comisionado,
            nombre: c.nombre,
            apellido1: c.apellido1,
            apellido2: c.apellido2,
            destino: c.destino,
            motivo_viaje: c.motivo_viaje,
            fecha_inicio: c.fecha_inicio,
            fecha_fin: c.fecha_fin,
            gastos_generados: c.gastos_generados,
            documento_firmado: c.documento_firmado,
            d_generado: c.d_generado
          }));
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando comisiones de servicio', error);
          this.error = 'Error al cargar las comisiones de servicio. Por favor, inténtalo de nuevo.';
          this.loading = false;
        }
      });
  }

  getEstadoBadge(comision: ComisionServicioLista): string {
    if (comision.documento_firmado) return 'bg-success';
    if (comision.d_generado) return 'bg-info';
    return 'bg-warning';
  }

  getEstadoTexto(comision: ComisionServicioLista): string {
    if (comision.documento_firmado) return 'Firmada';
    if (comision.d_generado) return 'Generada';
    return 'Pendiente';
  }

  calcularDuracion(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir el día de inicio
  }
  
  // Métodos para las acciones de los botones
  verDetalle(id_comision: string): void {
    console.log('Navegando a detalles de la comisión:', id_comision);
    this.router.navigate(['/comisiones-servicio', id_comision]);
  }
  
  editarComision(id_comision: string): void {
    console.log('Navegando a edición de la comisión:', id_comision);
    this.router.navigate(['/comisiones-servicio', id_comision, 'editar']);
  }
  
  eliminarComision(id_comision: string): void {
    if (!confirm('¿Está seguro de que desea eliminar esta comisión? Esta acción no se puede deshacer.')) {
      return;
    }
    
    console.log('Eliminando comisión con ID:', id_comision);
    
    this.http.delete(`${this.API_URL}/ComisionServicio?id_comision=eq.${id_comision}`)
      .subscribe({
        next: () => {
          console.log('Comisión eliminada correctamente');
          // Filtrar la comisión eliminada de la lista local
          this.comisiones = this.comisiones.filter(c => c.id_comision !== id_comision);
          // Mostrar mensaje de éxito (podría implementarse con un servicio de notificaciones)
          alert('Comisión eliminada correctamente');
        },
        error: (error) => {
          console.error('Error eliminando comisión:', error);
          this.error = 'Error al eliminar la comisión. Por favor, inténtalo de nuevo.';
          alert('Error al eliminar la comisión');
        }
      });
  }
}
