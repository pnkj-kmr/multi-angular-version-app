import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  inject,
  Injectable,
  Provider,
  OnInit,
  AfterViewInit,
} from "@angular/core";
import { LoginPage } from "../../app/pages/login/login.page";
import { AuthService } from "../../app/services/auth.service";
import { ApiService } from "../../app/services/api.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { LoginRequest } from "../../app/models/user.model";

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Custom ApiService that allows dynamic API URL
@Injectable()
class WebComponentApiService extends ApiService {
  private customApiUrl: string = "";

  constructor(http: HttpClient) {
    super(http);
  }

  setApiUrl(url: string): void {
    (this as any).apiUrl = url;
  }

  override post<T>(endpoint: string, data: any): Observable<T> {
    const url =
      this.customApiUrl || (this as any).apiUrl || "http://localhost:8000";
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      ...(localStorage.getItem("token") && {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }),
    });
    const http = (this as any).http as HttpClient;
    return http.post<T>(`${url}${endpoint}`, data, { headers });
  }
}

// Custom AuthService for web component (no Router navigation, configurable endpoint)
@Injectable()
class WebComponentAuthService extends AuthService {
  private customLoginEndpoint: string = "/api/auth/login";

  constructor(apiService: ApiService) {
    super(apiService, {
      navigate: () => Promise.resolve(true),
    } as unknown as Router);
  }

  setLoginEndpoint(endpoint: string): void {
    this.customLoginEndpoint = endpoint;
  }

  override login(credentials: LoginRequest): Observable<AuthResponse> {
    // Use custom endpoint instead of hardcoded one
    const apiService = (this as any).apiService as ApiService;
    return (
      apiService.post(
        this.customLoginEndpoint,
        credentials
      ) as Observable<AuthResponse>
    ).pipe(
      tap((response: AuthResponse) => {
        localStorage.setItem("token", response.access_token);
        (this as any).token.set(response.access_token);
      })
    );
  }
}

@Component({
  selector: "login-web-component",
  standalone: true,
  imports: [LoginPage],
  providers: [
    {
      provide: ApiService,
      useClass: WebComponentApiService,
      deps: [HttpClient],
    },
    {
      provide: AuthService,
      useClass: WebComponentAuthService,
      deps: [ApiService],
    },
    // Provide Router for LoginPage (mock Router that doesn't navigate)
    {
      provide: Router,
      useValue: {
        navigate: () => Promise.resolve(true),
        navigateByUrl: () => Promise.resolve(true),
        createUrlTree: () => ({} as any),
        serializeUrl: () => "",
      } as unknown as Router,
    },
  ] as Provider[],
  template: ` <app-login-page></app-login-page> `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-height: 400px;
      }
    `,
  ],
})
export class LoginWebComponent implements OnInit, AfterViewInit {
  // Web component inputs
  @Input() apiUrl: string = "http://localhost:8000";
  @Input() loginEndpoint: string = "/api/auth/login";

  // Web component outputs
  @Output() loginSuccess = new EventEmitter<AuthResponse>();
  @Output() loginError = new EventEmitter<string>();

  private elementRef = inject(ElementRef);
  private apiService = inject(ApiService) as unknown as WebComponentApiService;
  private authService = inject(
    AuthService
  ) as unknown as WebComponentAuthService;

  constructor() {
    console.log("LoginWebComponent constructor called");
  }

  ngOnInit(): void {
    console.log("LoginWebComponent ngOnInit called");
  }

  ngAfterViewInit(): void {
    console.log("LoginWebComponent ngAfterViewInit called");
    console.log("API URL:", this.apiUrl);
    console.log("Login Endpoint:", this.loginEndpoint);

    // Configure API URL
    if (this.apiService.setApiUrl) {
      this.apiService.setApiUrl(this.apiUrl);
      console.log("API URL configured");
    }

    // Configure login endpoint
    if ((this.authService as any).setLoginEndpoint) {
      (this.authService as any).setLoginEndpoint(this.loginEndpoint);
      console.log("Login endpoint configured");
    }

    // Intercept AuthService login to emit web component events
    this.interceptAuthService();

    // Debug: Log component state
    console.log("Component element:", this.elementRef.nativeElement);
    console.log("Component dimensions:", {
      width: this.elementRef.nativeElement.offsetWidth,
      height: this.elementRef.nativeElement.offsetHeight,
    });
  }

  private interceptAuthService(): void {
    // Store original login method
    const originalLogin = this.authService.login.bind(this.authService);

    // Override login to emit events
    (this.authService as any).login = (credentials: LoginRequest) => {
      return originalLogin(credentials).pipe(
        tap({
          next: (response: AuthResponse) => {
            localStorage.setItem("token", response.access_token);
            this.loginSuccess.emit(response);
            this.dispatchCustomEvent("loginSuccess", response);
          },
          error: (error: any) => {
            let errorMsg = "Login failed. Please try again.";
            if (error.error?.detail) {
              if (typeof error.error.detail === "string") {
                errorMsg = error.error.detail;
              } else if (
                Array.isArray(error.error.detail) &&
                error.error.detail.length > 0
              ) {
                errorMsg = error.error.detail[0].msg || "Validation error";
              }
            }
            this.loginError.emit(errorMsg);
            this.dispatchCustomEvent("loginError", errorMsg);
          },
        })
      );
    };
  }

  private dispatchCustomEvent(eventName: string, detail: any): void {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true,
    });
    this.elementRef.nativeElement.dispatchEvent(event);
  }
}
