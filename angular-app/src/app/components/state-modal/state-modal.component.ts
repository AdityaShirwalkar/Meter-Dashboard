import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-state-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './state-modal.component.html',
  styleUrls: ['./state-modal.component.css']
})
export class StateModalComponent {
  @Input() isOpen = false;
  @Input() isUpdating = false;
  @Input() selectedRow: any = null;
  @Input() stateData: any = null;
  @Input() editedStateData: any = {};
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<any>();

  onUpdate(): void {
    const updatedData = {
      ...this.editedStateData,
      isVisible: true
    };
    this.update.emit(updatedData);
  }
}