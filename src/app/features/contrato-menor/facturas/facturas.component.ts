import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services';
import { BibliotecarioService, DocumentoResponse } from '../../../core/services/bibliotecario.service';
import { Factura, CMenor, Articulo } from '../../../core/models';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationService } from '../../../core/services/navigation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent implements OnInit, OnDestroy {
  contratoId: string = '';
  contrato: CMenor | null = null;
  facturas: Factura[] = [];
  loading: boolean = true;
  loadingContrato: boolean = true;
  submitting: boolean = false;
  error: string = '';
  successMessage: string = '';
  isGestor: boolean = false;
  showFormNueva: boolean = false;
  showFormEditar: boolean = false;
  facturaForm: FormGroup;
  facturaEditando: Factura | null = null;
  
  // Nueva propiedad para resaltar la factura específica
  facturaResaltadaId: string | null = null;
  
  // Nuevas propiedades para los artículos
  articulosPorFactura: Map<string, Articulo[]> = new Map();
  expandedFactura: string | null = null;
  loadingArticulos: boolean = false;
  
  // Variables para los archivos
  documentoFactura: File | null = null;
  documentoJustificante: File | null = null;
  cargandoDocumentoF: boolean = false;
  cargandoDocumentoJP: boolean = false;
  
  private readonly API_URL = 'http://localhost:3000';
  private routeSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private fb: FormBuilder,
    private bibliotecarioService: BibliotecarioService,
    private navigationService: NavigationService
  ) {
    this.isGestor = this.authService.isGestor();
    
    // Inicializar formulario
    this.facturaForm = this.fb.group({
      IdFactura: ['', Validators.required],
      descripcion: ['', Validators.required],
      fecha_emision: ['', Validators.required],
      fecha_pago: [''],
      documentoF: [''],
      documentoJP: [''],
      id_cm: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.contratoId = id;
    
    // Obtener la factura a resaltar de los query params
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['factura']) {
      this.facturaResaltadaId = queryParams['factura'];
    }
    
    this.cargarContrato();
    this.cargarFacturas();

    // Añadir el estado actual a la pila de navegación
    this.navigationService.pushState(
      `/contratos-menores/${this.contratoId}/facturas`,
      'Facturas del Contrato Menor'
    );
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  cargarContrato(): void {
    this.loadingContrato = true;

    this.http.get<CMenor[]>(`${this.API_URL}/CMenor?id=eq.${this.contratoId}`)
      .subscribe({
        next: (contratos) => {
          if (contratos && contratos.length > 0) {
            this.contrato = contratos[0];
          }
          this.loadingContrato = false;
        },
        error: (error) => {
          console.error('Error cargando el contrato menor', error);
          this.loadingContrato = false;
        }
      });
  }

  cargarFacturas(): void {
    this.loading = true;
    this.error = '';
    // Limpiar los artículos cargados previamente
    this.articulosPorFactura.clear();
    this.expandedFactura = null;

    // Consultar directamente las facturas asociadas al contrato menor
    this.http.get<Factura[]>(`${this.API_URL}/Factura?id_cm=eq.${this.contratoId}`)
      .subscribe({
        next: (facturas) => {
          this.facturas = facturas;
          this.loading = false;
          // Hacer scroll a la factura resaltada si existe
          this.scrollToHighlightedFactura();
        },
        error: (error) => {
          console.error('Error cargando facturas directamente', error);
          
          // Plan B: Si no hay resultados, intentar cargar a través de artículos
          // como método de respaldo para mantener compatibilidad con datos antiguos
          this.cargarFacturasPorArticulos();
        }
      });
  }

  // Método alternativo para cargar facturas a través de artículos (método antiguo)
  cargarFacturasPorArticulos(): void {
    // Primero cargamos los artículos para obtener sus facturas asociadas
    this.http.get<any[]>(`${this.API_URL}/Articulo?id_cm=eq.${this.contratoId}`)
      .subscribe({
        next: (articulos) => {
          if (articulos && articulos.length > 0) {
            // Extraemos los IDs de facturas únicos
            const idsFacturas = [...new Set(articulos
              .filter(a => a.id_factura)
              .map(a => a.id_factura))];
            
            if (idsFacturas.length > 0) {
              // Construimos condición OR para múltiples facturas
              const facturaCondition = idsFacturas.map(id => `IdFactura=eq.${id}`).join(',');
              
              // Cargamos las facturas
              this.http.get<Factura[]>(`${this.API_URL}/Factura?${facturaCondition}`)
                .subscribe({
                  next: (facturas) => {
                    this.facturas = facturas;
                    this.loading = false;
                    // Hacer scroll a la factura resaltada si existe
                    this.scrollToHighlightedFactura();
                  },
                  error: (error) => {
                    console.error('Error cargando facturas por artículos', error);
                    this.error = 'Error al cargar las facturas';
                    this.loading = false;
                  }
                });
            } else {
              // No hay facturas asociadas
              this.facturas = [];
              this.loading = false;
            }
          } else {
            // No hay artículos
            this.facturas = [];
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error cargando artículos', error);
          this.error = 'Error al cargar los artículos asociados';
          this.loading = false;
        }
      });
  }

  verDetalle(idFactura: string): void {
    // En lugar de mostrar un alert, expandimos o colapsamos la sección de artículos
    if (this.expandedFactura === idFactura) {
      this.expandedFactura = null;
    } else {
      this.expandedFactura = idFactura;
      this.cargarArticulosDeFactura(idFactura);
    }
  }

  // Método para cargar los artículos de una factura específica
  cargarArticulosDeFactura(idFactura: string): void {
    // Si ya tenemos los artículos cargados, no los volvemos a cargar
    if (this.articulosPorFactura.has(idFactura)) {
      return;
    }
    
    this.loadingArticulos = true;
    
    this.http.get<Articulo[]>(`${this.API_URL}/Articulo?id_factura=eq.${idFactura}`)
      .subscribe({
        next: (articulos) => {
          this.articulosPorFactura.set(idFactura, articulos);
          this.loadingArticulos = false;
        },
        error: (error) => {
          console.error(`Error cargando artículos para la factura ${idFactura}`, error);
          this.loadingArticulos = false;
          // Inicializamos con un array vacío para evitar intentos repetidos de carga fallida
          this.articulosPorFactura.set(idFactura, []);
        }
      });
  }

  // Método para calcular el total de los artículos de una factura
  calcularTotalArticulos(articulos: Articulo[]): number {
    return articulos.reduce((total, articulo) => total + (articulo.cantidad * articulo.precio), 0);
  }

  iniciarEditarFactura(idFactura: string): void {
    if (!this.isGestor) {
      console.error('No tienes permisos para editar facturas');
      return;
    }

    const factura = this.facturas.find(f => f.IdFactura === idFactura);
    if (!factura) {
      this.error = 'No se encontró la factura especificada';
      return;
    }

    this.facturaEditando = factura;
    
    // Formatear fechas para el input date
    const fechaEmision = factura.fecha_emision ? new Date(factura.fecha_emision).toISOString().split('T')[0] : '';
    const fechaPago = factura.fecha_pago ? new Date(factura.fecha_pago).toISOString().split('T')[0] : '';
    
    this.facturaForm.setValue({
      IdFactura: factura.IdFactura,
      descripcion: factura.descripcion || '',
      fecha_emision: fechaEmision,
      fecha_pago: fechaPago,
      documentoF: factura.documentoF || '',
      documentoJP: factura.documentoJP || '',
      id_cm: this.contratoId
    });

    this.showFormEditar = true;
    this.showFormNueva = false;
  }

  cancelarEdicion(): void {
    this.showFormEditar = false;
    this.showFormNueva = false;
    this.facturaEditando = null;
    this.facturaForm.reset();
    this.error = '';
    this.successMessage = '';
    this.documentoFactura = null;
    this.documentoJustificante = null;
  }

  onDocumentoFacturaSeleccionado(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.documentoFactura = fileInput.files[0];
    }
  }

  onDocumentoJustificanteSeleccionado(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.documentoJustificante = fileInput.files[0];
    }
  }

  subirDocumentoFactura(): Promise<string | null> {
    if (!this.documentoFactura) {
      return Promise.resolve(null);
    }
    
    if (!this.contrato?.proyecto) {
      this.error = 'Error: No hay un proyecto asociado al contrato. No se puede subir el documento.';
      return Promise.reject('No hay proyecto asociado');
    }
    
    const proyectoId = this.contrato.proyecto;
    this.cargandoDocumentoF = true;
    return new Promise((resolve, reject) => {
      this.bibliotecarioService.subirDocumento(this.documentoFactura as File, proyectoId)
        .subscribe({
          next: (response: DocumentoResponse) => {
            this.cargandoDocumentoF = false;
            resolve(response.id);
          },
          error: (error) => {
            console.error('Error subiendo documento de factura', error);
            this.cargandoDocumentoF = false;
            reject(error);
          }
        });
    });
  }

  subirDocumentoJustificante(): Promise<string | null> {
    if (!this.documentoJustificante) {
      return Promise.resolve(null);
    }
    
    if (!this.contrato?.proyecto) {
      this.error = 'Error: No hay un proyecto asociado al contrato. No se puede subir el documento.';
      return Promise.reject('No hay proyecto asociado');
    }
    
    const proyectoId = this.contrato.proyecto;
    this.cargandoDocumentoJP = true;
    return new Promise((resolve, reject) => {
      this.bibliotecarioService.subirDocumento(this.documentoJustificante as File, proyectoId)
        .subscribe({
          next: (response: DocumentoResponse) => {
            this.cargandoDocumentoJP = false;
            resolve(response.id);
          },
          error: (error) => {
            console.error('Error subiendo documento de justificante', error);
            this.cargandoDocumentoJP = false;
            reject(error);
          }
        });
    });
  }

  async guardarFactura(): Promise<void> {
    if (!this.isGestor) {
      console.error('No tienes permisos para editar facturas');
      return;
    }

    if (this.facturaForm.invalid) {
      this.error = 'Por favor, complete todos los campos obligatorios correctamente';
      return;
    }

    this.submitting = true;
    this.error = '';
    this.successMessage = '';

    try {
      // Subir documentos si se han seleccionado
      let idDocumentoF: string | null = null;
      let idDocumentoJP: string | null = null;
      
      if (this.documentoFactura) {
        idDocumentoF = await this.subirDocumentoFactura();
      }
      
      if (this.documentoJustificante) {
        idDocumentoJP = await this.subirDocumentoJustificante();
      }

      const formData = { ...this.facturaForm.value };
      
      // Asegurar que el ID del contrato menor esté establecido
      formData.id_cm = this.contratoId;
      
      // Actualizar los IDs de documentos solo si se subieron nuevos
      if (idDocumentoF) {
        formData.documentoF = idDocumentoF;
      }
      
      if (idDocumentoJP) {
        formData.documentoJP = idDocumentoJP;
      }
      
      // Formatear las fechas
      if (formData.fecha_emision) {
        formData.fecha_emision = new Date(formData.fecha_emision).toISOString();
      }
      
      if (formData.fecha_pago) {
        formData.fecha_pago = new Date(formData.fecha_pago).toISOString();
      } else {
        delete formData.fecha_pago;
      }
      
      console.log('Datos de factura a guardar:', formData);
      
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      });

      // Si estamos editando una factura existente
      if (this.facturaEditando) {
        this.http.patch<Factura>(
          `${this.API_URL}/Factura?IdFactura=eq.${this.facturaEditando.IdFactura}`, 
          formData, 
          { headers }
        ).subscribe({
          next: (response) => {
            this.successMessage = 'Factura actualizada correctamente';
            this.showFormEditar = false;
            this.facturaEditando = null;
            this.submitting = false;
            this.facturaForm.reset();
            this.documentoFactura = null;
            this.documentoJustificante = null;
            // Recargar las facturas
            this.cargarFacturas();
          },
          error: (error) => {
            console.error('Error actualizando factura', error);
            this.error = 'Error al actualizar la factura';
            this.submitting = false;
          }
        });
      } 
      // Si estamos creando una nueva factura
      else if (this.showFormNueva) {
        this.http.post<Factura>(
          `${this.API_URL}/Factura`, 
          formData, 
          { headers }
        ).subscribe({
          next: (response) => {
            this.successMessage = 'Factura creada correctamente';
            this.showFormNueva = false;
            this.submitting = false;
            this.facturaForm.reset();
            this.documentoFactura = null;
            this.documentoJustificante = null;
            // Recargar las facturas
            this.cargarFacturas();
          },
          error: (error) => {
            console.error('Error creando factura', error);
            this.error = 'Error al crear la factura';
            this.submitting = false;
          }
        });
      }
    } catch (error) {
      console.error('Error en el proceso de guardar factura', error);
      this.error = 'Error al procesar la factura. Por favor, inténtelo de nuevo.';
      this.submitting = false;
    }
  }

  eliminarFactura(idFactura: string): void {
    if (!this.isGestor) {
      console.error('No tienes permisos para eliminar facturas');
      return;
    }

    if (confirm('¿Está seguro de que desea eliminar esta factura? Esta acción no se puede deshacer.')) {
      this.submitting = true;
      
      // Primero necesitamos desasociar la factura de los artículos
      this.http.patch(
        `${this.API_URL}/Articulo?id_factura=eq.${idFactura}`,
        { id_factura: null }
      ).subscribe({
        next: () => {
          // Ahora podemos eliminar la factura
          this.http.delete(`${this.API_URL}/Factura?IdFactura=eq.${idFactura}`)
            .subscribe({
              next: () => {
                this.successMessage = 'Factura eliminada correctamente';
                this.submitting = false;
                // Recargar las facturas
                this.cargarFacturas();
              },
              error: (error) => {
                console.error('Error eliminando factura', error);
                this.error = 'Error al eliminar la factura';
                this.submitting = false;
              }
            });
        },
        error: (error) => {
          console.error('Error desasociando factura de artículos', error);
          this.error = 'Error al eliminar la factura';
          this.submitting = false;
        }
      });
    }
  }

  // Método para iniciar la creación de una nueva factura
  iniciarNuevaFactura(): void {
    if (!this.isGestor) {
      console.error('No tienes permisos para crear facturas');
      return;
    }

    // Generar un ID único para la nueva factura
    const nuevoId = `FAC-${new Date().getTime()}`;
    
    // Establecer los valores por defecto del formulario, incluyendo el ID del contrato menor
    this.facturaForm.setValue({
      IdFactura: nuevoId,
      descripcion: '',
      fecha_emision: new Date().toISOString().split('T')[0],
      fecha_pago: '',
      documentoF: '',
      documentoJP: '',
      id_cm: this.contratoId  // Asegurar que el ID del contrato menor esté asociado
    });

    // Mostrar el formulario de nueva factura
    this.showFormNueva = true;
    this.showFormEditar = false;
    this.facturaEditando = null;
    this.documentoFactura = null;
    this.documentoJustificante = null;

    console.log('Creando nueva factura para el contrato menor:', this.contratoId);
  }

  abrirDocumento(idDocumento: string): void {
    if (!idDocumento) return;
    
    if (!this.contrato?.proyecto) {
      this.error = 'Error: No hay un proyecto asociado al contrato. No se puede abrir el documento.';
      return;
    }
    
    const proyectoId = this.contrato.proyecto;
    const url = this.bibliotecarioService.getUrlDescarga(idDocumento, proyectoId);
    window.open(url, '_blank');
  }

  // Nuevo método para hacer scroll a la factura resaltada
  scrollToHighlightedFactura(): void {
    if (this.facturaResaltadaId) {
      setTimeout(() => {
        const elementId = 'factura-' + this.facturaResaltadaId;
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Agregar una animación para llamar la atención (opcional)
          element.classList.add('highlight-animation');
          // Eliminar la clase después de 2 segundos
          setTimeout(() => {
            element.classList.remove('highlight-animation');
          }, 2000);
        }
      }, 300); // Pequeño retraso para asegurarse de que el DOM está listo
    }
  }

  // Método para cargar los artículos de todas las facturas
  cargarTodosLosArticulos(): void {
    if (this.facturas.length === 0) {
      return;
    }
    
    this.loadingArticulos = true;
    
    // Obtener todos los IDs de facturas
    const idsFacturas = this.facturas.map(f => f.IdFactura);
    
    // Construir la consulta con todos los IDs
    const facturaCondition = idsFacturas.map(id => `id_factura=eq.${id}`).join(',');
    
    // Cargar todos los artículos de todas las facturas
    this.http.get<Articulo[]>(`${this.API_URL}/Articulo?${facturaCondition}`)
      .subscribe({
        next: (articulos) => {
          // Agrupar artículos por factura
          for (const factura of this.facturas) {
            const articulosFactura = articulos.filter(a => a.id_factura === factura.IdFactura);
            this.articulosPorFactura.set(factura.IdFactura, articulosFactura);
          }
          this.loadingArticulos = false;
        },
        error: (error) => {
          console.error('Error cargando todos los artículos', error);
          this.loadingArticulos = false;
          
          // Inicializar todas las facturas con arrays vacíos
          for (const factura of this.facturas) {
            this.articulosPorFactura.set(factura.IdFactura, []);
          }
        }
      });
  }

  volverALista(): void {
    this.navigationService.volver();
  }
}
