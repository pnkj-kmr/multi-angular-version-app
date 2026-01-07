import { Injectable, signal, computed } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { ApiService } from "./api.service";
import { LoginRequest, SignupRequest } from "../models/user.model";

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private token = signal<string | null>(localStorage.getItem("token"));

  isAuthenticated = computed(() => !!this.token());

  constructor(private apiService: ApiService, private router: Router) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService
      .post<AuthResponse>("/api/auth/login", credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem("token", response.access_token);
          this.token.set(response.access_token);
        })
      );
  }

  signup(userData: SignupRequest): Observable<AuthResponse> {
    return this.apiService
      .post<AuthResponse>("/api/auth/signup", userData)
      .pipe(
        tap((response) => {
          localStorage.setItem("token", response.access_token);
          this.token.set(response.access_token);
        })
      );
  }

  logout(): void {
    localStorage.removeItem("token");
    this.token.set(null);
    this.router.navigate(["/login"]);
  }
}
