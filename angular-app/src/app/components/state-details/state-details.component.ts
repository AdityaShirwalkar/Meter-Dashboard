import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Data, RouterModule } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { AlertDialogComponent } from '../ui/alert-dialog/alert-dialog.component';

interface StateData {
  unit_no: number;
  state: string;
  reason: string;
  mode: string;
  isVisible?: boolean;
}

@Component({
  selector: 'app-state-details',
  standalone: true,
  imports: [CommonModule,AlertDialogComponent],
  templateUrl: './state-details.component.html',
  styleUrl: './state-details.component.css'
})
export class StateDetailsComponent implements OnInit {
  totalUnits: number = 0;
  discoveredUnits: number = 0;
  unitsInError: number = 0;
  stateData: StateData[] = [];
  filteredStateData: StateData[] = [];
  currentFilter: 'all' | 'discovered' | 'error' = 'all';
  showDeleteDialog : boolean = false;
  deletingMeterNo : number|null = null;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.fetchStateData();
  }

  fetchStateData() {
    this.dataService.getStateList().subscribe({
      next: (data: StateData[]) => {
        this.stateData = data.map(item => ({
          ...item,
          mode: item.mode ? item.mode.toUpperCase() : ' ',
          isVisible: item.mode !== null
        }));
        this.calculateStats(this.stateData);
        this.filterData('all');
      },
      error: (error) => {
        console.error('Error fetching state data: ', error);
      }
    });
  }

  private calculateStats(data: StateData[]) {
    const visibleData = data.filter(item => item.isVisible);
    this.totalUnits = visibleData.length;
    this.discoveredUnits = visibleData.filter(item => item.state === 'Discovered').length;
    this.unitsInError = visibleData.filter(item => item.state === 'Error').length;
  }

  filterData(filter: 'all' | 'discovered' | 'error') {
    this.currentFilter = filter;
    const visibleData = this.stateData.filter(item => item.isVisible);
    
    switch (filter) {
      case 'all':
        this.filteredStateData = visibleData;
        break;
      case 'discovered':
        this.filteredStateData = visibleData.filter(
          item => item.state === 'Discovered'
        );
        break;
      case 'error':
        this.filteredStateData = visibleData.filter(
          item => item.state === 'Error'
        );
        break;
    }
  }

  deleteState(unitNo: number) {
    const itemIndex = this.stateData.findIndex(item => item.unit_no === unitNo);
    if (itemIndex !== -1) {
      this.stateData[itemIndex].isVisible = false;
      this.calculateStats(this.stateData);
      this.filterData(this.currentFilter);
    }
    
    this.dataService.softDeleteState(unitNo).subscribe({
      error: (error) => {
        console.error('Error deleting state:', error);
        if (itemIndex !== -1) {
          this.stateData[itemIndex].isVisible = true;
          this.calculateStats(this.stateData);
          this.filterData(this.currentFilter);
        }
      }
    });
  }

  confirmDelete(meterNo:number) {
    this.deletingMeterNo = meterNo;
    this.showDeleteDialog = true;
  }

  handleDeleteCancelled() {
    this.showDeleteDialog = false;
    this.deletingMeterNo = null;
  }

  handleDeleteConfirmed() {
    if(this.deletingMeterNo !== null) {
      this.deleteState(this.deletingMeterNo);
      this.deletingMeterNo = null;
      this.showDeleteDialog = false;
    }
  }

}