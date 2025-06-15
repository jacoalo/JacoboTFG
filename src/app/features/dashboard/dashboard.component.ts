import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, Router } from '@angular/router';
import { AuthService, ProyectoService, NavigationService } from '../../core/services';
import { Proyecto, Usuario } from '../../core/models';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: Usuario | null = null;
  proyectos: Proyecto[] = [];
  loading: boolean = true;
  error: string = '';
  mensajeExito: string = '';
  investigadores: {[dni: string]: Usuario} = {};
  private readonly API_URL = 'http://localhost:3000'; // URL del backend

  constructor(
    private authService: AuthService,
    private proyectoService: ProyectoService,
    private router: Router,
    private http: HttpClient,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    // Limpiar la pila de navegación al entrar al dashboard
    this.navigationService.clearStack();
    this.navigationService.pushState('/dashboard', 'Dashboard');
    
    this.currentUser = this.authService.getCurrentUser();
    this.loadInvestigadores();
  }

  loadInvestigadores(): void {
    this.http.get<Usuario[]>(`${this.API_URL}/Usuario?investigador=eq.true`)
      .subscribe({
        next: (usuarios) => {
          // Crear un mapa de DNI a objeto Usuario para fácil acceso
          usuarios.forEach(user => {
            this.investigadores[user.dni] = user;
          });
          this.loadProyectos();
        },
        error: (error) => {
          console.error('Error cargando investigadores', error);
          this.error = 'Error al cargar los investigadores.';
          this.loading = false;
          // Intentamos cargar los proyectos de todos modos
          this.loadProyectos();
        }
      });
  }

  loadProyectos(): void {
    this.loading = true;
    this.error = '';
    this.mensajeExito = '';

    this.proyectoService.getProyectos()
      .subscribe({
        next: (proyectos) => {
          this.proyectos = proyectos;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar los proyectos. Por favor, inténtalo de nuevo.';
          this.loading = false;
          console.error(error);
        }
      });
  }

  eliminarProyecto(proyecto: Proyecto): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el proyecto ${proyecto.IDProyecto}?`)) {
      this.loading = true;
      this.error = '';
      
      this.proyectoService.deleteProyecto(proyecto.IDProyecto)
        .subscribe({
          next: () => {
            this.mensajeExito = `Proyecto ${proyecto.IDProyecto} eliminado correctamente`;
            this.loadProyectos(); // Recargar la lista después de eliminar
          },
          error: (error) => {
            console.error('Error eliminando proyecto', error);
            this.error = 'Error al eliminar el proyecto. Por favor, inténtalo de nuevo.';
            this.loading = false;
          }
        });
    }
  }

  getNombreInvestigador(dni: string): string {
    if (this.investigadores[dni]) {
      const inv = this.investigadores[dni];
      return `${inv.nombre} ${inv.apellido1} ${inv.apellido2 || ''}`.trim();
    }
    return dni; // Si no encontramos el investigador, mostramos el DNI
  }

  isGestor(): boolean {
    return this.authService.isGestor();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 