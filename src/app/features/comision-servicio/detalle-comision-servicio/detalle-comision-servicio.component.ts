import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ComisionServicio } from '../../../core/models';
import { BibliotecarioService } from '../../../core/services/bibliotecario.service';
import { Subscription } from 'rxjs';
import { NavigationService } from '../../../core/services/navigation.service';
import { ComisionServicioService } from '../../../core/services/comision-servicio.service';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-detalle-comision-servicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-comision-servicio.component.html',
  styleUrls: ['./detalle-comision-servicio.component.css']
})
export class DetalleComisionServicioComponent implements OnInit, OnDestroy {
  comisionId: string = '';
  comision: ComisionServicio | null = null;
  loading: boolean = true;
  error: string = '';
  private routeSubscription: Subscription | null = null;
  generandoPDF: boolean = false;
  isGestor: boolean = false;

  private readonly API_URL = 'http://localhost:3000';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private bibliotecarioService: BibliotecarioService,
    private comisionServicioService: ComisionServicioService,
    private authService: AuthService,
    private navigationService: NavigationService
  ) {
    this.isGestor = this.authService.isGestor();
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.comisionId = id;
        this.cargarComision();

        // Añadir el estado actual a la pila de navegación
        this.navigationService.pushState(`/comisiones-servicio/${id}`, 'Detalle Comisión de Servicio');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  probarURLDocumento(idDocumento: string, proyectoId: string): string | null {
    if (!idDocumento || !proyectoId) {
      console.error('Faltan datos necesarios para probar URL');
      return null;
    }

    try {
      // Probar URL directa del API bibliotecario
      const urlAPI = `http://localhost:3001/api/documentos/descargar/${idDocumento}?proyecto=${proyectoId}`;
      console.log('URL directa bibliotecario:', urlAPI);
      
      // Probar URL a través del servicio
      const urlServicio = this.bibliotecarioService.getUrlDescarga(idDocumento, proyectoId);
      console.log('URL a través del servicio:', urlServicio);
      
      // Verificar si son idénticas
      console.log('¿URLs coinciden?', urlAPI === urlServicio);
      
      return urlServicio;
    } catch (error) {
      console.error('Error generando URLs de prueba:', error);
      return null;
    }
  }

  cargarComision(): void {
    this.loading = true;
    this.error = '';
    this.comision = null; // Resetear comisión para evitar mostrar datos antiguos

    console.log('Cargando comisión con ID:', this.comisionId);
    
    // Cargar datos de la comisión
    this.http.get<ComisionServicio[]>(`${this.API_URL}/ComisionServicio?id_comision=eq.${this.comisionId}`)
      .subscribe({
        next: (comisiones) => {
          console.log('Comisión obtenida de la API:', comisiones);
          if (comisiones && comisiones.length > 0) {
            this.comision = comisiones[0];
            
            // Depurar información de documentos
            console.log('Información de documentos en la comisión:');
            console.log('- Proyecto:', this.comision.proyecto);
            
            // Analizar formato de documentos
            if (this.comision.documento_firmado) {
              console.log('- Documento firmado:', this.comision.documento_firmado);
              console.log('  Es URL completa:', this.comision.documento_firmado.startsWith('http'));
            } else {
              console.log('- No hay documento firmado');
            }
            
            if (this.comision.documentacion_gastos) {
              console.log('- Documentación gastos:', this.comision.documentacion_gastos);
              console.log('  Es URL completa:', this.comision.documentacion_gastos.startsWith('http'));
            } else {
              console.log('- No hay documentación de gastos');
            }
            
            if (this.comision.documento_jp) {
              console.log('- Documento JP:', this.comision.documento_jp);
              console.log('  Es URL completa:', this.comision.documento_jp.startsWith('http'));
            } else {
              console.log('- No hay documento JP');
            }
          } else {
            this.error = 'No se encontró la comisión solicitada.';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando comisión de servicio', error);
          this.error = 'Error al cargar la comisión de servicio. Por favor, inténtalo de nuevo.';
          this.loading = false;
        }
      });
  }

  volverALista(): void {
    this.navigationService.volver();
  }

  abrirDocumento(idDocumento: string): void {
    if (!idDocumento) {
      console.error('Error: No se proporcionó un ID de documento válido');
      this.error = 'Error: No se pudo abrir el documento. ID de documento no válido.';
      return;
    }
    
    console.log('Documento a abrir:', idDocumento);
    
    // Verificar si es una URL absoluta (comienza con http o https)
    if (idDocumento.startsWith('http://') || idDocumento.startsWith('https://')) {
      console.log('Es una URL completa, abriendo directamente:', idDocumento);
      window.open(idDocumento, '_blank');
      return;
    }
    
    // Verificar si es una ruta relativa que apunta a archivos locales del servidor
    if (idDocumento.includes('/proyectos/')) {
      console.log('Es una ruta relativa a un archivo local:', idDocumento);
      // Si es una ruta relativa sin el http, añadimos la base
      const urlCompleta = idDocumento.startsWith('/') 
        ? `http://localhost:4200${idDocumento}` 
        : `http://localhost:4200/${idDocumento}`;
      console.log('URL completa generada:', urlCompleta);
      window.open(urlCompleta, '_blank');
      return;
    }
    
    // Si llegamos aquí, asumimos que es un ID para el bibliotecario
    if (!this.comision || !this.comision.proyecto) {
      console.error('Error: No hay proyecto asociado a la comisión');
      this.error = 'Error: No se pudo abrir el documento. No hay proyecto asociado.';
      return;
    }
    
    const proyectoId = this.comision.proyecto;
    console.log('Usando bibliotecario para documento con ID:', idDocumento);
    console.log('Proyecto:', proyectoId);
    
    try {
      const url = this.bibliotecarioService.getUrlDescarga(idDocumento, proyectoId);
      console.log('URL de bibliotecario generada:', url);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error al generar URL de descarga:', error);
      this.error = 'Error: No se pudo generar la URL para descargar el documento.';
    }
  }

  editarComision(): void {
    if (!this.comisionId) {
      this.error = 'No se pudo identificar la comisión para editar.';
      return;
    }
    
    this.router.navigate(['/comisiones-servicio', this.comisionId, 'editar']);
  }

  generarPDF(): void {
    if (!this.comisionId) {
      this.error = 'No se pudo identificar la comisión para generar el PDF.';
      return;
    }
    
    this.generandoPDF = true;
    this.error = '';
    
    this.comisionServicioService.generarPDFComisionServicio(this.comisionId)
      .subscribe({
        next: (pdfBlob: Blob) => {
          // Crear URL para el blob
          const url = window.URL.createObjectURL(pdfBlob);
          
          // Crear un enlace temporal
          const a = document.createElement('a');
          a.href = url;
          a.download = `comision_servicio_${this.comisionId}.pdf`;
          document.body.appendChild(a);
          
          // Simular un clic en el enlace
          a.click();
          
          // Limpieza
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          // Actualizamos la comisión como generada
          if (this.comision && !this.comision.d_generado) {
            this.comisionServicioService.updateComisionServicio(this.comisionId, { d_generado: true })
              .subscribe({
                next: () => {
                  if (this.comision) {
                    this.comision.d_generado = true;
                  }
                },
                error: (error) => {
                  console.error('Error actualizando estado de documento generado', error);
                }
              });
          }
          
          this.generandoPDF = false;
        },
        error: (error) => {
          console.error('Error generando PDF', error);
          this.error = 'Error al generar el PDF. Por favor, inténtalo de nuevo.';
          this.generandoPDF = false;
        }
      });
  }
}
