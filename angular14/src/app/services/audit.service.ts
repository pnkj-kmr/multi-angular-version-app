import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuditLog } from '../models/audit.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  constructor(private apiService: ApiService) {}

  getAuditLogs(skip: number = 0, limit: number = 100, action?: string, username?: string): Observable<AuditLog[]> {
    let endpoint = `/api/audit-logs?skip=${skip}&limit=${limit}`;
    if (action) {
      endpoint += `&action=${action}`;
    }
    if (username) {
      endpoint += `&username=${username}`;
    }
    return this.apiService.get<AuditLog[]>(endpoint);
  }
}

