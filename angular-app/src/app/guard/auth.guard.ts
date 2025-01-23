import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '.././services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    console.log('AuthGuard: Checking authentication status');
    const isAuthenticated = this.authService.isLoggedIn();
    console.log('AuthGuard: Is authenticated?', isAuthenticated);
    
    if (isAuthenticated) {
      return true;
    }
    
    console.log('AuthGuard: Redirecting to login');
    this.router.navigate(['/login']);
    return false;
  }
}