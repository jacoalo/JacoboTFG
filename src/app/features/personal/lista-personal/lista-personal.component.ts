import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GastosPersonalService, AuthService, NavigationService } from '../../../core/services';
import { Personal } from '../../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lista-personal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-personal.component.html',
  styleUrls: ['./lista-personal.component.css']
})
export class ListaPersonalComponent implements OnInit, OnDestroy {
  personal: Personal[] = [];
  loading: boolean = true;
  error: string = '';
  isGestor: boolean = false;
  private routeSubscription: Subscription | null = null;

  constructor(
    private gastosPersonalService: GastosPersonalService,
    private authService: AuthService,
    private navigationService: NavigationService
  ) {
    this.isGestor = this.authService.isGestor();
  }

  ngOnInit(): void {
    this.cargarPersonal();
    
    // Añadir el estado actual a la pila de navegación
    this.navigationService.pushState(
      '/personal',
      'Gestión de Personal'
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

  cargarPersonal(): void {
    this.loading = true;
    this.error = '';

    this.gastosPersonalService.getPersonal().subscribe({
      next: (personal) => {
        this.personal = personal;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando personal:', error);
        this.error = 'Error al cargar el personal. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    });
  }

  eliminarPersonal(dni: string): void {
    if (confirm('¿Está seguro de que desea eliminar este personal?')) {
      this.gastosPersonalService.deletePersonal(dni).subscribe({
        next: () => {
          this.cargarPersonal();
        },
        error: (error) => {
          console.error('Error eliminando personal:', error);
          this.error = 'Error al eliminar el personal. Por favor, inténtalo de nuevo.';
        }
      });
    }
  }
} 