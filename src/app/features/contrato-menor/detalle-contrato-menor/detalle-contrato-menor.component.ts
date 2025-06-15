import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, BibliotecarioService, ContratoMenorService } from '../../../core/services';
import { CMenor, Necesidad } from '../../../core/models';
import { DocumentoResponse } from '../../../core/services/bibliotecario.service';
import { Subscription } from 'rxjs';
import { NavigationService } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-detalle-contrato-menor',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-contrato-menor.component.html',
  styleUrls: ['./detalle-contrato-menor.component.css']
})
export class DetalleContratoMenorComponent implements OnInit, OnDestroy {
  contrato: CMenor | null = null;
  necesidad: Necesidad | null = null;
  contratoId: string = '';
  loading: boolean = true;
  error: string = '';
  isGestor: boolean = false;
  private readonly API_URL = 'http://localhost:3000';
  private routeSubscription: Subscription | null = null;
  
  // Variables para manejo de documentos
  documentoPresupuesto: File | null = null;
  documentoFirmado: File | null = null;
  cargandoDocumento: boolean = false;
  generandoPDF: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private contratoMenorService: ContratoMenorService,
    private bibliotecarioService: BibliotecarioService,
    private navigationService: NavigationService
  ) {
    this.isGestor = this.authService.isGestor();
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.contratoId = params['id'];
      this.cargarContrato();
      this.navigationService.pushState(
        `/contratos-menores/${this.contratoId}`,
        'Detalle Contrato Menor'
      );
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  cargarContrato(): void {
    this.loading = true;
    this.error = '';

    // Cargar el contrato menor específico
    this.http.get<CMenor[]>(`${this.API_URL}/CMenor?id=eq.${this.contratoId}`)
      .subscribe({
        next: (contratos) => {
          if (contratos && contratos.length > 0) {
            this.contrato = contratos[0];
            // Una vez que tenemos el contrato, cargamos la necesidad asociada
            this.cargarNecesidad(this.contrato.necesidad);
          } else {
            this.error = 'No se encontró el contrato solicitado';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error cargando el contrato menor', error);
          this.error = 'Error al cargar el contrato menor. Por favor, inténtalo de nuevo.';
          this.loading = false;
        }
      });
  }

  cargarNecesidad(idNecesidad: number): void {
    this.http.get<Necesidad[]>(`${this.API_URL}/necesidad?id=eq.${idNecesidad}`)
      .subscribe({
        next: (necesidades) => {
          if (necesidades && necesidades.length > 0) {
            this.necesidad = necesidades[0];
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando la necesidad', error);
          // No establecemos error para no sobreescribir el mensaje principal
          this.loading = false;
        }
      });
  }

  getEstadoDocumento(): string {
    if (!this.contrato) return 'Pendiente';
    if (this.contrato.documento_firmado) return 'Firmado';
    if (this.contrato.documento_generado) return 'Generado';
    return 'Pendiente';
  }

  volverALista(): void {
    this.navigationService.volver();
  }

  editarContrato(): void {
    if (!this.isGestor) {
      console.error('No tienes permisos para editar este contrato');
      return;
    }
    this.router.navigate(['/contratos-menores', this.contratoId, 'editar']);
  }

  verArticulos(): void {
    this.router.navigate(['/contratos-menores', this.contratoId, 'articulos']);
  }

  verFacturas(): void {
    this.router.navigate(['/contratos-menores', this.contratoId, 'facturas']);
  }

  // Métodos para manejo de documentos
  onDocumentoPresupuestoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.documentoPresupuesto = input.files[0];
    }
  }

  onDocumentoFirmadoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.documentoFirmado = input.files[0];
    }
  }

  subirDocumentoPresupuesto(): void {
    if (!this.documentoPresupuesto || !this.contrato || !this.contrato.proyecto) {
      this.error = 'Error: No se ha seleccionado un documento o no hay proyecto asociado.';
      return;
    }

    this.cargandoDocumento = true;
    
    // Subimos el documento al bibliotecario
    this.bibliotecarioService.subirDocumento(this.documentoPresupuesto, this.contrato.proyecto)
      .subscribe({
        next: (response: DocumentoResponse) => {
          // Actualizamos el contrato con la referencia al nuevo documento
          this.contratoMenorService.updateContratoMenor(this.contratoId, { presupuesto: response.id })
            .subscribe({
              next: () => {
                // Actualizamos el contrato en la UI
                if (this.contrato) {
                  this.contrato.presupuesto = response.id;
                }
                this.cargandoDocumento = false;
                this.documentoPresupuesto = null;
                // Resetear el input file
                const input = document.getElementById('presupuesto') as HTMLInputElement;
                if (input) {
                  input.value = '';
                }
              },
              error: (error) => {
                console.error('Error actualizando contrato con presupuesto', error);
                this.error = 'Error al actualizar el contrato con la referencia al presupuesto.';
                this.cargandoDocumento = false;
              }
            });
        },
        error: (error) => {
          console.error('Error subiendo documento de presupuesto', error);
          this.error = 'Error al subir el documento de presupuesto.';
          this.cargandoDocumento = false;
        }
      });
  }

  subirDocumentoFirmado(): void {
    if (!this.documentoFirmado || !this.contrato || !this.contrato.proyecto) {
      this.error = 'Error: No se ha seleccionado un documento o no hay proyecto asociado.';
      return;
    }

    this.cargandoDocumento = true;
    
    // Subimos el documento al bibliotecario
    this.bibliotecarioService.subirDocumento(this.documentoFirmado, this.contrato.proyecto)
      .subscribe({
        next: (response: DocumentoResponse) => {
          // Actualizamos el contrato con la referencia al nuevo documento
          this.contratoMenorService.updateContratoMenor(this.contratoId, { 
            documento_firmado: response.id,
            documento_generado: true // Marcamos como generado también
          })
            .subscribe({
              next: () => {
                // Actualizamos el contrato en la UI
                if (this.contrato) {
                  this.contrato.documento_firmado = response.id;
                  this.contrato.documento_generado = true;
                }
                this.cargandoDocumento = false;
                this.documentoFirmado = null;
                // Resetear el input file
                const input = document.getElementById('documento_firmado') as HTMLInputElement;
                if (input) {
                  input.value = '';
                }
              },
              error: (error) => {
                console.error('Error actualizando contrato con documento firmado', error);
                this.error = 'Error al actualizar el contrato con la referencia al documento firmado.';
                this.cargandoDocumento = false;
              }
            });
        },
        error: (error) => {
          console.error('Error subiendo documento firmado', error);
          this.error = 'Error al subir el documento firmado.';
          this.cargandoDocumento = false;
        }
      });
  }

  abrirDocumento(idDocumento: string): void {
    if (!idDocumento || !this.contrato || !this.contrato.proyecto) {
      this.error = 'Error: No se puede abrir el documento porque no se encontró su identificador o no hay proyecto asociado.';
      return;
    }
    
    const url = this.bibliotecarioService.getUrlDescarga(idDocumento, this.contrato.proyecto);
    window.open(url, '_blank');
  }

  generarPDF(): void {
    if (!this.contratoId) {
      this.error = 'Error: No se pudo identificar el contrato para generar el PDF.';
      return;
    }
    
    this.generandoPDF = true;
    this.error = '';
    
    this.contratoMenorService.generarPDFContratoMenor(this.contratoId)
      .subscribe({
        next: (pdfBlob: Blob) => {
          // Crear URL para el blob
          const url = window.URL.createObjectURL(pdfBlob);
          
          // Crear un enlace temporal
          const a = document.createElement('a');
          a.href = url;
          a.download = `contrato_menor_${this.contratoId}.pdf`;
          document.body.appendChild(a);
          
          // Simular un clic en el enlace
          a.click();
          
          // Limpieza
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          // Actualizamos el contrato como generado
          if (this.contrato && !this.contrato.documento_generado) {
            this.contratoMenorService.updateContratoMenor(this.contratoId, { documento_generado: true })
              .subscribe({
                next: () => {
                  if (this.contrato) {
                    this.contrato.documento_generado = true;
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
