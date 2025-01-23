import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-meter-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meter-list.component.html',
  styleUrls: ['./meter-list.component.css']
})
export class MeterListComponent {
  @Input() data: any[] = [];
  @Input() columns: string[] = [];
  @Input() selectedRow: any = null;
  @Output() rowClick = new EventEmitter<any>();

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }
}