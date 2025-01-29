import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MeterData {
  UnitNo: string;
  Metertype: string;
  Model: string;
  description: string;
  ip_address: string;
  communication_id: string;
}

@Component({
  selector: 'app-meter-update-modal',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './meter-update-modal.component.html',
  styleUrls: ['./meter-update-modal.component.css']
})
export class MeterUpdateModalComponent {
  @Input() meter: MeterData | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<MeterData>();
  editedMeter: MeterData|null = null;

  ngOnInit() {
    if (this.meter) {
      this.editedMeter = {...this.meter};
    }
  }

  ngOnChanges() {
    if (this.meter) {
      this.editedMeter = {...this.meter};
    }
  }

  onSubmit():void {
    if(this.editedMeter) {
      this.update.emit(this.editedMeter);
      this.close.emit();
    }
  }

  onClose(): void {
    this.editedMeter = null;
    this.close.emit();
  }
}