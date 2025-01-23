import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MeterComponent } from './container/meter.component';
import { AuthGuard } from './guard/auth.guard';
import { FirmwareDetailsComponent } from './components/firmware-details/firmware-details.component';
import { StateDetailsComponent } from './components/state-details/state-details.component';
import { DevicesComponent } from './components/devices/devices.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: MeterComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'firmware', component: FirmwareDetailsComponent },
      { path: 'state', component: StateDetailsComponent },
      { path: 'devices', component: DevicesComponent },
      { path: 'dashboard', component: MeterComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];