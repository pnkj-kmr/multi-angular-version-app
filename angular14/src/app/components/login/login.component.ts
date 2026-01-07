import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("loginWebComponent", { static: false })
  loginWebComponentRef!: ElementRef<HTMLElement>;

  apiUrl: string = environment.apiUrl;
  loginEndpoint: string = "/api/auth/login";
  errorMessage: string = "";
  isLoading: boolean = false;
  private loginSuccessHandler?: (event: any) => void;
  private loginErrorHandler?: (event: any) => void;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Wait for custom element to be defined
    this.waitForCustomElement();
  }

  ngAfterViewInit(): void {
    // Set up event listeners and configure web component after view is initialized
    setTimeout(() => {
      this.configureWebComponent();
      this.setupEventListeners();
    }, 100);
  }

  private configureWebComponent(): void {
    const element = this.loginWebComponentRef?.nativeElement as any;
    if (!element) return;

    // Set properties on the web component
    if (element.apiUrl !== undefined) {
      element.apiUrl = this.apiUrl;
    }
    if (element.loginEndpoint !== undefined) {
      element.loginEndpoint = this.loginEndpoint;
    }

    // Also set as attributes (for compatibility)
    if (this.apiUrl) {
      element.setAttribute("api-url", this.apiUrl);
    }
    if (this.loginEndpoint) {
      element.setAttribute("login-endpoint", this.loginEndpoint);
    }
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    this.removeEventListeners();
  }

  private waitForCustomElement(): void {
    if (customElements.get("login-web-component")) {
      return;
    }

    // Wait for custom element to be defined
    const checkInterval = setInterval(() => {
      if (customElements.get("login-web-component")) {
        clearInterval(checkInterval);
        this.setupEventListeners();
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 5000);
  }

  private setupEventListeners(): void {
    const element = this.loginWebComponentRef?.nativeElement;
    if (!element) return;

    // Handle login success
    this.loginSuccessHandler = (event: CustomEvent) => {
      const response = event.detail;
      // Store token if not already stored
      if (response?.access_token) {
        localStorage.setItem("token", response.access_token);
        // Update auth service state
        (this.authService as any).token?.set(response.access_token);
        // Navigate to home
        this.router.navigate(["/home"]);
      }
    };

    // Handle login error
    this.loginErrorHandler = (event: CustomEvent) => {
      this.errorMessage = event.detail || "Login failed. Please try again.";
      this.isLoading = false;
    };

    element.addEventListener("loginSuccess", this.loginSuccessHandler);
    element.addEventListener("loginError", this.loginErrorHandler);
  }

  private removeEventListeners(): void {
    const element = this.loginWebComponentRef?.nativeElement;
    if (!element) return;

    if (this.loginSuccessHandler) {
      element.removeEventListener("loginSuccess", this.loginSuccessHandler);
    }
    if (this.loginErrorHandler) {
      element.removeEventListener("loginError", this.loginErrorHandler);
    }
  }
}
