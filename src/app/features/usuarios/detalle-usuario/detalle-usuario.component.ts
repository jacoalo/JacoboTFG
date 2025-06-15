import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario } from '../../../core/models';
import { fadeAnimation, listAnimation, slideInOutAnimation } from '../../../shared/animations';
import { NavigationService } from '../../../core/services';

@Component({
  selector: 'app-detalle-usuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-usuario.component.html',
  styleUrls: ['./detalle-usuario.component.css'],
  animations: [fadeAnimation, listAnimation, slideInOutAnimation]
})
export class DetalleUsuarioComponent implements OnInit {
  usuario: Usuario | null = null;
  loading: boolean = true;
  error: string = '';
  private readonly API_URL = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    this.loading = true;
    this.error = '';
    
    const dni = this.route.snapshot.paramMap.get('id');
    
    if (!dni) {
      this.error = 'ID de usuario no válido';
      this.loading = false;
      return;
    }

    this.http.get<Usuario[]>(`${this.API_URL}/Usuario?dni=eq.${dni}`)
      .subscribe({
        next: (usuarios) => {
          if (usuarios && usuarios.length > 0) {
            this.usuario = usuarios[0];
          } else {
            this.error = 'Usuario no encontrado';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando usuario', error);
          this.error = 'Error al cargar el usuario. Por favor, inténtalo de nuevo.';
          this.loading = false;
        }
      });
  }

  volverALista(): void {
    this.navigationService.volver();
  }

  editarUsuario(): void {
    if (this.usuario) {
      this.navigationService.pushState(`/usuarios/${this.usuario.dni}/editar`, 'Editar Usuario');
      this.router.navigate(['/usuarios', this.usuario.dni, 'editar']);
    }
  }
}
