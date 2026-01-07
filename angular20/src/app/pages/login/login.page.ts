import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { LoginRequest } from "../../models/user.model";
import { InfraonButtonComponent } from "../../components/button/button.component";
import { InfraonFormInputComponent } from "../../components/form-input/form-input.component";

@Component({
  selector: "app-login-page",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InfraonButtonComponent,
    InfraonFormInputComponent,
  ],
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.css"],
})
export class LoginPage {
  credentials = signal<LoginRequest>({
    username: "",
    password: "",
  });

  errorMessage = signal<string>("");
  isLoading = signal<boolean>(false);

  constructor(private authService: AuthService, private router: Router) {}

  updateUsername(value: string): void {
    this.credentials.update((c) => ({ ...c, username: value }));
  }

  updatePassword(value: string): void {
    this.credentials.update((c) => ({ ...c, password: value }));
  }

  onSubmit(): void {
    const creds = this.credentials();

    if (!creds.username || !creds.password) {
      this.errorMessage.set("Please fill in all fields");
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set("");

    this.authService.login(creds).subscribe({
      next: () => {
        this.router.navigate(["/"]);
      },
      error: (error) => {
        this.isLoading.set(false);
        // Handle FastAPI validation errors (422 status)
        if (
          error.status === 422 &&
          error.error?.detail &&
          Array.isArray(error.error.detail)
        ) {
          // Extract validation error messages
          const errorMessages = error.error.detail.map((err: any) => {
            const field =
              err.loc && err.loc.length > 1
                ? err.loc[err.loc.length - 1]
                : "field";
            return `${field}: ${err.msg}`;
          });
          this.errorMessage.set(errorMessages.join(", "));
        } else if (error.error?.detail) {
          // Handle other error formats
          if (typeof error.error.detail === "string") {
            this.errorMessage.set(error.error.detail);
          } else if (
            Array.isArray(error.error.detail) &&
            error.error.detail.length > 0
          ) {
            this.errorMessage.set(
              error.error.detail[0].msg || "Validation error"
            );
          } else {
            this.errorMessage.set("Login failed. Please try again.");
          }
        } else {
          this.errorMessage.set("Login failed. Please try again.");
        }
      },
    });
  }
}
