export interface AuditLog {
  id: number;
  user_id?: number;
  username: string;
  action: string;
  resource_type?: string;
  resource_id?: number;
  details?: string;
  ip_address?: string;
  created_at: string;
}

