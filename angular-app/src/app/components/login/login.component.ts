import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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
  confirmPassword: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  isRegistering: boolean = false;
  @Output() usernameSelected = new EventEmitter<string>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMode(): void {
    this.isRegistering = !this.isRegistering;
    this.errorMessage = '';
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
  }

  login(): void {
    if (this.username && this.password) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.username, this.password).subscribe({
        next: (response) => {
          if (response) {
            localStorage.setItem('username', this.username);
            this.usernameSelected.emit(this.username);
            this.errorMessage = '';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Invalid credentials';
          console.error('Login error:', error);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Please enter both username and password';
    }
  }

  register(): void {
    if (!this.username || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.username, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.errorMessage = 'Registration successful! Please login.';
        this.isRegistering = false;
        this.password = '';
        this.confirmPassword = '';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Registration failed';
      }
    });
}

  onSubmit(): void {
    if (this.isRegistering) {
      this.register();
    } else {
      this.login();
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSubmit();
    }
  }

}
//1