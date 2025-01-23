import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-firmware-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './firmware-modal.component.html',
  styleUrls: ['./firmware-modal.component.css']
})
export class FirmwareModalComponent {
  @Input() isOpen = false;
  @Input() isUpdating = false;
  @Input() selectedRow: any = null;
  @Input() firmwareData: any = null;
  @Input() editedFirmwareData: any = {};
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<any>();

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  onUpdate(): void {
    const updatedData = {
      ...this.editedFirmwareData,
      isVisible: true
    };
    this.update.emit(updatedData);
  }
}
//1