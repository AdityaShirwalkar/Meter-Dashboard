import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { version } from 'os';

interface FirmwareVersionData {
  firmware_version: string;
  start_date: string;
  end_date: string;
  version_enabled: boolean;
}

@Component({
  selector: 'app-firmware-version-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './firmware-version-modal.component.html',
  styleUrls: ['./firmware-version-modal.component.css']
})
export class FirmwareVersionModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<FirmwareVersionData>();

  firmwareData: FirmwareVersionData = {
    firmware_version: '',
    start_date: '',
    end_date: '',
    version_enabled: false
  };

  versionSelectionMode: 'new' | 'existing' = 'new';
  existingVersions: string[] = [];
  isNewVersion: boolean = true;
  isUnique: boolean = true;

  constructor(private dataService: DataService) {
    this.loadExistingVersions();
  }

  loadExistingVersions(): void {
    this.dataService.getVersion('firmware_versions').subscribe({
      next: (data: any[]) => {
        console.log('Raw firmware versions data:', data);        
        this.existingVersions = data
          .map(item => item.firmware_version)
          .filter(version => version && version.trim() !== '');
        
        console.log('Processed existing versions:', this.existingVersions);
      },
      error: (error) => {
        console.error('Error loading firmware versions:', error);
        this.existingVersions = [];
      }
    });
  }

  checkVersionUniqueness() {
    if(this.isNewVersion && this.firmwareData.firmware_version) {
      this.isUnique = !this.existingVersions.includes(this.firmwareData.firmware_version);
    } else {
      this.isUnique = true;
    }
  }

  get isFormValid(): boolean {
    return !!(
      this.firmwareData.firmware_version &&
      this.firmwareData.start_date &&
      this.firmwareData.end_date
    );
  }

  onSave(): void {
    if (this.isFormValid) {
      this.save.emit(this.firmwareData);
    }
  }
  onVersionModeChange(mode: 'new' | 'existing'): void {
    this.versionSelectionMode = mode;
    this.firmwareData.firmware_version = '';
  }
}