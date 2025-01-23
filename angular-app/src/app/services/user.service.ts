import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api';
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`, {
      headers: this.getAuthHeaders()
    });
  }

  changeUserRole(userId: number, newRole: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${userId}/role`, 
      { role: newRole },
      { headers: this.getAuthHeaders() }
    );
  }

  getCurrentUserRole(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${username}/role`, {
      headers: this.getAuthHeaders()
    });
  }
}