import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-firmware-modal',
  imports: [CommonModule,NgFor,NgIf,FormsModule],
  templateUrl: './firmware-modal.component.html',
  styleUrls: ['./firmware-modal.component.css'],
  standalone:true,
})
export class FirmwareModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() isUpdating = false;
  @Input() selectedRow: any = null;
  @Input() firmwareData: any = null;
  @Input() editedFirmwareData: any = {};
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<any>();

  firmwareVersions: any[] = [];
  activationDateMin: string = '';
  activationDateMax: string = '';
  isVersionSelected: boolean = false;
  selectedVersion: string = '';

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.resetForm();
    this.dataService.getFirmwareVersion().subscribe({
      next: (versions) => {
        this.firmwareVersions = versions;
      },
      error: (error) => {
        console.error('Error fetching firmware versions:', error);
      }
    });
  }

  resetForm() {
    this.editedFirmwareData = {};
    this.isVersionSelected = false;
    this.selectedVersion = '';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();

  }

  onFirmwareVersionChange(event: any) {
    const selectedVersion = this.firmwareVersions.find(
      v => v.firmware_version === event.target.value
    );

    if (selectedVersion) {
      this.isVersionSelected = true;
      this.activationDateMin = this.formatDate(selectedVersion.start_date);
      this.activationDateMax = this.formatDate(selectedVersion.end_date);
      this.editedFirmwareData.activation_date = this.activationDateMin;
      this.editedFirmwareData.Firmware_version = event.target.value;
    }
  }

  onUpdate(): void {
    const updatedData = {
      ...this.editedFirmwareData,
      isVisible: true
    };
    this.update.emit(updatedData);
  }
}