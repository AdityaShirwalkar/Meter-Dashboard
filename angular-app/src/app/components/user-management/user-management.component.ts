import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

interface User {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  isOpen = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
  }

  loadUsers() {
    const currentUsername = localStorage.getItem('username') || '';
    
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users.filter(user => user.username !== currentUsername);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  changeRole(userId: number) {
    this.userService.changeUserRole(userId, 'admin').subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error changing user role:', error);
      }
    });
  }

  demoteRole(userId: number) {
    this.userService.changeUserRole(userId, 'user').subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        console.error("Error while demoting the admin:", error);
      }
    });
  }

  close() {
    this.isOpen = false;
  }

  open() {
    this.isOpen = true;
    this.loadUsers(); 
  }
}