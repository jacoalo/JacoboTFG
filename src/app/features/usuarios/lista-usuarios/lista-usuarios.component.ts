import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services';
import { Usuario } from '../../../core/models';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.css']
})
export class ListaUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading: boolean = true;
  error: string = '';
  usuarioAEliminar: Usuario | null = null;
  mensajeExito: string = '';
  private readonly API_URL = 'http://localhost:3000'; // URL del backend

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.error = '';
    this.mensajeExito = '';
    
    // Consultar la tabla Usuario para obtener todos los usuarios
    this.http.get<Usuario[]>(`${this.API_URL}/Usuario`)
      .subscribe({
        next: (usuarios) => {
          this.usuarios = usuarios;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cargando usuarios', error);
          this.error = 'Error al cargar los usuarios. Por favor, inténtalo de nuevo.';
          this.loading = false;
        }
      });
  }

  eliminarUsuario(usuario: Usuario): void {
    // Mostrar confirmación primero
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario ${usuario.nombre} ${usuario.apellido1}?`)) {
      this.loading = true;
      
      // Realizar la petición DELETE
      this.http.delete(`${this.API_URL}/Usuario?dni=eq.${usuario.dni}`)
        .subscribe({
          next: () => {
            this.mensajeExito = `Usuario ${usuario.nombre} ${usuario.apellido1} eliminado correctamente`;
            this.cargarUsuarios(); // Recargar la lista después de eliminar
          },
          error: (error) => {
            console.error('Error eliminando usuario', error);
            this.error = 'Error al eliminar el usuario. Por favor, inténtalo de nuevo.';
            this.loading = false;
          }
        });
    }
  }
}
