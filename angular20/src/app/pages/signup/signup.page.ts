import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { SignupRequest } from "../../models/user.model";
import { InfraonButtonComponent } from "../../components/button/button.component";
import { InfraonFormInputComponent } from "../../components/form-input/form-input.component";

@Component({
  selector: "app-signup-page",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InfraonButtonComponent,
    InfraonFormInputComponent,
  ],
  templateUrl: "./signup.page.html",
  styleUrls: ["./signup.page.css"],
})
export class SignupPage {
  userData = signal<SignupRequest>({
    username: "",
    email: "",
    password: "",
    full_name: "",
  });

  confirmPassword = signal<string>("");
  errorMessage = signal<string>("");
  isLoading = signal<boolean>(false);

  constructor(private authService: AuthService, private router: Router) {}

  updateFullName(value: string): void {
    this.userData.update((d) => ({ ...d, full_name: value }));
  }

  updateUsername(value: string): void {
    this.userData.update((d) => ({ ...d, username: value }));
  }

  updateEmail(value: string): void {
    this.userData.update((d) => ({ ...d, email: value }));
  }

  updatePassword(value: string): void {
    this.userData.update((d) => ({ ...d, password: value }));
  }

  updateConfirmPassword(value: string): void {
    this.confirmPassword.set(value);
  }

  onSubmit(): void {
    const data = this.userData();
    const confirm = this.confirmPassword();

    if (!data.username || !data.email || !data.password || !data.full_name) {
      this.errorMessage.set("Please fill in all fields");
      return;
    }

    if (data.password !== confirm) {
      this.errorMessage.set("Passwords do not match");
      return;
    }

    if (data.password.length < 6) {
      this.errorMessage.set("Password must be at least 6 characters long");
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set("");

    this.authService.signup(data).subscribe({
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
            this.errorMessage.set("Signup failed. Please try again.");
          }
        } else {
          this.errorMessage.set("Signup failed. Please try again.");
        }
      },
    });
  }
}


