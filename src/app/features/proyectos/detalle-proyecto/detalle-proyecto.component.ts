import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ProyectoService, AuthService, NavigationService, BibliotecarioService } from '../../../core/services';
import { Proyecto, Usuario } from '../../../core/models';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detalle-proyecto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-proyecto.component.html',
  styleUrls: ['./detalle-proyecto.component.css']
})
export class DetalleProyectoComponent implements OnInit, OnDestroy {
  proyecto: Proyecto | null = null;
  loading: boolean = true;
  error: string = '';
  isGestor: boolean = false;
  investigador: Usuario | null = null;
  private readonly API_URL = 'http://localhost:3000';
  private routeSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private proyectoService: ProyectoService,
    private authService: AuthService,
    private http: HttpClient,
    private navigationService: NavigationService,
    private bibliotecarioService: BibliotecarioService
  ) {
    this.isGestor = this.authService.isGestor();
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.cargarProyecto(id);
      }

      // Añadir el estado actual a la pila de navegación
      this.navigationService.pushState(
        `/proyectos/${id}`,
        'Detalle del Proyecto'
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

  cargarProyecto(id: string): void {
    this.loading = true;
    this.error = '';

    // Obtenemos los datos reales del proyecto
    this.http.get<Proyecto[]>(`${this.API_URL}/Proyecto?IDProyecto=eq.${id}`)
      .subscribe({
        next: (proyectos) => {
          if (proyectos && proyectos.length > 0) {
            this.proyecto = proyectos[0];
            // Cargar los datos del investigador
            if (this.proyecto) {
              this.cargarInvestigador(this.proyecto.ip);
            } else {
              this.loading = false;
            }
          } else {
            this.error = 'No se encontró el proyecto solicitado.';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error cargando proyecto', error);
          this.error = 'Error al cargar el proyecto. Por favor, inténtalo de nuevo.';
          this.loading = false;
        }
      });
  }

  cargarInvestigador(dni: string): void {
    this.http.get<Usuario[]>(`${this.API_URL}/Usuario?dni=eq.${dni}`)
      .subscribe({
        next: (usuarios) => {
          if (usuarios && usuarios.length > 0) {
            this.investigador = usuarios[0];
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando investigador', error);
          this.loading = false;
        }
      });
  }

  getNombreCompletoInvestigador(): string {
    if (this.investigador) {
      return `${this.investigador.nombre || ''} ${this.investigador.apellido1 || ''} ${this.investigador.apellido2 || ''}`.trim();
    }
    
    // Si no tenemos el investigador cargado, intentamos cargarlo nuevamente
    if (this.proyecto && this.proyecto.ip) {
      this.cargarInvestigador(this.proyecto.ip);
      return `Cargando datos del investigador ${this.proyecto.ip}...`;
    }
    
    return 'No disponible';
  }

  descargarDocumentacion(): void {
    if (!this.proyecto) return;
    
    this.loading = true;
    this.error = '';

    try {
      // Obtenemos la URL para descargar todos los documentos del proyecto en formato ZIP
      const url = this.bibliotecarioService.getUrlDescargaProyectoCompleto(this.proyecto.IDProyecto);
      
      // Abrimos la URL en una nueva pestaña para iniciar la descarga
      window.open(url, '_blank');
      
      this.loading = false;
    } catch (error) {
      console.error('Error al descargar la documentación:', error);
      this.error = 'Error al descargar la documentación. Por favor, inténtalo de nuevo.';
      this.loading = false;
    }
  }
}
