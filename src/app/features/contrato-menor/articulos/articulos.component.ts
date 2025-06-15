import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services';
import { Articulo, CMenor } from '../../../core/models';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationService } from '../../../core/services/navigation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-articulos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './articulos.component.html',
  styleUrl: './articulos.component.css'
})
export class ArticulosComponent implements OnInit, OnDestroy {
  contratoId: string = '';
  contrato: CMenor | null = null;
  articulos: Articulo[] = [];
  loading: boolean = true;
  loadingContrato: boolean = true;
  submitting: boolean = false;
  error: string = '';
  successMessage: string = '';
  isGestor: boolean = false;
  showFormNuevo: boolean = false;
  showFormEditar: boolean = false;
  articuloForm: FormGroup;
  articuloEditando: Articulo | null = null;
  articuloViendo: Articulo | null = null;
  private modalRef: any = null;
  private routeSubscription: Subscription | null = null;
  
  private readonly API_URL = 'http://localhost:3000';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private fb: FormBuilder,
    private navigationService: NavigationService
  ) {
    this.isGestor = this.authService.isGestor();
    
    // Inicializar formulario
    this.articuloForm = this.fb.group({
      id_art: ['', Validators.required],
      descripcion: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      id_factura: [''],
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
    this.cargarContrato();
    this.cargarArticulos();

    // Añadir el estado actual a la pila de navegación
    this.navigationService.pushState(
      `/contratos-menores/${this.contratoId}/articulos`,
      'Artículos del Contrato Menor'
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

  cargarArticulos(): void {
    this.loading = true;
    this.error = '';

    this.http.get<Articulo[]>(`${this.API_URL}/Articulo?id_cm=eq.${this.contratoId}`)
      .subscribe({
        next: (articulos) => {
          this.articulos = articulos;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando artículos', error);
          this.error = 'Error al cargar los artículos';
          this.loading = false;
        }
      });
  }

  verDetalle(idArticulo: string): void {
    const articulo = this.articulos.find(a => a.id_art === idArticulo);
    if (articulo) {
      // Guardamos el artículo para visualizarlo en el modal
      this.articuloViendo = articulo;
      
      // Mostrar el modal de Bootstrap
      const modalElement = document.getElementById('detalleArticuloModal');
      if (modalElement) {
        // Usamos el objeto Bootstrap global que ya está cargado
        this.modalRef = new (window as any).bootstrap.Modal(modalElement);
        this.modalRef.show();
      }
    }
  }

  cerrarModal(): void {
    if (this.modalRef) {
      this.modalRef.hide();
      this.modalRef = null;
    }
    // Limpiar el artículo que se estaba visualizando
    this.articuloViendo = null;
  }

  iniciarEditarArticulo(idArticulo: string): void {
    if (!this.isGestor) {
      console.error('No tienes permisos para editar artículos');
      return;
    }

    const articulo = this.articulos.find(a => a.id_art === idArticulo);
    if (!articulo) {
      this.error = 'No se encontró el artículo especificado';
      return;
    }

    this.articuloEditando = articulo;
    
    this.articuloForm.setValue({
      id_art: articulo.id_art,
      descripcion: articulo.descripcion,
      cantidad: articulo.cantidad,
      precio: articulo.precio,
      id_factura: articulo.id_factura || null,
      id_cm: this.contratoId
    });

    this.showFormEditar = true;
    this.showFormNuevo = false;
  }

  cancelarEdicion(): void {
    this.showFormEditar = false;
    this.showFormNuevo = false;
    this.articuloEditando = null;
    this.articuloForm.reset();
    this.error = '';
    this.successMessage = '';
  }

  iniciarNuevoArticulo(): void {
    if (!this.isGestor) {
      console.error('No tienes permisos para crear artículos');
      return;
    }

    // Establecer los valores por defecto del formulario, dejando el ID vacío
    this.articuloForm.setValue({
      id_art: '', // Dejamos el ID vacío para que el usuario lo introduzca manualmente
      descripcion: '',
      cantidad: 1,
      precio: 0,
      id_factura: '',
      id_cm: this.contratoId  // Asegurar que el ID del contrato menor esté asociado
    });

    // Mostrar el formulario de nuevo artículo
    this.showFormNuevo = true;
    this.showFormEditar = false;
    this.articuloEditando = null;

    console.log('Creando nuevo artículo para el contrato menor:', this.contratoId);
  }

  // Método para desasignar la factura de un artículo
  desasignarFactura(): void {
    this.articuloForm.patchValue({ id_factura: null });
    console.log('Factura desasignada. Nuevo valor del formulario:', this.articuloForm.value);
  }

  guardarArticulo(): void {
    if (!this.isGestor) {
      console.error('No tienes permisos para editar artículos');
      return;
    }

    if (this.articuloForm.invalid) {
      this.error = 'Por favor, complete todos los campos obligatorios correctamente';
      return;
    }

    this.submitting = true;
    this.error = '';
    this.successMessage = '';

    const formData = { ...this.articuloForm.value };
    
    // Asegurar que el ID del contrato menor esté establecido
    formData.id_cm = this.contratoId;
    
    // Si el campo id_factura está vacío, establecerlo explícitamente a null
    // Esto es necesario para que PostgreSQL actualice correctamente la columna a NULL
    if (!formData.id_factura) {
      formData.id_factura = null;
    }
    
    console.log('Datos de artículo a guardar:', formData);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    });

    // Si estamos editando un artículo existente
    if (this.articuloEditando) {
      this.http.patch<Articulo>(
        `${this.API_URL}/Articulo?id_art=eq.${this.articuloEditando.id_art}`, 
        formData, 
        { headers }
      ).subscribe({
        next: (response) => {
          this.successMessage = 'Artículo actualizado correctamente';
          this.showFormEditar = false;
          this.articuloEditando = null;
          this.submitting = false;
          this.articuloForm.reset();
          // Recargar los artículos
          this.cargarArticulos();
        },
        error: (error) => {
          console.error('Error actualizando artículo', error);
          this.error = 'Error al actualizar el artículo';
          this.submitting = false;
        }
      });
    } 
    // Si estamos creando un nuevo artículo
    else if (this.showFormNuevo) {
      this.http.post<Articulo>(
        `${this.API_URL}/Articulo`, 
        formData, 
        { headers }
      ).subscribe({
        next: (response) => {
          this.successMessage = 'Artículo creado correctamente';
          this.showFormNuevo = false;
          this.submitting = false;
          this.articuloForm.reset();
          // Recargar los artículos
          this.cargarArticulos();
        },
        error: (error) => {
          console.error('Error creando artículo', error);
          this.error = 'Error al crear el artículo';
          this.submitting = false;
        }
      });
    }
  }

  eliminarArticulo(idArticulo: string): void {
    if (!this.isGestor) {
      console.error('No tienes permisos para eliminar artículos');
      return;
    }

    if (confirm('¿Está seguro de que desea eliminar este artículo? Esta acción no se puede deshacer.')) {
      this.submitting = true;
      
      this.http.delete(`${this.API_URL}/Articulo?id_art=eq.${idArticulo}`)
        .subscribe({
          next: () => {
            this.successMessage = 'Artículo eliminado correctamente';
            this.submitting = false;
            // Recargar los artículos
            this.cargarArticulos();
          },
          error: (error) => {
            console.error('Error eliminando artículo', error);
            this.error = 'Error al eliminar el artículo';
            this.submitting = false;
          }
        });
    }
  }

  // Calcular el total del contrato
  calcularTotal(): number {
    return this.articulos.reduce((total, articulo) => 
      total + (articulo.cantidad * articulo.precio), 0);
  }
}
