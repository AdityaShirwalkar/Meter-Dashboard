import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private isMenuOpenSubject = new BehaviorSubject<boolean>(false);
  isMenuOpen$ = this.isMenuOpenSubject.asObservable();

  toggleMenu() {
    this.isMenuOpenSubject.next(!this.isMenuOpenSubject.value);
  }

  getMenuState() {
    return this.isMenuOpenSubject.value;
  }
}