import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services';
import { CMenor } from '../../../core/models';
import { Subscription } from 'rxjs';
import { NavigationService } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-lista-contratos-proyecto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-contratos-proyecto.component.html',
  styleUrls: ['./lista-contratos-proyecto.component.css']
})
export class ListaContratosProyectoComponent implements OnInit, OnDestroy {
  proyectoId: string = '';
  contratos: CMenor[] = [];
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
    private navigationService: NavigationService
  ) {
    this.isGestor = this.authService.isGestor();
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.proyectoId = params['proyectoId'];
      this.cargarContratos();
      this.navigationService.pushState(
        `/contratos-menores/proyecto/${this.proyectoId}`,
        'Contratos Menores'
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

  cargarContratos(): void {
    this.loading = true;
    this.error = '';

    // Cargar contratos menores asociados al proyecto usando el nombre correcto de la tabla: CMenor
    this.http.get<CMenor[]>(`${this.API_URL}/CMenor?proyecto=eq.${this.proyectoId}&order=id.asc`)
      .subscribe({
        next: (contratos) => {
          console.log('Contratos obtenidos de la API:', contratos);
          this.contratos = contratos;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando contratos menores', error);
          this.error = 'Error al cargar los contratos menores. Por favor, inténtalo de nuevo.';
          this.loading = false;
        }
      });
  }

  getEstadoBadge(estado: string): string {
    if (!estado) return 'bg-secondary';
    
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'bg-warning';
      case 'aprobado': return 'bg-success';
      case 'rechazado': return 'bg-danger';
      case 'completado': return 'bg-info';
      case 'firmado': return 'bg-success';
      case 'generado': return 'bg-info';
      default: return 'bg-secondary';
    }
  }
  
  getEstadoDocumento(contrato: CMenor): string {
    if (contrato.documento_firmado) return 'Firmado';
    if (contrato.documento_generado) return 'Generado';
    return 'Pendiente';
  }
  
  // Métodos para las acciones de los botones
  verDetalle(id: string): void {
    console.log('Navegando a detalles del contrato:', id);
    this.router.navigate(['/contratos-menores', id]);
  }
  
  editarContrato(id: string): void {
    if (!this.isGestor) {
      console.error('El usuario no tiene permisos para editar contratos');
      return;
    }
    console.log('Navegando a edición del contrato:', id);
    this.router.navigate(['/contratos-menores', id, 'editar']);
  }
  
  verFacturas(id: string): void {
    if (!this.isGestor) {
      console.error('El usuario no tiene permisos para ver facturas');
      return;
    }
    console.log('Navegando a facturas del contrato:', id);
    this.router.navigate(['/contratos-menores', id, 'facturas']);
  }
  
  // Método para crear un nuevo contrato menor
  crearNuevoContrato(): void {
    if (!this.isGestor) {
      console.error('El usuario no tiene permisos para crear contratos');
      return;
    }
    console.log('Navegando a creación de nuevo contrato para el proyecto:', this.proyectoId);
    this.router.navigate(['/contratos-menores/proyecto', this.proyectoId, 'nuevo']);
  }
}
