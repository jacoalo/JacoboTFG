import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProyectoService, AuthService, NavigationService } from '../../../core/services';
import { Proyecto, Usuario } from '../../../core/models';
import { fadeAnimation, listAnimation, slideInOutAnimation } from '../../../shared/animations';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-crear-proyecto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crear-proyecto.component.html',
  styleUrls: ['./crear-proyecto.component.scss'],
  animations: [fadeAnimation, listAnimation, slideInOutAnimation]
})
export class CrearProyectoComponent implements OnInit, OnDestroy {
  proyecto: Proyecto = {
    IDProyecto: '',
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
  
  investigadores: Usuario[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  cargandoInvestigadores: boolean = true;
  private readonly API_URL = 'http://localhost:3000'; // URL del backend
  private routeSubscription: Subscription | null = null;

  constructor(
    private proyectoService: ProyectoService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.cargarInvestigadores();
    
    // Añadir el estado actual a la pila de navegación
    this.navigationService.pushState(
      '/proyectos/nuevo',
      'Crear Proyecto'
    );
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
    
    // Cargar usuarios investigadores desde la API
    this.http.get<Usuario[]>(`${this.API_URL}/Usuario?investigador=eq.true`)
      .subscribe({
        next: (investigadores) => {
          this.investigadores = investigadores;
          this.cargandoInvestigadores = false;
        },
        error: (error) => {
          console.error('Error cargando investigadores', error);
          this.errorMessage = 'Error al cargar investigadores. Por favor, inténtalo de nuevo.';
          this.cargandoInvestigadores = false;
        }
      });
  }

  crearProyecto(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Usar el servicio real para crear el proyecto
    this.proyectoService.createProyecto(this.proyecto)
      .subscribe({
        next: (proyectoCreado) => {
          this.successMessage = 'Proyecto creado correctamente.';
          this.loading = false;
          
          // Redirigimos al dashboard después de unos segundos
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error creando proyecto', error);
          this.errorMessage = 'Error al crear el proyecto. Por favor, inténtalo de nuevo.';
          this.loading = false;
        }
      });
  }

  actualizarTotal(): void {
    this.proyecto.cantidad_total = 
      this.proyecto.a2024 + 
      this.proyecto.a2025 + 
      this.proyecto.a2026 + 
      this.proyecto.a2027 + 
      this.proyecto.a2028;
  }

  private validarFormulario(): boolean {
    if (!this.proyecto.IDProyecto || !this.proyecto.finalidad || !this.proyecto.ip) {
      this.errorMessage = 'Por favor, complete todos los campos obligatorios.';
      return false;
    }

    if (this.proyecto.cantidad_total <= 0) {
      this.errorMessage = 'El importe total debe ser mayor que 0.';
      return false;
    }

    return true;
  }
}
