import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  users: User[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  showUserForm: boolean = false;
  editingUser: User | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load users. Please try again.';
        this.isLoading = false;
        console.error('Error loading users:', error);
      }
    });
  }

  onAddUser(): void {
    this.editingUser = null;
    this.showUserForm = true;
  }

  onEditUser(user: User): void {
    this.editingUser = user;
    this.showUserForm = true;
  }

  onDeleteUser(userId: number | undefined): void {
    if (!userId) return;
    
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete user. Please try again.';
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  onUserSaved(): void {
    this.showUserForm = false;
    this.editingUser = null;
    this.loadUsers();
  }

  onUserFormCancelled(): void {
    this.showUserForm = false;
    this.editingUser = null;
  }

  logout(): void {
    this.authService.logout();
  }
}



