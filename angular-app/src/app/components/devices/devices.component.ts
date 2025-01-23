import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { RouterModule } from '@angular/router';

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
  imports: [CommonModule],
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.css'
})
export class DevicesComponent implements OnInit {
  allDevices: MeterData[] = [];
  filteredDevices: MeterData[] = [];
  selectedType: string = 'A';
  meterTypes: string[] = ['A', 'B', 'C', 'D'];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.fetchDevices();
  }

  fetchDevices() {
    this.dataService.getData('MeterTable').subscribe({
      next: (data: MeterData[]) => {
        this.allDevices = data;
        this.updateMeterTypes();
        this.filterDevices(this.selectedType);
      },
      error: (error) => {
        console.error('Error fetching devices:', error);
      }
    });
  }

  updateMeterTypes() {
    this.meterTypes = this.meterTypes.filter(type=> this.getTypeCount(type)>0);
    if(!this.meterTypes.includes(this.selectedType)) {
      this.selectedType=this.meterTypes[0] || '';
    }
  }

  selectType(type: string) {
    this.selectedType = type;
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
}