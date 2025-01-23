import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

interface AuthResponse {
  token: string; 
  refreshToken: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private isAuthenticated = false;
  private platformId = inject(PLATFORM_ID);
  private authStateChanged = new BehaviorSubject<boolean>(false);
  private tokenExpirationTimer: any;

  authState$ = this.authStateChanged.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkAuthStatus();
    }
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!token || !refreshToken) {
      this.logout();
      return;
    }

    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = tokenData.exp * 1000;
      
      if (expirationTime <= Date.now()) {
        this.refreshToken().subscribe({
          next: () => {
            this.isAuthenticated = true;
            this.authStateChanged.next(true);
          },
          error: () => {
            this.logout();
          }
        });
      } else {
        // Token is still valid
        this.isAuthenticated = true;
        this.authStateChanged.next(true);
        this.setTokenExpirationTimer(expirationTime - Date.now());
      }
    } catch (error) {
      console.error('Token validation error:', error);
      this.logout();
    }
  }

  resetPassword(currentPassword: string, newPassword: string): Observable<any> {
    const username = localStorage.getItem('username');
    return this.http.post(`${this.apiUrl}/users/reset-password`, {
      username,
      currentPassword,
      newPassword
    }, {
      headers: this.getAuthHeaders()
    });
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private setTokenExpirationTimer(duration: number): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    
    this.tokenExpirationTimer = setTimeout(() => {
      this.refreshToken().subscribe({
        error: () => this.logout()
      });
    }, duration);
  }

  register(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/register`,{username,password}).pipe(
      catchError(error => throwError(() => error))
    );
  }

  login(username: string, password: string): Observable<boolean> {
    console.log('Attempting login for:', username);
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(response => {
        console.log('Login response:', response);
        if (response && response.token) { 
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.token); 
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            const tokenData = JSON.parse(atob(response.token.split('.')[1])); 
            const expirationTime = tokenData.exp * 1000;
            this.setTokenExpirationTimer(expirationTime - Date.now());
          }
          this.isAuthenticated = true;
          this.authStateChanged.next(true);
          this.router.navigate(['']);
        }
      }),
      map(response => !!response.token), 
      catchError(error => {
        console.error('Login error in service:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.isAuthenticated = false;
    this.authStateChanged.next(false);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap(response => {
        if (response && response.accessToken) {
          localStorage.setItem('token', response.accessToken);
        }
      }),
      map(response => response.accessToken)
    );
  }


  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    const token = localStorage.getItem('token');
    return !!token;
    //return Boolean(token);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }
}