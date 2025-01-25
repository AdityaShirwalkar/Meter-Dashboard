import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { response } from 'express';
import { error } from 'node:console';

interface FirmwareVersionData {
  firmware_version: string;
  start_date?: string;
  end_date?: string;
  version_enabled?: boolean;
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
    if(!this.isNewVersion) {
      return !!this.firmwareData.firmware_version;
    }

    return !!(
      this.firmwareData.firmware_version &&
      this.firmwareData.start_date &&
      this.firmwareData.end_date
    );
  }

  onSave(): void {
    const saveData = { ...this.firmwareData };
    
    if (saveData.start_date === '') {
      delete saveData.start_date;
    }
    
    if (saveData.end_date === '') {
      delete saveData.end_date;
    }
  
    if (!this.isNewVersion) {
      this.save.emit(saveData);
      this.saveExistingVersion(saveData);
    } else {
      if (this.isFormValid && !this.existingVersions.includes(saveData.firmware_version)) {
        this.existingVersions.push(saveData.firmware_version);
        this.save.emit(saveData);
        this.saveNewVersion();
      }
    }
  
    // Reset form
    this.firmwareData.end_date = '';
    this.firmwareData.start_date = '';
    this.firmwareData.version_enabled = false;
    this.firmwareData.firmware_version = '';
  }
  
  saveExistingVersion(data: FirmwareVersionData): void {
    this.dataService.updateExistingVersion(data).subscribe({
      next: (response) => {
        console.log('Existing Version updated successfully');
      },
      error: (error) => {
        console.error('Error updating existing version:', error);
      }
    });
  }

  saveNewVersion():void {
    this.dataService.createNewVersion(this.firmwareData).subscribe({
      next: (response) => {
        console.log('New Version added successfully');
      }
    })
  }

  onVersionModeChange(mode: 'new' | 'existing'): void {
    this.versionSelectionMode = mode;
    this.firmwareData.firmware_version = '';
  }
}