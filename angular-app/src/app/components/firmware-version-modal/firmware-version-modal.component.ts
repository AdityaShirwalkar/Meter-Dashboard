import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

interface FirmwareVersionData {
  firmware_version: string;
  start_date?: string;
  end_date?: string;
  version_enabled?: boolean;
  isValid?: boolean; //only import
}

interface ValidationError {
  row?:number;
  field: string;
  message: string;
}

@Component({
  selector: 'app-firmware-version-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './firmware-version-modal.component.html',
  styleUrls: ['./firmware-version-modal.component.css']
})
export class FirmwareVersionModalComponent {
  @Input() set isOpen(value: boolean) {
    if (value) {
      this.resetModal();
    }
    this._isOpen = value;
  }
  get isOpen(): boolean {
    return this._isOpen;
  }
  private _isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<FirmwareVersionData>();

  firmwareData: FirmwareVersionData = {
    firmware_version: '',
    start_date: '',
    end_date: '',
    version_enabled: true,
  };

  versionSelectionMode: 'new' | 'existing' | 'import' = 'new';
  existingVersions: string[] = [];
  isNewVersion: boolean = true;
  isUnique: boolean = true;
  importedFileData: any[] = [];
  validationErrors: ValidationError[] = [];
  generalError: string = '';
  disableEnableChoice :boolean = true;

  constructor(private dataService: DataService) {
    this.loadExistingVersions();
  }

  resetForm(): void {
    this.firmwareData = {
      firmware_version: '',
      start_date: '',
      end_date: '',
      version_enabled: true
    };
    this.clearFileInput();
    this.generalError='';
    this.importedFileData=[];
  }

  resetModal(): void {
    this.resetForm();
    this.clearFileInput();
    this.generalError = '';
    this.validationErrors = [];
    this.importedFileData = [];
    this.versionSelectionMode = 'new';
    this.isNewVersion = true;
    this.isUnique = true;
  }

  clearFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onVersionModeChange(): void {
    this.resetForm();
    // this.resetModal();  
    this.isNewVersion = this.versionSelectionMode === 'new';
    this.generalError='';
    this.validationErrors=[];
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

  onFileSelected(event: any): void {
    this.generalError='';
    this.validationErrors=[];

    const file = event.target.files[0];
    if(file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const fileContent = e.target?.result as string;
        this.processImportedFile(fileContent, file.name);
      };
      fileReader.readAsText(file);
    }
  }

  displayError(message: string): void {
    this.generalError = message;
    this.validationErrors = [];
  }
  
  displayValidationErrors(errors: ValidationError[]): void {
    this.validationErrors = errors;
    this.generalError = '';
  }

  processImportedFile(content: string, fileName: string): void {
    try {
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      let parsedData: FirmwareVersionData[];
  
      switch (fileExtension) {
        case 'json':
          parsedData = JSON.parse(content) as FirmwareVersionData[];
          break;
        case 'csv':
          parsedData = this.parseCSV(content);
          break;
        default:
          throw new Error('Unsupported file type');
      }
  
      const validationErrors = this.validateImportedData(parsedData);
  
      if(validationErrors.length>0) {
        this.displayValidationErrors(validationErrors);
      }

      this.importedFileData = parsedData;
    } catch (error) {
      console.error('Error processing imported file:', error);
      this.displayError('Failed to process file. Please check the file format.');
    }
  }

  validateImportedData(data: FirmwareVersionData[]): ValidationError[] {
    const errors: ValidationError[] = [];
  
    if (!data || !Array.isArray(data)) {
      errors.push({
        field: 'file',
        message: 'Invalid file format - must be an array of firmware versions'
      });
      return errors;
    }
  
    data.forEach((item, index) => {
      const itemErrors: ValidationError[] = [];
      item.isValid = true;

      if (!item.firmware_version) {
        itemErrors.push({
          row: index + 1,
          field: 'firmware_version',
          message: 'Firmware version is required'
        });
        item.isValid=false;
      }
  
      if (item.firmware_version && !/^\d+\.\d+$/.test(item.firmware_version)) {
        itemErrors.push({
          row: index + 1,
          field: 'firmware_version',
          message: 'Invalid version format. Expected format: X.Y.Z (e.g., 1.0.0)'
        });
        item.isValid = false;
      }

      if(item.firmware_version && this.existingVersions.includes(item.firmware_version)) {
        itemErrors.push({
          row:index+1,
          field:'firmware_version',
          message:'Firmware version is not unique.'
        });
        item.isValid = false;
      }
  
      if (item.start_date && !this.isValidDate(item.start_date)) {
        itemErrors.push({
          row: index + 1,
          field: 'start_date',
          message: 'Invalid start date format. Expected YYYY-MM-DD'
        });
        item.isValid = false;
      }
  
      if (item.end_date && !this.isValidDate(item.end_date)) {
        itemErrors.push({
          row: index + 1,
          field: 'end_date',
          message: 'Invalid end date format. Expected YYYY-MM-DD'
        });
        item.isValid = false;
      }
  
      if (item.start_date && item.end_date && 
          new Date(item.start_date) > new Date(item.end_date)) {
          itemErrors.push({
            row: index + 1,
            field: 'dates',
            message: 'End date must be after start date'
        });
        item.isValid = false;
      }
  
      if (item.version_enabled !== undefined && 
          typeof item.version_enabled !== 'boolean') {
          itemErrors.push({
            row: index + 1,
            field: 'version_enabled',
            message: 'Version enabled must be true or false'
        });
        item.isValid = false;
      }

      errors.push(...itemErrors)
    });
  
    return errors;
  }

  isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && 
           /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  }

  parseCSV(csvContent: string): FirmwareVersionData[] {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      const dataObject: FirmwareVersionData = {
        firmware_version: '',
        start_date: '',
        end_date: '',
        version_enabled: true
      };

      headers.forEach((header, index) => {
        switch(header.toLowerCase()) {
          case 'firmware_version':
            dataObject.firmware_version = values[index];
            break;
          case 'start_date':
            dataObject.start_date = values[index];
            break;
          case 'end_date':
            dataObject.end_date = values[index];
            break;
          case 'version_enabled':
            dataObject.version_enabled = values[index].toLowerCase() === 'true';
            break;
        }
      });

      return dataObject;
    });
  }

  get isFormValid(): boolean {
    if (!this.isNewVersion) {
      return !!this.firmwareData.firmware_version;
    }

    return !!(
      this.firmwareData.firmware_version &&
      this.firmwareData.start_date &&
      this.firmwareData.end_date
    );
  }

  onSave(): void {
    if (this.versionSelectionMode === 'import') {
      const validVersions = this.importedFileData.filter(data=>data.isValid);

      if(validVersions.length===0) {
        this.displayError('No valid versions to import');
        return;
      }

      let successCount = 0;
      const totalValid = validVersions.length;

      validVersions.forEach(data => {
        this.dataService.createNewVersion(data).subscribe({
          next: (response) => {
            console.log('Imported version added successfully');
            successCount++;
            if(successCount === totalValid) {
              this.close.emit();
            }
          },
          error: (error) => {
            console.error('Error importing version:', error);
          }
        });
      });
      return;
    }

    const saveData = { ...this.firmwareData };
    
    if (saveData.start_date === '') {
      delete saveData.start_date;
    }
    
    if (saveData.end_date === '') {
      delete saveData.end_date;
    }

    if (this.versionSelectionMode === 'existing') {
      this.save.emit(saveData);
      this.saveExistingVersion(saveData);
    } else if (this.versionSelectionMode === 'new') {
      if (this.isFormValid && !this.existingVersions.includes(saveData.firmware_version)) {
        this.existingVersions.push(saveData.firmware_version);
        this.save.emit(saveData);
        this.saveNewVersion();
      }
    }
    this.importedFileData=[];
    this.resetModal();
    this.generalError='';
    this.close.emit();
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

  saveNewVersion(): void {
    this.dataService.createNewVersion(this.firmwareData).subscribe({
      next: (response) => {
        console.log('New Version added successfully');
      },
      error: (error) => {
        console.error('Error creating new version:', error);
      }
    });
  }

  get validVersionCount(): number {
    return this.importedFileData.filter(data => data.isValid).length;
  }

  get totalVersionCount(): number {
    return this.importedFileData.length;
  }

  get hasValidVersions(): boolean {
    return this.validVersionCount > 0;
  }         

  closeModal() {
    this.resetModal();
    this.close.emit();
  }
}