import { Component, OnInit, Output,EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { RouterModule } from '@angular/router';
import { MeterUpdateModalComponent } from '../meter-update-modal/meter-update-modal.component';

interface MeterData {
  UnitNo: string;
  Metertype: string;
  Model: string;
  description: string;
  ip_address: string;
  communication_id: string;
}

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule,MeterUpdateModalComponent],
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.css'
})
export class DevicesComponent implements OnInit {
  allDevices: MeterData[] = [];
  filteredDevices: MeterData[] = [];
  selectedType: string = '';
  meterTypes: string[] = [];
  selectedMeter: MeterData | null = null;
  isModalVisible: boolean = false;
  selectedRow : any = null;
  @Output() modify = new EventEmitter<MeterData>();

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.fetchDevices();
  }

  fetchDevices() {
    this.dataService.getData('MeterTable').subscribe({
      next: (data: MeterData[]) => {
        this.allDevices = data;
        this.extractMeterTypes();
        if (this.meterTypes.length > 0) {
          this.selectedType = this.meterTypes[0];
          this.filterDevices(this.selectedType);
        }
      },
      error: (error) => {
        console.error('Error fetching devices:', error);
      }
    });
  }

  handleMeterUpdate(updatedMeter: MeterData) {
    const index = this.allDevices.findIndex(m => m.UnitNo === updatedMeter.UnitNo);
    if (index !== -1) {
      this.allDevices[index] = updatedMeter;
      this.filterDevices(this.selectedType);
    }
    this.dataService.updateMeter(updatedMeter).subscribe({
      next: () => {
        console.log('Meter updated successfully');
        this.modify.emit(updatedMeter);
      },
      error: (error) => {
        console.error('Error updating meter:', error);
      }
    });
  }

  extractMeterTypes() {
    const typeSet = new Set(
      this.allDevices.map(device => {
        const match = device.Metertype.match(/Type([A-Z])/);
        return match ? match[1] : null;
      }).filter(type => type !== null)
    );
    
    this.meterTypes = Array.from(typeSet).sort();
  }

  selectType(type: string) {
    this.selectedType = type;
    this.selectedMeter=null;
    this.selectedRow=null;
    this.filterDevices(type);
  }

  filterDevices(type: string) {
    this.filteredDevices = this.allDevices.filter(
      device => device.Metertype === `Type${type}`
    );
  }

  getTypeCount(type: string): number {
    return this.allDevices.filter(
      device => device.Metertype === `Type${type}`
    ).length;
  }

  onRowClick(meter:MeterData) :void {
    this.selectedRow = meter;
    this.selectedMeter=meter;
  }

  openMeterModal() {
    // this.selectedMeter=meter;
    this.isModalVisible= true;
  }

  closeModal() {
    this.isModalVisible=false;
    if(this.selectedMeter) {
      this.modify.emit(this.selectedMeter);
    }
    this.selectedMeter=null;
    this.selectedRow=null;
  }
}