import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <h2>Device Management</h2>
          <p>Create new account</p>
        </div>
        
        <div class="form-group">
          <label for="username">Username</label>
          <input 
            type="text" 
            id="username"
            [(ngModel)]="username" 
            placeholder="Choose a username"
            [disabled]="isLoading"
            class="form-control"
            autocomplete="username">
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password"
            [(ngModel)]="password" 
            placeholder="Choose a password"
            [disabled]="isLoading"
            class="form-control"
            autocomplete="new-password">
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input 
            type="password" 
            id="confirmPassword"
            [(ngModel)]="confirmPassword" 
            placeholder="Confirm your password"
            [disabled]="isLoading"
            class="form-control"
            autocomplete="new-password">
        </div>

        <button 
          (click)="register()" 
          [disabled]="isLoading"
          class="login-btn">
          <span *ngIf="!isLoading">Register</span>
          <span *ngIf="isLoading">Registering...</span>
        </button>

        <div class="error-container" *ngIf="errorMessage">
          <p class="error-message">{{ errorMessage }}</p>
        </div>

        <div class="switch-auth">
          Already have an account? <a (click)="goToLogin()">Login here</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .switch-auth {
      margin-top: 1rem;
      text-align: center;
    }
    .switch-auth a {
      color: #007bff;
      cursor: pointer;
    }
    .switch-auth a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {console.log(this.router.config);}

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
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Registration failed';
        this.isLoading = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}