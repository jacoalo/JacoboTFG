import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Usuario } from '../../../core/models';
import { fadeAnimation, listAnimation, slideInOutAnimation } from '../../../shared/animations';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.css'],
  animations: [fadeAnimation, listAnimation, slideInOutAnimation]
})
export class EditarUsuarioComponent implements OnInit {
  usuario: Usuario = {
    dni: '',
    login: '',
    nombre: '',
    apellido1: '',
    investigador: false
  };
  
  usuarioOriginal: any = null;
  loading: boolean = true;
  submitting: boolean = false;
  error: string = '';
  successMessage: string = '';
  private readonly API_URL = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
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
            this.usuario = {...usuarios[0]};
            this.usuarioOriginal = {...usuarios[0]};
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

  guardarCambios(): void {
    this.submitting = true;
    this.error = '';
    this.successMessage = '';

    // Validar datos
    if (!this.usuario.dni || !this.usuario.login || !this.usuario.nombre || !this.usuario.apellido1) {
      this.error = 'Por favor, complete todos los campos obligatorios.';
      this.submitting = false;
      return;
    }

    // Preparar objeto para actualización
    const usuarioActualizado: any = {
      dni: this.usuario.dni,
      login: this.usuario.login,
      nombre: this.usuario.nombre,
      apellido1: this.usuario.apellido1,
      apellido2: this.usuario.apellido2,
      investigador: this.usuario.investigador
    };

    // Solo incluir contraseña si se ha modificado
    if (this.usuario.password && this.usuario.password.trim() !== '') {
      usuarioActualizado.password = this.usuario.password;
    }

    // Actualizar usuario
    this.http.patch<Usuario>(`${this.API_URL}/Usuario?dni=eq.${this.usuario.dni}`, usuarioActualizado)
      .subscribe({
        next: () => {
          this.successMessage = 'Usuario actualizado correctamente';
          this.submitting = false;
          // Redirigir después de unos segundos
          setTimeout(() => {
            this.router.navigate(['/usuarios', this.usuario.dni]);
          }, 2000);
        },
        error: (error) => {
          console.error('Error actualizando usuario', error);
          this.error = 'Error al actualizar el usuario. Por favor, inténtalo de nuevo.';
          this.submitting = false;
        }
      });
  }

  cancelar(): void {
    this.router.navigate(['/usuarios', this.usuario.dni]);
  }
}
