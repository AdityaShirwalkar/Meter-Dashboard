import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  currentItem: string = 'dashboard';
  @Output() menuItemSelected = new EventEmitter<string>();

  constructor(private router: Router) {}

  setCurrentItem(item: string) {
    this.currentItem = item;
    this.menuItemSelected.emit(item);
    this.router.navigate([`/${item}`]).catch(err => {
      console.error('Navigation error:', err);
    });
  }
  isActive(item: string): boolean {
    return this.currentItem === item;
  }
}