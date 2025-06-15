import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ProyectoService, AuthService, NavigationService } from '../../../core/services';
import { Proyecto, Usuario } from '../../../core/models';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-editar-proyecto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './editar-proyecto.component.html',
  styleUrls: ['./editar-proyecto.component.css']
})
export class EditarProyectoComponent implements OnInit, OnDestroy {
  proyectoId: string = '';
  proyecto: Proyecto | null = null;
  loading: boolean = true;
  guardando: boolean = false;
  error: string = '';
  successMessage: string = '';
  investigadores: Usuario[] = [];
  cargandoInvestigadores: boolean = true;
  private readonly API_URL = 'http://localhost:3000';
  private routeSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private proyectoService: ProyectoService,
    private authService: AuthService,
    private http: HttpClient,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.proyectoId = id;
        this.cargarProyecto();
        this.cargarInvestigadores();

        // Añadir el estado actual a la pila de navegación
        this.navigationService.pushState(
          `/proyectos/${id}/editar`,
          'Editar Proyecto'
        );
      }
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

  cargarInvestigadores(): void {
    this.cargandoInvestigadores = true;
    
    this.http.get<Usuario[]>(`${this.API_URL}/Usuario?investigador=eq.true`)
      .subscribe({
        next: (investigadores) => {
          this.investigadores = investigadores;
          this.cargandoInvestigadores = false;
          this.cargarProyecto();
        },
        error: (error) => {
          console.error('Error cargando investigadores', error);
          this.error = 'Error al cargar investigadores. Por favor, inténtalo de nuevo.';
          this.cargandoInvestigadores = false;
          this.cargarProyecto(); // Intentamos cargar el proyecto de todos modos
        }
      });
  }

  cargarProyecto(): void {
    this.loading = true;
    this.error = '';

    // Obtenemos los datos reales del proyecto
    this.http.get<Proyecto[]>(`${this.API_URL}/Proyecto?IDProyecto=eq.${this.proyectoId}`)
      .subscribe({
        next: (proyectos) => {
          if (proyectos && proyectos.length > 0) {
            this.proyecto = proyectos[0];
            console.log('Proyecto cargado:', this.proyecto);
            this.loading = false;
          } else {
            this.error = 'No se encontró el proyecto solicitado.';
            this.crearProyectoVacio();
          }
        },
        error: (error) => {
          console.error('Error cargando proyecto', error);
          this.error = 'Error al cargar el proyecto. Por favor, inténtalo de nuevo.';
          this.crearProyectoVacio();
        }
      });
  }

  crearProyectoVacio(): void {
    // En caso de error, creamos un proyecto vacío para poder editar
    this.proyecto = {
      IDProyecto: this.proyectoId,
      ip: '',
      finalidad: '',
      cantidad_total: 0,
      a2024: 0,
      a2025: 0,
      a2026: 0,
      a2027: 0,
      a2028: 0,
      icu: '',
      cuenta_interna: ''
    };
    this.loading = false;
  }

  actualizarTotal(): void {
    if (this.proyecto) {
      this.proyecto.cantidad_total = 
        this.proyecto.a2024 + 
        this.proyecto.a2025 + 
        this.proyecto.a2026 + 
        this.proyecto.a2027 + 
        this.proyecto.a2028;
    }
  }

  guardarCambios(): void {
    if (!this.proyecto) return;
    
    this.guardando = true;
    this.error = '';
    this.successMessage = '';
    
    // En una implementación real, se debe usar el servicio
    this.proyectoService.updateProyecto(this.proyectoId, this.proyecto)
      .subscribe({
        next: () => {
          this.successMessage = 'Proyecto actualizado correctamente';
          this.guardando = false;
          
          // Redirigir después de unos segundos
          setTimeout(() => {
            this.router.navigate(['/proyectos', this.proyectoId]);
          }, 2000);
        },
        error: (error) => {
          console.error('Error actualizando proyecto', error);
          this.error = 'Error al actualizar el proyecto. Por favor, inténtalo de nuevo.';
          this.guardando = false;
        }
      });
  }
}
