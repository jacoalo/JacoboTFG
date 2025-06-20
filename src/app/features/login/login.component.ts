import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    // Limpiar espacios en blanco
    const trimmedUsername = this.username?.trim();
    const trimmedPassword = this.password?.trim();
    
    if (!trimmedUsername || !trimmedPassword) {
      this.errorMessage = 'Por favor, introduce usuario y contraseña';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(trimmedUsername, trimmedPassword)
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Error de autenticación. Por favor, verifica tus credenciales.';
          this.loading = false;
        }
      });
  }
} 