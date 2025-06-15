import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ProyectoService, AuthService, NavigationService } from '../../../core/services';
import { Proyecto, Usuario } from '../../../core/models';
import { HttpClient } from '@angular/common/http';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { Subscription } from 'rxjs';
import { BibliotecarioService } from '../../../core/services/bibliotecario.service';

// Interfaces necesarias para los gastos
interface ContratoMenor {
  id: string;
  proveedor: string;
  concepto: string;
  importe: number;
  fecha_firma_ip: string;
  estado: string;
  proyecto: string;
}

interface ComisionServicio {
  id_comision: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  motivo_viaje: string;
  gastos_generados: number;
  fecha_inicio: string;
  estado: string;
  proyecto: string;
}

interface GastoPersonal {
  dni: string;
  tipo_gasto: string;
  importe: number;
  mes: number;
  anio: number;
  documento?: string;
  proyecto: string;
}

interface FiltrosGasto {
  tipo: string;
  fechaDesde: string;
  fechaHasta: string;
  estado: string;
}

@Component({
  selector: 'app-gastos-proyecto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './gastos-proyecto.component.html',
  styleUrls: ['./gastos-proyecto.component.css'],
  animations: [
    // Animación para el panel de filtros
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0,
        height: '0px'
      })),
      transition('void <=> *', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class GastosProyectoComponent implements OnInit, OnDestroy {
  proyectoId: string = '';
  loading: boolean = true;
  error: string = '';
  isGestor: boolean = false;
  proyecto: Proyecto | null = null;
  investigadores: {[dni: string]: Usuario} = {};
  private routeSubscription: Subscription | null = null;
  
  // Datos de gastos
  contratos: ContratoMenor[] = [];
  comisiones: ComisionServicio[] = [];
  gastosPersonal: GastoPersonal[] = [];
  
  // Totales
  totalContratos: number = 0;
  totalComisiones: number = 0;
  totalGastosPersonal: number = 0;
  totalGastado: number = 0;
  totalDisponible: number = 0;
  porcentajeEjecutado: number = 0;
  
  mostrarFiltros: boolean = false;
  filtros: FiltrosGasto = {
    tipo: '',
    fechaDesde: '',
    fechaHasta: '',
    estado: ''
  };
  
  private readonly API_URL = 'http://localhost:3000';

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
        this.proyectoId = id;
        this.cargarInvestigadores();
        this.cargarProyecto();

        // Añadir el estado actual a la pila de navegación
        this.navigationService.pushState(
          `/proyectos/${id}/gastos`,
          'Gastos del Proyecto'
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
    this.http.get<Usuario[]>(`${this.API_URL}/Usuario?investigador=eq.true`)
      .subscribe({
        next: (usuarios) => {
          usuarios.forEach(user => {
            this.investigadores[user.dni] = user;
          });
          this.cargarProyecto();
        },
        error: (error) => {
          console.error('Error cargando investigadores', error);
          this.cargarProyecto();
        }
      });
  }

  cargarProyecto(): void {
    this.http.get<Proyecto[]>(`${this.API_URL}/Proyecto?IDProyecto=eq.${this.proyectoId}`)
      .subscribe({
        next: (proyectos) => {
          if (proyectos && proyectos.length > 0) {
            this.proyecto = proyectos[0];
            this.cargarGastos();
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

  cargarGastos(): void {
    this.loading = true;
    this.error = '';

    // Cargar contratos menores
    this.http.get<ContratoMenor[]>(`${this.API_URL}/CMenor?proyecto=eq.${this.proyectoId}`)
      .subscribe({
        next: (contratos) => {
          this.contratos = contratos;
          this.totalContratos = contratos.reduce((total, contrato) => total + contrato.importe, 0);
          this.cargarComisiones();
        },
        error: (error) => {
          console.error('Error cargando contratos', error);
          this.cargarComisiones();
        }
      });
  }

  cargarComisiones(): void {
    this.http.get<ComisionServicio[]>(`${this.API_URL}/ComisionServicio?proyecto=eq.${this.proyectoId}`)
      .subscribe({
        next: (comisiones) => {
          this.comisiones = comisiones;
          this.totalComisiones = comisiones.reduce((total, comision) => total + (comision.gastos_generados || 0), 0);
          this.cargarGastosPersonal();
        },
        error: (error) => {
          console.error('Error cargando comisiones', error);
          this.cargarGastosPersonal();
        }
      });
  }

  cargarGastosPersonal(): void {
    this.http.get<GastoPersonal[]>(`${this.API_URL}/GastosPersonal?proyecto=eq.${this.proyectoId}`)
      .subscribe({
        next: (gastos) => {
          this.gastosPersonal = gastos;
          this.totalGastosPersonal = gastos.reduce((total, gasto) => total + gasto.importe, 0);
          this.calcularEstadisticas();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando gastos de personal', error);
          this.calcularEstadisticas();
          this.loading = false;
        }
      });
  }

  calcularEstadisticas(): void {
    console.log('Contratos:', this.contratos);
    console.log('Total Contratos:', this.totalContratos);
    console.log('Comisiones:', this.comisiones);
    console.log('Total Comisiones:', this.totalComisiones);
    console.log('Gastos Personal:', this.gastosPersonal);
    console.log('Total Gastos Personal:', this.totalGastosPersonal);
    
    this.totalGastado = this.totalContratos + this.totalComisiones + this.totalGastosPersonal;
    console.log('Total Gastado:', this.totalGastado);
    
    if (this.proyecto) {
      this.totalDisponible = this.proyecto.cantidad_total - this.totalGastado;
      this.porcentajeEjecutado = this.proyecto.cantidad_total > 0 
        ? Math.round((this.totalGastado / this.proyecto.cantidad_total) * 100) 
        : 0;
      console.log('Presupuesto Total:', this.proyecto.cantidad_total);
      console.log('Total Disponible:', this.totalDisponible);
      console.log('Porcentaje Ejecutado:', this.porcentajeEjecutado);
    }
  }

  aplicarFiltros(): void {
    this.loading = true;
    
    // Aquí se implementaría el filtrado real
    // Simulamos filtrado para la demostración
    setTimeout(() => {
      // Filtro simulado
      this.loading = false;
    }, 500);
  }

  reiniciarFiltros(): void {
    this.filtros = {
      tipo: '',
      fechaDesde: '',
      fechaHasta: '',
      estado: ''
    };
  }

  exportarGastos(): void {
    if (this.gastosPersonal.length === 0) {
      alert('No hay gastos para exportar');
      return;
    }

    // Crear contenido CSV
    const headers = ['DNI', 'Tipo Gasto', 'Importe', 'Período', 'Documento'];
    const filas = this.gastosPersonal.map(gasto => {
      return [
        gasto.dni,
        gasto.tipo_gasto,
        gasto.importe.toString(),
        `${gasto.mes}/${gasto.anio}`,
        gasto.documento || 'Sin documento'
      ];
    });

    // Obtener nombre del proyecto para el nombre del archivo
    const nombreProyecto = this.proyecto ? this.proyecto.IDProyecto : 'proyecto';
    const fechaActual = new Date().toISOString().slice(0, 10);
    const nombreArchivo = `gastos_${nombreProyecto}_${fechaActual}.csv`;

    // Definir cabeceras del CSV
    const cabeceras = headers.join(',');
    
    // Combinar cabeceras y filas
    const contenidoCSV = [
      cabeceras,
      ...filas.map(fila => fila.map(valor => `"${valor}"`).join(','))
    ].join('\n');
    
    // Crear blob con el contenido CSV
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    
    // Crear elemento de descarga
    const enlace = document.createElement('a');
    
    // Crear URL para el blob
    const url = URL.createObjectURL(blob);
    
    // Configurar elemento de descarga
    enlace.href = url;
    enlace.setAttribute('download', nombreArchivo);
    enlace.style.visibility = 'hidden';
    
    // Añadir al DOM, hacer clic y limpiar
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
    
    console.log('Exportación CSV completada:', nombreArchivo);
  }

  eliminarGasto(gasto: GastoPersonal): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el gasto de ${gasto.dni}?`)) {
      // Aquí se implementaría la eliminación real
      this.gastosPersonal = this.gastosPersonal.filter(g => g.dni !== gasto.dni);
      this.calcularEstadisticas();
    }
  }

  eliminarContrato(contrato: ContratoMenor): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el contrato "${contrato.concepto}"?`)) {
      this.http.delete(`${this.API_URL}/CMenor?id=eq.${contrato.id}`)
        .subscribe({
          next: () => {
            this.contratos = this.contratos.filter(c => c.id !== contrato.id);
            this.totalContratos = this.contratos.reduce((total, c) => total + c.importe, 0);
            this.calcularEstadisticas();
          },
          error: (error) => {
            console.error('Error eliminando contrato:', error);
            this.error = 'Error al eliminar el contrato. Por favor, inténtalo de nuevo.';
          }
        });
    }
  }

  eliminarComision(comision: ComisionServicio): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la comisión "${comision.motivo_viaje}"?`)) {
      this.http.delete(`${this.API_URL}/ComisionServicio?id_comision=eq.${comision.id_comision}`)
        .subscribe({
          next: () => {
            this.comisiones = this.comisiones.filter(c => c.id_comision !== comision.id_comision);
            this.totalComisiones = this.comisiones.reduce((total, c) => total + (c.gastos_generados || 0), 0);
            this.calcularEstadisticas();
          },
          error: (error) => {
            console.error('Error eliminando comisión:', error);
            this.error = 'Error al eliminar la comisión. Por favor, inténtalo de nuevo.';
          }
        });
    }
  }

  getNombreInvestigador(dni: string): string {
    const investigador = this.investigadores[dni];
    if (investigador) {
      return `${investigador.nombre} ${investigador.apellido1} ${investigador.apellido2 || ''}`.trim();
    }
    return dni;
  }

  getBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'personal': return 'bg-primary';
      case 'material': return 'bg-success';
      case 'viaje': return 'bg-info';
      case 'contrato': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'aprobado': return 'bg-success';
      case 'pendiente': return 'bg-warning';
      case 'rechazado': return 'bg-danger';
      case 'justificado': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  descargarDocumentacion(): void {
    if (!this.proyecto) return;
    
    this.loading = true;
    this.error = '';
    
    // Usar el servicio para obtener todos los documentos del proyecto
    this.proyectoService.getDocumentosProyecto(this.proyecto.IDProyecto)
      .subscribe({
        next: (documentos) => {
          if (documentos.length > 0) {
            // Abrimos cada documento en una nueva pestaña
            documentos.forEach(doc => {
              try {
                let url: string;
    
                // Verificar si es una URL absoluta
                if (doc.id.startsWith('http://') || doc.id.startsWith('https://')) {
                  url = doc.id;
                }
                // Verificar si es una ruta relativa a archivos locales
                else if (doc.id.includes('/proyectos/')) {
                  url = doc.id.startsWith('/') 
                    ? `http://localhost:4200${doc.id}` 
                    : `http://localhost:4200/${doc.id}`;
                }
                // Si no, asumimos que es un ID del bibliotecario
                else {
                  url = this.bibliotecarioService.getUrlDescarga(doc.id, this.proyecto!.IDProyecto);
                }
    
                console.log(`Abriendo documento ${doc.tipo} con URL:`, url);
                window.open(url, '_blank');
              } catch (error) {
                console.error(`Error al generar URL para documento ${doc.id}:`, error);
              }
            });
            this.loading = false;
          } else {
            this.error = 'No hay documentación disponible para este proyecto.';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error obteniendo documentación', error);
          this.error = 'Error al obtener la documentación. Por favor, inténtalo de nuevo.';
          this.loading = false;
        }
      });
  }
}
