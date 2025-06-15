import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { GastosPersonalService, ProyectoService, AuthService, NavigationService, BibliotecarioService } from '../../../core/services';
import { GastosPersonal, Proyecto, Personal } from '../../../core/models';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-gastos-personal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-gastos-personal.component.html',
  styleUrls: ['./lista-gastos-personal.component.css']
})
export class ListaGastosPersonalComponent implements OnInit, OnDestroy {
  gastos: GastosPersonal[] = [];
  personal: Map<string, Personal> = new Map();
  proyecto: Proyecto | null = null;
  loading: boolean = true;
  loadingProyecto: boolean = true;
  error: string = '';
  isGestor: boolean = false;
  proyectoId: string = '';
  private readonly API_URL = 'http://localhost:3000';
  private routeSubscription: Subscription | null = null;

  constructor(
    private gastosPersonalService: GastosPersonalService,
    private proyectoService: ProyectoService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private navigationService: NavigationService,
    private bibliotecarioService: BibliotecarioService
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

      this.cargarProyecto();
      this.cargarGastosPersonal();

      // Añadir el estado actual a la pila de navegación
      this.navigationService.pushState(
        `/gastos-personal/proyecto/${this.proyectoId}`,
        'Gastos de Personal'
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

  cargarProyecto(): void {
    this.loadingProyecto = true;

    this.http.get<Proyecto[]>(`${this.API_URL}/Proyecto?IDProyecto=eq.${this.proyectoId}`)
      .subscribe({
        next: (proyectos) => {
          if (proyectos && proyectos.length > 0) {
            this.proyecto = proyectos[0];
          } else {
            this.error = 'No se encontró el proyecto solicitado.';
          }
          this.loadingProyecto = false;
        },
        error: (error) => {
          console.error('Error cargando proyecto', error);
          this.error = 'Error al cargar el proyecto. Por favor, inténtalo de nuevo.';
          this.loadingProyecto = false;
        }
      });
  }

  cargarGastosPersonal(): void {
    this.loading = true;
    this.error = '';

    this.gastosPersonalService.getGastosPersonal(this.proyectoId).subscribe({
      next: (gastos) => {
        this.gastos = gastos;
        // Cargar datos del personal para cada gasto
        this.cargarDatosPersonal();
      },
      error: (error) => {
        console.error('Error cargando gastos de personal', error);
        this.error = 'Error al cargar los gastos de personal. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }

  cargarDatosPersonal(): void {
    // Obtener DNIs únicos de los gastos
    const dnis = [...new Set(this.gastos.map(gasto => gasto.dni))];
    
    // Cargar datos de cada persona
    const cargas = dnis.map(dni => 
      this.gastosPersonalService.getPersonalById(dni).subscribe({
        next: (persona) => {
          this.personal.set(dni, persona);
        },
        error: (error) => {
          console.error(`Error cargando datos de personal con DNI ${dni}:`, error);
        }
      })
    );

    // Cuando todas las cargas terminen
    Promise.all(cargas).then(() => {
      this.loading = false;
    });
  }

  getNombreCompleto(dni: string): string {
    const persona = this.personal.get(dni);
    if (persona) {
      return `${persona.nombre} ${persona.apellido1} ${persona.apellido2 || ''}`;
    }
    return dni;
  }

  getMesNombre(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1];
  }

  eliminarGasto(gasto: GastosPersonal): void {
    if (confirm('¿Está seguro de que desea eliminar este gasto?')) {
      this.http.delete(`${this.API_URL}/GastosPersonal?dni=eq.${gasto.dni}&proyecto=eq.${gasto.proyecto}&mes=eq.${gasto.mes}&anio=eq.${gasto.anio}`)
        .subscribe({
          next: () => {
            this.cargarGastosPersonal();
          },
          error: (error) => {
            console.error('Error eliminando gasto:', error);
            this.error = 'Error al eliminar el gasto. Por favor, inténtalo de nuevo.';
          }
        });
    }
  }

  getDocumentoUrl(documentoId: string): string {
    return this.bibliotecarioService.getUrlDescarga(documentoId, this.proyectoId);
  }
}
