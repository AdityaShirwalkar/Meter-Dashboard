import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-password-reset-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="close()"></div>
    <div class="modal" *ngIf="isOpen">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Reset Password</h2>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              [(ngModel)]="currentPassword"
              class="form-control"
              placeholder="Enter current password"
            />
          </div>
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              [(ngModel)]="newPassword"
              class="form-control"
              placeholder="Enter new password"
            />
          </div>
          <div class="form-group last-form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              [(ngModel)]="confirmPassword"
              class="form-control"
              placeholder="Confirm new password"
            />
          </div>
          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>
        </div>
        <div class="modal-footer">
          <button
          class="btn-close"
          (click)="close()">Cancel</button>
          <button
            class="submit-button"
            (click)="resetPassword()"
            [disabled]="isLoading"
          >
            {{ isLoading ? 'Updating...' : 'Update Password' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        backdrop-filter: blur(3px);
      }

      .modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1001;
        width: 100%;
        overflow: hidden;
        max-width: 460px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2);
      }

      .modal-content {
        width: 100%;
        background: white;
        border-radius: 10px;
      }

      .modal-header {
        background-color: #2c3e50;
        color: #fff;
        border-bottom: none;
        padding: 1.1rem;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .modal-header h2 {
        font-weight: 600;
        letter-spacing: 0.5px;
        margin: 0;
        margin-top: 0.4rem;
        margin-bottom: 0.4rem;
        font-size: 1.25rem;
        color: #fff;
      }

      .close-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #fff;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        line-height: 1;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .close-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .modal-body {
        padding: 1.5rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .last-form-group {
        margin-bottom: 0.5rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #444;
      }

      .form-control {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
        transition: border-color 0.2s ease;
        box-sizing: border-box;
      }

      .form-control:focus {
        outline: none;
        border-color: #2ecc71;
      }

      .form-control::placeholder {
        color: #999;
      }

      .error-message {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.5rem;
      }

      .success-message {
        color: #28a745;
        font-size: 0.875rem;
        margin-top: 0.5rem;
      }

      .modal-footer {
        padding: 1.2rem;
        /*text-align: right;*/
        display: flex;
        align-items:center;
        justify-content: space-between;
        /* border-top: 1px solid #eee; */
      }

      .submit-button {
        background-color: #2ecc71;
        color: white;
        border: none;
        padding: 0.5rem 1.4rem;
        border-radius: 5px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .submit-button:hover:not(:disabled) {
        background-color: #27ae60;
      }

      .submit-button:disabled {
        background-color: #a8a8a8;
        cursor: not-allowed;
      }

      .btn-close {
        background-color: #fc9c9f;
        margin-right: auto;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        text-transform: uppercase;
        font-size: 0.85rem;
      }
  
    .btn-close:hover {
      background-color: #dd3439;
    }
    `,
  ],
})
export class PasswordResetModalComponent {
  isOpen = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private authservice: AuthService) {}

  close() {
    this.isOpen = false;
    this.resetForm();
  }

  open() {
    this.isOpen = true;
  }

  resetForm() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = false;
  }

  resetPassword() {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New passwords do not match';
      return;
    }

    if (this.newPassword === this.currentPassword) {
      this.errorMessage =
        'New password must be different from current password';
      return;
    }

    this.isLoading = true;

    this.authservice
      .resetPassword(this.currentPassword, this.newPassword)
      .subscribe({
        next: (response) => {
          this.successMessage = 'Password updated successfully';
          this.isLoading = false;
          setTimeout(() => {
            this.close();
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage =
            error.error.message || 'Failed to update the password';
        },
      });
  }
}
