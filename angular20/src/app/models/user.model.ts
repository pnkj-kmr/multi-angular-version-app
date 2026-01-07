export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  full_name: string;
  created_at?: string;
}


