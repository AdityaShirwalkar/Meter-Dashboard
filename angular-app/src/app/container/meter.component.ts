import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { HttpClientModule } from '@angular/common/http';
import { MeterListComponent } from '../components/meter-list/meter-list.component';
import { FirmwareModalComponent } from '../components/firmware-modal/firmware-modal.component';
import { StateModalComponent } from '../components/state-modal/state-modal.component';
import { NewMeterModalComponent } from '../components/new-meter-modal/new-meter-modal.component';
import { AuthService } from '../services/auth.service';
import { LoginComponent } from '../components/login/login.component';
import { Subscription } from 'rxjs';
import { MenuComponent } from '@app/components/menu/menu.component';
import { FirmwareDetailsComponent } from '@app/components/firmware-details/firmware-details.component';
import { StateDetailsComponent } from '@app/components/state-details/state-details.component';
import { DevicesComponent } from '@app/components/devices/devices.component';
import { RouterModule,Router } from '@angular/router';
import { RegisterComponent } from '@app/components/register/register.component';
import { UserService } from '@app/services/user.service';
import { UserManagementComponent } from '@app/components/user-management/user-management.component';
import { PasswordResetModalComponent } from '@app/components/password-reset-modal/password-reset-modal.component';
import { IdleTimeoutService } from '@app/services/idle-timeout.service';
import { IdleWarningModalComponent } from '@app/components/idle-warning-modal/idle-warning-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    PasswordResetModalComponent,
    IdleWarningModalComponent,
    MeterListComponent,
    UserManagementComponent,
    FirmwareModalComponent,
    LoginComponent,
    StateModalComponent,
    FirmwareDetailsComponent,
    StateDetailsComponent,
    DevicesComponent,
    NewMeterModalComponent,
    MenuComponent
  ],
  templateUrl: './meter.component.html',
  styleUrls: ['./meter.component.css']
})
export class MeterComponent implements OnInit, OnDestroy {
  private authSubscription: Subscription | undefined;
  data: any[] = [];
  columns: string[] = [];
  currentTable: string = 'MeterTable';
  selectedRow: any = null;
  isFirmwareModalOpen = false;
  isNewMeterModalOpen = false;
  isStateModalOpen = false;
  firmwareData: any = null;
  title: string='';
  stateData: any = null;
  isUpdating = false;
  editedFirmwareData: any = {};
  currentView: string = 'dashboard'; 
  editedStateData: any = {};
  newMeterData: any = {
    UnitNo: null,
    Metertype: '',
    Model: '',
    description: '',
    ip_address: '',
    communication_id: ''
  };
  username: string = '';
  isUserMenuOpen = false;
  isAdmin: boolean = false;
  @ViewChild(UserManagementComponent) userManagement!: UserManagementComponent;
  @ViewChild(PasswordResetModalComponent) passwordResetModal!: PasswordResetModalComponent
  @ViewChild('userIcon') userIcon!: ElementRef;

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private idleTimeoutService:IdleTimeoutService
  ) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.username = localStorage.getItem('username') || '';
      this.checkUserRole();
    }
  }

  ngOnInit() {
    this.authSubscription = this.authService.authState$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.fetchData(this.currentTable);
        this.isUserMenuOpen = false;
        this.idleTimeoutService.startWatching();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  logout() {
    this.selectedRow = null;
    this.authService.logout();
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  checkUserRole() {
    if (this.username) {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        this.authService.logout();  // Redirect to login if no token found
        return;
      }
  
      this.userService.getCurrentUserRole(this.username).subscribe({
        next: (response) => {
          this.isAdmin = response.role === 'admin';
          console.log('User role:', response.role);
        },
        error: (error) => {
          console.error('Error checking user role:', error);
          if (error.status === 401) {
            // Token expired or invalid
            this.authService.logout();
          }
        }
      });
    }
  }

  openUserManagement() {
    if (this.userManagement) {
      this.userManagement.open();
      this.isUserMenuOpen = false;
    }
  }
  openPasswordReset() {
    if (this.passwordResetModal) {
      this.passwordResetModal.open();
      this.isUserMenuOpen = false;
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    this.idleTimeoutService.stopWatching();
  }

  onUserLogin(username: string) {
    this.username = username;
    this.checkUserRole();
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
  if (this.userIcon && !this.userIcon.nativeElement.contains(event.target)) {
    this.isUserMenuOpen = false;
  }
}

handleUsernameClick() {
    this.passwordResetModal.open();
}

  onMenuItemSelected(item: string) {
    this.currentView = item;
    this.router.navigate([item]);
  }

  fetchData(tableName: string) {
    this.dataService.getData(tableName).subscribe({
      next: (response: any[]) => {
        this.data = response;
        if (this.data.length > 0) {
          this.columns = Object.keys(this.data[0]);
        }
      },
      error: (error: any) => {
        console.error('Error fetching data:', error);
      }
    });
  }

  onRowClick(row: any): void {
    this.selectedRow = row;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  openFirmwareModal(isUpdating: boolean): void {
    if (this.selectedRow) {
      this.isUpdating = isUpdating;
      this.isFirmwareModalOpen = true;

      if (this.selectedRow.UnitNo) {
        this.dataService.getFirmwareData(this.selectedRow.UnitNo).subscribe({
          next: (firmwareData: any) => {
            this.firmwareData = { ...firmwareData };
            this.editedFirmwareData = { ...this.firmwareData };
            this.editedFirmwareData.firmware_availability = this.editedFirmwareData.firmware_availability
              ? 'available'
              : 'not available';
          },
          error: (error: any) => {
            console.error('Error fetching firmware data:', error);
          }
        });
      }
    }
  }

  openStateModal(isUpdating: boolean): void {
    if (this.selectedRow) {
      this.isUpdating = isUpdating;
      this.isStateModalOpen = true;

      if (this.selectedRow.UnitNo) {
        this.dataService.getStateData(this.selectedRow.UnitNo).subscribe({
          next: (stateData: any) => {
            this.stateData = { ...stateData };
            this.editedStateData = { ...this.stateData };
          },
          error: (error: any) => {
            console.error('Error fetching state data:', error);
          }
        });
      }
    }
  }

  updateFirmware(): void {
    const dataToSave = {
      ...this.editedFirmwareData,
      MeterNo: this.selectedRow.UnitNo,
      firmware_availability: this.editedFirmwareData.firmware_availability === 'available',
      activation_date: new Date(this.editedFirmwareData.activation_date).toISOString().split('T')[0],
      isVisible: true
    };
  
    this.dataService.updateFirmwareData(dataToSave).subscribe({
      next: (response) => {
        this.firmwareData = { ...this.firmwareData, ...dataToSave };
        this.isUpdating = false;
        this.closeModal();
        this.fetchData(this.currentTable);
      },
      error: (error) => {
        console.error('Full error details:', error);
        console.error('Error response:', error.error);
        alert(error.error.error || 'Failed to update firmware');
      }
    });
  }

  updateState(): void {
    const dataToSave = {
      ...this.editedStateData,
      unit_no: this.selectedRow.UnitNo,
      isVisible: true
    };
  
    this.dataService.updateStateData(dataToSave).subscribe({
      next: (response) => {
        console.log('State data updated successfully', response);
        this.stateData = { ...this.stateData, ...this.editedStateData, isVisible: true };
        this.isUpdating = false;
        this.closeModal();
        this.fetchData(this.currentTable);
      },
      error: (error) => {
        console.error('Error updating state data', error);
      }
    });
  }

  createNew() {
    this.isNewMeterModalOpen = true;
  }

  saveNewMeter(): void {
    this.dataService.createNewMeter(this.newMeterData).subscribe({
      next: (response) => {
        console.log('New meter created successfully', response);
        this.closeModal();
        this.fetchData(this.currentTable);
      },
      error: (error) => {
        console.error('Error creating new meter:', error);
      }
    });
  }

  closeModal(): void {
    this.isFirmwareModalOpen = false;
    this.isStateModalOpen = false;
    this.isNewMeterModalOpen = false;
    this.firmwareData = null;
    this.stateData = null;
    this.isUpdating = false;
    this.newMeterData = {
      UnitNo: null,
      Metertype: '',
      Model: '',
      description: '',
      ip_address: '',
      communication_id: ''
    };
    // this.selectedRow = null;
  }

  handleUpdate(updatedValue:any) {
    this.fetchData(this.currentTable);
  }

  handleError(error: any): void {
    console.error('An error occurred:', error);
  }
}