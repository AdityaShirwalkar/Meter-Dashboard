import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuComponent } from './components/menu/menu.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuComponent],
  template: `
    <div class="app-container">
      <div class="container-fluid navbar">
        <a class="navbar-brand" href="#">Device Management</a>
      </div>
      <div class="main-content">
        <app-menu (menuItemSelected)="onMenuItemSelected($event)"></app-menu>
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class LayoutComponent {
  onMenuItemSelected(item: string) {
    // menu selectioon
  }
}