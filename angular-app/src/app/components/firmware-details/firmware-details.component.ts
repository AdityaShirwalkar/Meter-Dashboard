import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { RouterModule } from '@angular/router';
import { AlertDialogComponent } from '../ui/alert-dialog/alert-dialog.component';
import { FirmwareVersionModalComponent } from '../firmware-version-modal/firmware-version-modal.component';

interface FirmwareData {
  MeterNo: number;
  Firmware_version: string | null;
  available_version: string | null;
  activation_date: string | null;
  firmware_availability: boolean;
  isVisible?: boolean;
}

@Component({
  selector: 'app-firmware-details',
  standalone: true,
  imports: [CommonModule,AlertDialogComponent,FirmwareVersionModalComponent],
  templateUrl: './firmware-details.component.html',
  styleUrl: './firmware-details.component.css'
})
export class FirmwareDetailsComponent implements OnInit {
  totalDevices: number = 0;
  pendingUpdates: number = 0;
  availableFirmware: number = 0;
  firmwareData: FirmwareData[] = [];
  filteredFirmwareData: FirmwareData[] = [];
  currentFilter: 'all' | 'pending' | 'available' = 'all';
  showDeleteDialog : boolean = false;
  deletingMeterNo : number | null = null;
  isVersionModalOpen : boolean = false;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.fetchFirmwareData();
  }

  fetchFirmwareData() {
    this.dataService.getFirmwareList().subscribe({
      next: (data: FirmwareData[]) => {
        this.firmwareData = data.map(item => ({
          ...item,
          available_version: item.Firmware_version ? '5.2' : null,
          isVisible: item.Firmware_version !== null
        }));
        this.calculateStats(this.firmwareData);
        this.filterData(this.currentFilter);
      },
      error: (error) => {
        console.error('Error fetching firmware data:', error);
      }
    });
  }

  private calculateStats(data: FirmwareData[]) {
    const visibleData = data.filter(item => item.isVisible);
    this.totalDevices = visibleData.length;
    this.pendingUpdates = visibleData.filter(item => 
      item.Firmware_version && item.Firmware_version !== '5.2'
    ).length;
    this.availableFirmware = visibleData.filter(item => 
      item.firmware_availability
    ).length;
  }

  filterData(filter: 'all' | 'pending' | 'available') {
    this.currentFilter = filter;
    const visibleData = this.firmwareData.filter(item => item.isVisible);
    
    switch (filter) {
      case 'all':
        this.filteredFirmwareData = visibleData;
        break;
      case 'pending':
        this.filteredFirmwareData = visibleData.filter(
          item => item.Firmware_version && item.Firmware_version !== '5.2'
        );
        break;
      case 'available':
        this.filteredFirmwareData = visibleData.filter(
          item => item.firmware_availability
        );
        break;
    }
  }

  deleteFirmware(meterNo: number) {
    const itemIndex = this.firmwareData.findIndex(item => item.MeterNo === meterNo);
    if (itemIndex !== -1) {
      this.firmwareData[itemIndex].isVisible = false;
      this.calculateStats(this.firmwareData);
      this.filterData(this.currentFilter);
    }
    this.dataService.softDeleteFirmware(meterNo).subscribe({
      error: (error) => {
        console.error('Error deleting firmware:', error);
        if (itemIndex !== -1) {
          this.firmwareData[itemIndex].isVisible = true;
          this.calculateStats(this.firmwareData);
          this.filterData(this.currentFilter);
        }
      }
    });
  }

  OpenModal() {
    this.isVersionModalOpen=true;
    // console.log(this.isVersionModalOpen);
  }

  handleVersionModalClose() {
    this.isVersionModalOpen=false;
  }

  handleVersionModalSave(firmwareData:any) {
    console.log(firmwareData);
    this.isVersionModalOpen = false;
  }

  formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }

  confirmDelete(meterNo:number) {
    this.deletingMeterNo = meterNo;
    this.showDeleteDialog = true;
  }

  handleDeleteConfirmed() {
    if(this.deletingMeterNo!==null) {
      this.deleteFirmware(this.deletingMeterNo);
      this.showDeleteDialog = false;
      this.deletingMeterNo = null;
    }
  }

  handleDeleteCancelled() {
    this.showDeleteDialog = false;
    this.deletingMeterNo = null;
  }
}

//1