import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services';
import { Usuario } from '../../../core/models';
import { fadeAnimation, listAnimation, slideInOutAnimation } from '../../../shared/animations';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crear-usuario.component.html',
  styleUrls: ['./crear-usuario.component.css'],
  animations: [fadeAnimation, listAnimation, slideInOutAnimation]
})
export class CrearUsuarioComponent {
  usuario: Usuario = {
    dni: '',
    login: '',
    password: '',
    nombre: '',
    apellido1: '',
    apellido2: '',
    investigador: true
  };
  
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;
  private readonly API_URL = 'http://localhost:3000';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  crearUsuario(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Crear el usuario en la base de datos
    this.http.post<Usuario>(`${this.API_URL}/Usuario`, this.usuario)
      .subscribe({
        next: (usuario) => {
          this.successMessage = 'Usuario creado correctamente.';
          this.loading = false;
          
          // Redirigimos al listado después de unos segundos
          setTimeout(() => {
            this.router.navigate(['/usuarios']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error al crear usuario', error);
          this.errorMessage = 'Error al crear el usuario. Por favor, inténtalo de nuevo.';
          this.loading = false;
        }
      });
  }

  private validarFormulario(): boolean {
    if (!this.usuario.dni || !this.usuario.login || !this.usuario.nombre || !this.usuario.apellido1 || !this.usuario.password) {
      this.errorMessage = 'Por favor, complete todos los campos obligatorios.';
      return false;
    }

    // Validar DNI (8 números + 1 letra)
    const dniRegex = /^\d{8}[A-Za-z]$/;
    if (!dniRegex.test(this.usuario.dni)) {
      this.errorMessage = 'El DNI debe tener 8 números seguidos de una letra.';
      return false;
    }
    
    // Validar que las contraseñas coincidan
    if (this.usuario.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return false;
    }

    return true;
  }
}
