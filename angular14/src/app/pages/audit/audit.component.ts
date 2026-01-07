import { Component, OnInit } from '@angular/core';
import { AuditService } from '../../services/audit.service';
import { AuditLog } from '../../models/audit.model';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css']
})
export class AuditComponent implements OnInit {
  auditLogs: AuditLog[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Filters
  selectedAction: string = '';
  selectedUsername: string = '';
  
  // Available actions for filter
  actions: string[] = ['login', 'login_failed', 'signup', 'create_user', 'update_user', 'delete_user'];

  constructor(private auditService: AuditService) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const action = this.selectedAction || undefined;
    const username = this.selectedUsername || undefined;
    
    this.auditService.getAuditLogs(0, 100, action, username).subscribe({
      next: (logs) => {
        this.auditLogs = logs;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load audit logs. Please try again.';
        this.isLoading = false;
        console.error('Error loading audit logs:', error);
      }
    });
  }

  onFilterChange(): void {
    this.loadAuditLogs();
  }

  clearFilters(): void {
    this.selectedAction = '';
    this.selectedUsername = '';
    this.loadAuditLogs();
  }

  getActionLabel(action: string): string {
    const labels: { [key: string]: string } = {
      'login': 'Login',
      'login_failed': 'Login Failed',
      'signup': 'Sign Up',
      'create_user': 'Create User',
      'update_user': 'Update User',
      'delete_user': 'Delete User'
    };
    return labels[action] || action;
  }

  getActionClass(action: string): string {
    const classes: { [key: string]: string } = {
      'login': 'badge-success',
      'login_failed': 'badge-danger',
      'signup': 'badge-primary',
      'create_user': 'badge-info',
      'update_user': 'badge-warning',
      'delete_user': 'badge-danger'
    };
    return classes[action] || 'badge-secondary';
  }

  parseDetails(details: string | undefined): any {
    if (!details) return null;
    try {
      return JSON.parse(details);
    } catch {
      return details;
    }
  }
}



