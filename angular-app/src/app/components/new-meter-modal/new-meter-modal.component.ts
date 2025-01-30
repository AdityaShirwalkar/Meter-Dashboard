import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-new-meter-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-meter-modal.component.html',
  styleUrls: ['./new-meter-modal.component.css']
})
export class NewMeterModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() newMeterData: any = {};
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  
  isNewMeterType: boolean = true;
  isUnitNoUnique: boolean = true;
  isMeterTypeUnique: boolean = true;
  existingMeterTypes: string[] = [];
  existingUnitNumbers: number[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadExistingData();
  }

  get isValidMeterTypeFormat(): boolean {
    return !this.newMeterData.Metertype || this.newMeterData.Metertype.startsWith('Type');
  }

  loadExistingData() {
    this.dataService.getData('MeterTable').subscribe({
      next: (data: any[]) => {
        this.existingMeterTypes = [...new Set(data.map(item => item.Metertype))].filter(type => type);
        this.existingUnitNumbers = data.map(item => item.UnitNo);
      },
      error: (error) => {
        console.error('Error loading existing meter data:', error);
      }
    });
  }

  checkUnitNoUniqueness() {
    if (this.newMeterData.UnitNo) {
      this.isUnitNoUnique = !this.existingUnitNumbers.includes(this.newMeterData.UnitNo);
    } else {
      this.isUnitNoUnique = true;
    }
  }

  checkMeterTypeUniqueness() {
    if (this.isNewMeterType && this.newMeterData.Metertype) {
      this.isMeterTypeUnique = !this.existingMeterTypes.includes(this.newMeterData.Metertype);
    } else {
      this.isMeterTypeUnique = true;
    }
  }

  checkIpAddress():boolean {
    if(this.newMeterData.ip_address) {
      const ip = this.newMeterData.ip_address.split('.');

      if(ip.length!=4)  return false;

      return ip.every((ip_add:string) => {
        if (!/^\d+$/.test(ip_add)) {
          return false;
        }
        const num = parseInt(ip_add, 10);
        return num >= 0 && num <= 255 && !isNaN(num);
      });
    }
    return false;
  }

  get isFormValid(): boolean {
    return !!(
      this.newMeterData.UnitNo &&
      this.newMeterData.Metertype &&
      this.newMeterData.Metertype.startsWith('Type') &&
      this.checkIpAddress() &&
      this.newMeterData.Metertype.length>4&&
      this.newMeterData.Model &&
      this.newMeterData.description &&
      this.newMeterData.ip_address &&
      this.newMeterData.communication_id &&
      (this.isNewMeterType ? this.isMeterTypeUnique : true)
    );
  }

  onSave(): void {
    if (this.isFormValid && this.isUnitNoUnique) {
      if (this.isNewMeterType && !this.existingMeterTypes.includes(this.newMeterData.Metertype)) {
        this.existingMeterTypes.push(this.newMeterData.Metertype);
      }
      this.save.emit(this.newMeterData);
    }
  }
}