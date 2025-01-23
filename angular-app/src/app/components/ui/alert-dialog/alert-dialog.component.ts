import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="dialog-backdrop" (click)="onBackdropClick($event)">
      <div class="dialog-content" role="alertdialog" aria-modal="true">
        <div class="dialog-header">
          <h2 class="dialog-title">{{ title }}</h2>
          <p class="dialog-description">{{ description }}</p>
        </div>
        <div class="dialog-footer">
          <button class="dialog-cancel" (click)="onCancel()">Cancel</button>
          <div class="dialog-spacer"></div>
          <button class="dialog-confirm" (click)="onConfirm()">Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      animation: fadeIn 0.2s ease-out;
    }

    .dialog-content {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 450px;
      padding: 24px;
      animation: slideIn 0.2s ease-out;
    }

    .dialog-header {
      margin-bottom: 20px;
    }

    .dialog-title {
      margin: 0;
      color: #0f172a;
      font-size: 18px;
      font-weight: 600;
    }

    .dialog-description {
      margin: 8px 0 0;
      color: #64748b;
      font-size: 14px;
      line-height: 1.5;
    }

    .dialog-footer {
      display: flex;
      margin-top: 24px;
      justify-content: space-between;
    }

    .dialog-spacer {
      flex: 1;
    }

    .dialog-cancel {
      padding: 8px 16px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      background-color: white;
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .dialog-cancel:hover {
      background-color: #f8fafc;
      border-color: #cbd5e1;
    }

    .dialog-confirm {
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      background-color: #ef4444;
      color: white;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .dialog-confirm:hover {
      background-color: #dc2626;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { 
        opacity: 0;
        transform: translateY(-4px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class AlertDialogComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() description: string = '';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
      this.cancel.emit();
    }
  }
}